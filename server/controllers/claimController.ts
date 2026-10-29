import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { ClaimRecord, ClaimStatus } from '../types';
import { broadcastRequestCreated, broadcastListingUpdated } from '../socket';

export async function createClaim(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      return;
    }

    const recipient = await db.findUserById(req.user.userId || req.user.id || '');
    if (!recipient) {
      res.status(404).json({ error: 'Recipient account not found.' });
      return;
    }

    const listingId = req.body.listing_id || req.body.listingId;
    const { notes, requestedMeals, pickupTime, pickupVolunteer, volunteerPhone, vehicleType } = req.body;

    if (!listingId) {
      res.status(400).json({ error: 'listing_id is required to claim a surplus food listing.' });
      return;
    }

    const listing = await db.findListingById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Target food listing not found.' });
      return;
    }

    if (listing.status !== 'LIVE' && listing.status !== 'AVAILABLE') {
      res.status(400).json({
        error: `Listing cannot be claimed. Current status is ${listing.status}.`
      });
      return;
    }

    const id = `claim-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newClaim: ClaimRecord = {
      id,
      listing_id: listing.id,
      listingId: listing.id,
      recipient_id: recipient.id,
      recipientId: recipient.id,
      status: 'PENDING' as ClaimStatus,
      claimed_at: nowIso,
      timestamp: nowIso,
      listingTitle: listing.title,
      donorId: listing.donorId || listing.donor_id,
      donorName: listing.donorName,
      recipientName: recipient.organizationName || recipient.organizationDetails?.type || recipient.name,
      notes: (notes || '').trim()
    };

    await db.createClaim(newClaim);

    // Also update listing status to CLAIMED
    const updatedListing = await db.updateListing(listing.id, {
      status: 'CLAIMED'
    });

    // Also mirror to request store for backward compatibility
    const pickupCode = `NOURISH-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest = {
      id: `req-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      donorId: listing.donorId || listing.donor_id || '',
      donorName: listing.donorName,
      recipientId: recipient.id,
      recipientName: newClaim.recipientName || recipient.name,
      recipientPhone: volunteerPhone || recipient.organizationDetails?.phone || '(555) 000-0000',
      requestedMeals: Number(requestedMeals) || listing.quantity_portions || listing.estimatedMeals || 10,
      pickupVolunteer: pickupVolunteer ? pickupVolunteer.trim() : recipient.name,
      volunteerPhone: (volunteerPhone || recipient.organizationDetails?.phone || '').trim(),
      vehicleType: (vehicleType || 'Refrigerated Transport / Volunteer Vehicle').trim(),
      pickupTime: pickupTime || new Date(Date.now() + 3600000).toISOString(),
      notes: (notes || '').trim(),
      status: 'PENDING' as const,
      pickupCode,
      timestamp: nowIso
    };
    await db.createRequest(newRequest);

    broadcastRequestCreated(newRequest);
    if (updatedListing) {
      broadcastListingUpdated(updatedListing);
    }

    res.status(201).json({
      message: 'Surplus food listing successfully claimed. Donor notified in real-time.',
      claim: newClaim,
      listing: updatedListing
    });
  } catch (err: any) {
    console.error('createClaim error:', err);
    res.status(500).json({ error: 'Internal server error processing claim.' });
  }
}

export async function getClaims(req: AuthenticatedRequest, res: Response) {
  try {
    let claims = await db.getClaims();
    const currentUserId = req.user?.userId || req.user?.id;
    const userRole = req.user?.role;

    if (userRole === 'RECIPIENT' || userRole === 'RECIPIENT_NGO') {
      claims = claims.filter((c) => c.recipient_id === currentUserId || c.recipientId === currentUserId);
    } else if (userRole === 'DONOR') {
      claims = claims.filter((c) => c.donorId === currentUserId);
    }

    res.json({ claims });
  } catch (err: any) {
    console.error('getClaims error:', err);
    res.status(500).json({ error: 'Failed to retrieve food claims.' });
  }
}

export async function updateClaimStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: ClaimStatus[] = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid claim status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const claim = await db.findClaimById(id);
    if (!claim) {
      res.status(404).json({ error: 'Claim not found.' });
      return;
    }

    const updated = await db.updateClaim(id, { status });
    res.json({ message: 'Claim status updated.', claim: updated });
  } catch (err: any) {
    console.error('updateClaimStatus error:', err);
    res.status(500).json({ error: 'Failed to update claim status.' });
  }
}
