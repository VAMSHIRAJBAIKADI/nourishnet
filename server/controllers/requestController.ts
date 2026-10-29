import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { RequestRecord, RequestStatus } from '../types';
import { broadcastRequestCreated, broadcastRequestUpdated, broadcastListingUpdated } from '../socket';

export async function getRequests(req: AuthenticatedRequest, res: Response) {
  try {
    let requests = await db.getRequests();

    if (req.user?.role === 'DONOR') {
      requests = requests.filter((r) => r.donorId === req.user?.userId);
    } else if (req.user?.role === 'RECIPIENT') {
      requests = requests.filter((r) => r.recipientId === req.user?.userId);
    }

    res.json({ requests });
  } catch (err: any) {
    console.error('getRequests error:', err);
    res.status(500).json({ error: 'Failed to retrieve donation requests.' });
  }
}

export async function createRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const recipient = await db.findUserById(req.user.userId);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient account not found.' });
      return;
    }

    const {
      listingId,
      requestedMeals,
      pickupVolunteer,
      volunteerPhone,
      vehicleType,
      pickupTime,
      notes
    } = req.body;

    if (!listingId || !requestedMeals || !pickupVolunteer) {
      res.status(400).json({ error: 'listingId, requestedMeals, and pickupVolunteer are required.' });
      return;
    }

    const listing = await db.findListingById(listingId);
    if (!listing) {
      res.status(404).json({ error: 'Target listing not found.' });
      return;
    }

    if (listing.status !== 'AVAILABLE') {
      res.status(400).json({ error: `Listing is not available for requests (Status: ${listing.status}).` });
      return;
    }

    const id = `req-${Date.now()}`;
    const pickupCode = `NOURISH-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: RequestRecord = {
      id,
      listingId: listing.id,
      listingTitle: listing.title,
      donorId: listing.donorId,
      donorName: listing.donorName,
      recipientId: recipient.id,
      recipientName: recipient.organizationDetails?.type || recipient.name,
      recipientPhone: volunteerPhone || recipient.organizationDetails?.phone || '(555) 000-0000',
      requestedMeals: Number(requestedMeals) || 1,
      pickupVolunteer: pickupVolunteer.trim(),
      volunteerPhone: (volunteerPhone || '').trim(),
      vehicleType: (vehicleType || 'Standard Vehicle with Insulated Coolers').trim(),
      pickupTime: pickupTime || new Date(Date.now() + 3600000).toISOString(),
      notes: (notes || '').trim(),
      status: 'PENDING',
      pickupCode,
      timestamp: new Date().toISOString()
    };

    await db.createRequest(newRequest);

    const updatedListing = await db.updateListing(listing.id, { status: 'REQUESTED' });

    broadcastRequestCreated(newRequest);
    if (updatedListing) broadcastListingUpdated(updatedListing);

    res.status(201).json({
      message: 'Donation request submitted to donor. Real-time alert dispatched.',
      request: newRequest
    });
  } catch (err: any) {
    console.error('createRequest error:', err);
    res.status(500).json({ error: 'Internal server error creating request.' });
  }
}

export async function updateRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, notes } = req.body;

    const request = await db.findRequestById(id);
    if (!request) {
      res.status(404).json({ error: 'Request not found.' });
      return;
    }

    const updates: Partial<RequestRecord> = {};
    const validStatuses: RequestStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

    if (status && validStatuses.includes(status)) {
      updates.status = status;
    }

    if (rejectionReason) updates.rejectionReason = rejectionReason;
    if (notes) updates.notes = notes;

    if (status === 'ACCEPTED') {
      await db.updateListing(request.listingId, { status: 'CLAIMED' });
    } else if (status === 'REJECTED' || status === 'CANCELLED') {
      await db.updateListing(request.listingId, { status: 'AVAILABLE' });
    } else if (status === 'COMPLETED') {
      updates.completedAt = new Date().toISOString();
      await db.updateListing(request.listingId, { status: 'CLAIMED' });
    }

    const updatedRequest = await db.updateRequest(id, updates);
    const updatedListing = await db.findListingById(request.listingId);

    if (updatedRequest) broadcastRequestUpdated(updatedRequest);
    if (updatedListing) broadcastListingUpdated(updatedListing);

    res.json({
      message: `Request status updated to ${status}.`,
      request: updatedRequest
    });
  } catch (err: any) {
    console.error('updateRequest error:', err);
    res.status(500).json({ error: 'Failed to update request.' });
  }
}
