import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { ListingRecord, ListingStatus, StorageType } from '../types';
import { broadcastListingCreated, broadcastListingUpdated, broadcastListingDeleted, broadcastAuditLogged } from '../socket';

// Helper to format listing with both snake_case and camelCase fields
export function formatListing(l: ListingRecord): any {
  const statusNormalized: ListingStatus = l.status === 'AVAILABLE' ? 'LIVE' : l.status;
  const storageTemp = l.storage_temp || (
    l.storageType === 'REFRIGERATED' ? 'Refrigerated' :
    l.storageType === 'FROZEN' ? 'Frozen' :
    l.storageType === 'AMBIENT' ? 'Ambient' : 'Refrigerated'
  );

  return {
    ...l,
    id: l.id,
    donor_id: l.donor_id || l.donorId,
    donorId: l.donorId || l.donor_id,
    title: l.title,
    category: (l.category || 'PREPARED').toUpperCase(),
    storage_temp: storageTemp,
    storageType: l.storageType || 'REFRIGERATED',
    quantity_portions: l.quantity_portions || l.estimatedMeals || 10,
    quantity: l.quantity || `${l.quantity_portions || 10} portions`,
    estimatedMeals: l.estimatedMeals || l.quantity_portions || 10,
    weight_kg: l.weight_kg !== undefined ? l.weight_kg : l.weightKg,
    weightKg: l.weightKg !== undefined ? l.weightKg : (l.weight_kg || 5),
    expiry_timestamp: l.expiry_timestamp || l.expiryTime,
    expiryTime: l.expiryTime || l.expiry_timestamp,
    status: statusNormalized,
    created_at: l.created_at || l.createdAt,
    createdAt: l.createdAt || l.created_at
  };
}

export async function getListings(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, status, search, donorId, role } = req.query;
    let listings = await db.getListings();

    // Auto-expire listings whose expiryTime has passed
    const now = new Date();
    for (const l of listings) {
      const expDate = new Date(l.expiry_timestamp || l.expiryTime);
      if ((l.status === 'LIVE' || l.status === 'AVAILABLE') && expDate < now) {
        await db.updateListing(l.id, { status: 'EXPIRED' });
        l.status = 'EXPIRED';
      }
    }

    // Role-based filtering:
    // If requester is a Recipient NGO, prioritize live/available listings
    const userRole = req.user?.role || (typeof role === 'string' ? role.toUpperCase() : undefined);
    if (userRole === 'RECIPIENT' || userRole === 'RECIPIENT_NGO') {
      if (!status) {
        listings = listings.filter((l) => l.status === 'LIVE' || l.status === 'AVAILABLE');
      }
    }

    if (category && typeof category === 'string' && category !== 'all') {
      listings = listings.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      const targetStatus = status.toUpperCase();
      listings = listings.filter((l) => {
        if (targetStatus === 'LIVE' || targetStatus === 'AVAILABLE') {
          return l.status === 'LIVE' || l.status === 'AVAILABLE';
        }
        if (targetStatus === 'WITHDRAWN' || targetStatus === 'CANCELLED') {
          return l.status === 'WITHDRAWN' || l.status === 'CANCELLED';
        }
        if (targetStatus === 'CLAIMED' || targetStatus === 'REQUESTED') {
          return l.status === 'CLAIMED' || l.status === 'REQUESTED';
        }
        return l.status === targetStatus;
      });
    }

    if (donorId && typeof donorId === 'string') {
      listings = listings.filter((l) => l.donorId === donorId || l.donor_id === donorId);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.donorName.toLowerCase().includes(q) ||
          (l.allergens && l.allergens.some((a) => a.toLowerCase().includes(q)))
      );
    }

    const formatted = listings.map(formatListing);
    res.json({ listings: formatted });
  } catch (err: any) {
    console.error('getListings error:', err);
    res.status(500).json({ error: 'Failed to retrieve food listings.' });
  }
}

