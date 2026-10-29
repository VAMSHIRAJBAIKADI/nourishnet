import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { ListingRecord, ListingStatus, StorageType } from '../types';
import { broadcastListingCreated, broadcastListingUpdated, broadcastListingDeleted, broadcastAuditLogged } from '../socket';

export async function getListings(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, status, search, donorId } = req.query;
    let listings = await db.getListings();

    // Auto-expire listings whose expiryTime has passed
    const now = new Date();
    for (const l of listings) {
      if (l.status === 'AVAILABLE' && new Date(l.expiryTime) < now) {
        await db.updateListing(l.id, { status: 'EXPIRED' });
        l.status = 'EXPIRED';
      }
    }

    if (category && typeof category === 'string' && category !== 'all') {
      listings = listings.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      listings = listings.filter((l) => l.status === status.toUpperCase());
    }

    if (donorId && typeof donorId === 'string') {
      listings = listings.filter((l) => l.donorId === donorId);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.donorName.toLowerCase().includes(q) ||
          l.allergens.some((a) => a.toLowerCase().includes(q))
      );
    }

    res.json({ listings });
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

    const donor = await db.findUserById(req.user.userId);
    if (!donor) {
      res.status(404).json({ error: 'Donor user account not found.' });
      return;
    }

    const {
      title,
      description,
      category,
      quantity,
      estimatedMeals,
      weightKg,
      prepareTime,
      expiryTime,
      locationAddress,
      neighborhood,
      storageType,
      dietaryTags,
      allergens,
      pickupWindowStart,
      pickupWindowEnd,
      pickupInstructions,
      imageUrl
    } = req.body;

    // Strict Server-Side Validation: Expiry must be in the future
    if (!expiryTime || new Date(expiryTime).getTime() <= Date.now()) {
      res.status(400).json({
        error: 'Food Safety Validation Failed: Expiry time must be strictly set to a future timestamp.'
      });
      return;
    }

    if (!title || !quantity || !category) {
      res.status(400).json({ error: 'Title, quantity, and category are required.' });
      return;
    }

    const id = `list-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const isDonorVerified = donor.verifiedStatus === 'VERIFIED';
    const initialStatus: ListingStatus = isDonorVerified ? 'AVAILABLE' : 'FLAGGED';
    const flagReason = isDonorVerified
      ? undefined
      : 'Awaiting Admin Verification: Organization credentials currently under compliance review.';

    const newListing: ListingRecord = {
      id,
      donorId: donor.id,
      donorName: donor.organizationDetails?.type || donor.name,
      donorVerified: isDonorVerified,
      title: title.trim(),
      description: (description || '').trim(),
      category: category.toLowerCase().trim(),
      quantity: quantity.trim(),
      estimatedMeals: Number(estimatedMeals) || 10,
      weightKg: Number(weightKg) || 5,
      prepareTime: prepareTime || nowIso,
      expiryTime: new Date(expiryTime).toISOString(),
      locationAddress: locationAddress || donor.organizationDetails?.address || 'Metro Area',
      neighborhood: neighborhood || donor.organizationDetails?.neighborhood || 'Downtown',
      storageType: (storageType || 'REFRIGERATED') as StorageType,
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
      allergens: Array.isArray(allergens) ? allergens : [],
      pickupWindowStart: pickupWindowStart || nowIso,
      pickupWindowEnd: pickupWindowEnd || new Date(Date.now() + 4 * 3600000).toISOString(),
      pickupInstructions: pickupInstructions || 'Check with kitchen receiving dock.',
      imageUrl,
      status: initialStatus,
      flagReason,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await db.createListing(newListing);

    // Real-Time WebSocket broadcast
    broadcastListingCreated(newListing);

    res.status(201).json({
      message: isDonorVerified
        ? 'Listing successfully published and broadcast to relief networks.'
        : 'Listing created and queued for Admin safety compliance verification.',
      listing: newListing
    });
  } catch (err: any) {
    console.error('createListing error:', err);
    res.status(500).json({ error: 'Internal server error creating listing.' });
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

    if (req.user?.role !== 'ADMIN' && req.user?.userId !== listing.donorId) {
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

    res.json({ message: 'Listing status updated.', listing: updated });
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
      adminId: admin.userId,
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
