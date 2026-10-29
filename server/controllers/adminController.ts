import { Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { VerifiedStatus } from '../types';
import { broadcastAuditLogged, broadcastListingUpdated } from '../socket';

export async function getAdminMetrics(req: AuthenticatedRequest, res: Response) {
  try {
    const listings = await db.getListings();
    const requests = await db.getRequests();
    const users = await db.getUsers();

    const donors = users.filter((u) => u.role === 'DONOR');
    const recipients = users.filter((u) => u.role === 'RECIPIENT');
    const completedRequests = requests.filter((r) => r.status === 'COMPLETED');

    const totalMealsRescued = completedRequests.reduce((acc, r) => acc + r.requestedMeals, 0);
    const activeListings = listings.filter((l) => l.status === 'AVAILABLE' || l.status === 'REQUESTED');
    const totalWeightKg = listings.reduce((acc, l) => acc + l.weightKg, 0);
    const co2TonsSaved = Number(((totalWeightKg * 2.5) / 1000).toFixed(2));

    const pendingVerifications = users.filter((u) => u.verifiedStatus === 'PENDING').length;
    const flaggedListingsCount = listings.filter((l) => l.status === 'FLAGGED').length;

    res.json({
      metrics: {
        totalListings: listings.length,
        activeListingsCount: activeListings.length,
        totalMealsRescued,
        totalDonors: donors.length,
        totalRecipients: recipients.length,
        totalWeightKg: Math.round(totalWeightKg),
        co2TonsSaved,
        pendingVerifications,
        flaggedListingsCount
      }
    });
  } catch (err: any) {
    console.error('getAdminMetrics error:', err);
    res.status(500).json({ error: 'Failed to compute admin metrics.' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await db.getAuditLogs();
    res.json({ auditLogs: logs });
  } catch (err: any) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
}

export async function updateOrganizationVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;

    const user = await db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User / organization not found.' });
      return;
    }

    const validStatuses: VerifiedStatus[] = ['VERIFIED', 'REJECTED', 'PENDING'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid verification status.' });
      return;
    }

    await db.updateUser(userId, { verifiedStatus: status });

    // If verified, any pending listings from this donor are made AVAILABLE
    if (status === 'VERIFIED') {
      const allListings = await db.getListings();
      const donorListings = allListings.filter((l) => l.donorId === userId && l.status === 'FLAGGED');
      for (const listing of donorListings) {
        const updated = await db.updateListing(listing.id, {
          status: 'AVAILABLE',
          donorVerified: true,
          flagReason: undefined
        });
        if (updated) broadcastListingUpdated(updated);
      }
    }

    const admin = req.user!;
    const auditLog = await db.createAuditLog({
      id: `log-${Date.now()}`,
      adminId: admin.userId,
      adminName: admin.name,
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER',
      targetId: user.id,
      details: `Admin ${admin.name} set verification status to ${status} for "${user.organizationDetails?.type || user.name}". Notes: ${notes || 'Verified against health inspection database.'}`,
      timestamp: new Date().toISOString()
    });

    broadcastAuditLogged(auditLog);

    res.json({
      message: `Organization verification updated to ${status}.`,
      user: { ...user, verifiedStatus: status },
      auditLog
    });
  } catch (err: any) {
    console.error('updateOrganizationVerification error:', err);
    res.status(500).json({ error: 'Failed to update organization verification.' });
  }
}

export async function getOrganizations(req: AuthenticatedRequest, res: Response) {
  try {
    const users = (await db.getUsers()).map(({ passwordHash: _, ...safeUser }) => safeUser);
    res.json({ organizations: users });
  } catch (err: any) {
    console.error('getOrganizations error:', err);
    res.status(500).json({ error: 'Failed to retrieve organizations.' });
  }
}