export async function createListing(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const donor = await db.findUserById(req.user.userId || req.user.id || '');
    if (!donor) {
      res.status(404).json({ error: 'Donor user account not found.' });
      return;
    }

    const {
      title,
      description,
      category,
      quantity,
      quantity_portions,
      estimatedMeals,
      weight_kg,
      weightKg,
      prepareTime,
      expiryTime,
      expiry_timestamp,
      locationAddress,
      neighborhood,
      storage_temp,
      storageType,
      dietaryTags,
      allergens,
      pickupWindowStart,
      pickupWindowEnd,
      pickupInstructions,
      imageUrl
    } = req.body;

    const finalExpiry = expiry_timestamp || expiryTime;

    // Strict Server-Side Validation: Expiry must be in the future
    if (!finalExpiry || new Date(finalExpiry).getTime() <= Date.now()) {
      res.status(400).json({
        error: 'Food Safety Validation Failed: Expiry time must be strictly set to a future timestamp.'
      });
      return;
    }

    if (!title) {
      res.status(400).json({ error: 'Listing title is required.' });
      return;
    }

    const id = `list-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const expiryIso = new Date(finalExpiry).toISOString();

    const portions = Number(quantity_portions) || Number(estimatedMeals) || 10;
    const finalWeight = Number(weight_kg !== undefined ? weight_kg : (weightKg !== undefined ? weightKg : 5));
    const finalQuantity = quantity || `${portions} portions`;
    const finalCategory = (category || 'PREPARED').toUpperCase();
    const finalStorageTemp = storage_temp || 'Refrigerated';

    const isDonorVerified = donor.verifiedStatus === 'VERIFIED' || donor.verified_status === 'VERIFIED';
    const initialStatus: ListingStatus = 'LIVE';

    const newListing: ListingRecord = {
      id,
      donor_id: donor.id,
      donorId: donor.id,
      donorName: donor.organizationDetails?.type || donor.organizationName || donor.name,
      donorVerified: isDonorVerified,
      title: title.trim(),
      description: (description || '').trim(),
      category: finalCategory,
      storage_temp: finalStorageTemp,
      storageType: (storageType || 'REFRIGERATED') as StorageType,
      quantity: finalQuantity,
      quantity_portions: portions,
      estimatedMeals: portions,
      weight_kg: finalWeight,
      weightKg: finalWeight,
      prepareTime: prepareTime || nowIso,
      expiry_timestamp: expiryIso,
      expiryTime: expiryIso,
      locationAddress: locationAddress || donor.organizationDetails?.address || 'Metro Area',
      neighborhood: neighborhood || donor.organizationDetails?.neighborhood || 'Downtown',
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
      allergens: Array.isArray(allergens) ? allergens : [],
      pickupWindowStart: pickupWindowStart || nowIso,
      pickupWindowEnd: pickupWindowEnd || new Date(Date.now() + 4 * 3600000).toISOString(),
      pickupInstructions: pickupInstructions || 'Check with kitchen receiving dock.',
      imageUrl: imageUrl || '/src/assets/images/hero_surplus_food_1793181935977.jpg',
      status: initialStatus,
      createdAt: nowIso,
      created_at: nowIso,
      updatedAt: nowIso
    };

    await db.createListing(newListing);

    // Real-Time WebSocket broadcast
    broadcastListingCreated(newListing);

    res.status(201).json({
      message: 'Listing successfully published and broadcast to relief networks.',
      listing: formatListing(newListing)
    });
  } catch (err: any) {
    console.error('createListing error:', err);
    res.status(500).json({ error: 'Internal server error creating listing.' });
  }
}

export async function withdrawListing(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const listing = await db.findListingById(id);
    if (!listing) {
      res.status(404).json({ error: 'Target listing not found.' });
      return;
    }

    const currentUserId = req.user?.userId || req.user?.id;
    const isOwner = listing.donorId === currentUserId || listing.donor_id === currentUserId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Forbidden: Only the posting donor or an administrator can withdraw this listing.' });
      return;
    }

    const updated = await db.updateListing(id, {
      status: 'WITHDRAWN'
    });

    if (updated) {
      broadcastListingUpdated(updated);
    }

    res.json({
      message: 'Listing successfully withdrawn from surplus dispatch.',
      listing: updated ? formatListing(updated) : undefined
    });
  } catch (err: any) {
    console.error('withdrawListing error:', err);
    res.status(500).json({ error: 'Failed to withdraw listing.' });
  }
}

export async function updateListingStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, flagReason } = req.body;

    const listing = await db.findListingById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    const currentUserId = req.user?.userId || req.user?.id;
    if (req.user?.role !== 'ADMIN' && currentUserId !== listing.donorId && currentUserId !== listing.donor_id) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to modify this listing.' });
      return;
    }

    const updated = await db.updateListing(id, {
      status,
      flagReason: flagReason !== undefined ? flagReason : listing.flagReason
    });

    if (updated) {
      broadcastListingUpdated(updated);
    }

    res.json({ message: 'Listing status updated.', listing: updated ? formatListing(updated) : undefined });
  } catch (err: any) {
    console.error('updateListingStatus error:', err);
    res.status(500).json({ error: 'Failed to update listing status.' });
  }
}

export async function adminDeleteListing(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await db.findListingById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found.' });
      return;
    }

    const admin = req.user!;
    const logDetails = `Admin ${admin.name} removed listing "${listing.title}" (ID: ${listing.id}). Reason: ${reason || 'Safety/policy violation'}`;

    const auditLog = await db.createAuditLog({
      id: `log-${Date.now()}`,
      adminId: admin.userId || admin.id || 'admin',
      adminName: admin.name,
      action: 'LISTING_MODERATED',
      targetType: 'LISTING',
      targetId: listing.id,
      details: logDetails,
      timestamp: new Date().toISOString()
    });

    await db.deleteListing(id);

    broadcastListingDeleted(id);
    broadcastAuditLogged(auditLog);

    res.json({ message: 'Listing removed by administrator and recorded in audit log.', auditLog });
  } catch (err: any) {
    console.error('adminDeleteListing error:', err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
}
