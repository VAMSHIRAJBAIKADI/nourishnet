import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api, UserProfile } from '../../services/api';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building,
  Building2,
  Trash2,
  RotateCcw,
  Activity,
  Layers,
  Utensils,
  Leaf,
  Users,
  Lock,
  Database
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    auditLogs,
    adminMetrics,
    adminDeleteListing,
    adminVerifyOrg,
    refreshAdminData,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'moderation' | 'verifications' | 'logs' | 'analytics'>('moderation');

  // Moderation state
  const [moderationTargetListingId, setModerationTargetListingId] = useState<string | null>(null);
  const [moderationReason, setModerationReason] = useState('Packaging breached or potential temperature abuse reported');

  // Organizations list for verification queue
  const [organizations, setOrganizations] = useState<UserProfile[]>([]);
  const [selectedOrgToVerify, setSelectedOrgToVerify] = useState<UserProfile | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ database: string; mongoConnected: boolean } | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Load organizations for verification queue
  useEffect(() => {
    if (isAdmin) {
      setLoadingOrgs(true);
      api.admin.getOrganizations()
        .then((res) => setOrganizations(res.organizations))
        .catch((err) => console.error('Failed to load organizations:', err))
        .finally(() => setLoadingOrgs(false));

      api.system.getHealth()
        .then((res) => setDbStatus({ database: res.database, mongoConnected: res.mongoConnected }))
        .catch(() => {});
    }
  }, [isAdmin, auditLogs]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">403 Forbidden: Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Access to regulatory audit logs, organization verification, and platform moderation is strictly restricted to certified NourishNet Compliance Administrators.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-4 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Sign In with Admin Account (admin@nourishnet.org)
        </button>
      </div>
    );
  }

  const flaggedListings = listings.filter((l) => l.status === 'FLAGGED');
  const pendingOrgs = organizations.filter((o) => o.verifiedStatus === 'PENDING');

  const handleConfirmModeration = async () => {
    if (moderationTargetListingId) {
      try {
        await adminDeleteListing(moderationTargetListingId, moderationReason);
        setModerationTargetListingId(null);
      } catch (err: any) {
        addToast('Moderation action failed', err.message, 'error');
      }
    }
  };

  const handleVerificationDecision = async (decision: 'VERIFIED' | 'REJECTED') => {
    if (selectedOrgToVerify) {
      try {
        await adminVerifyOrg(
          selectedOrgToVerify.id,
          decision,
          reviewNotes || `Verified by Admin ${currentUser?.name} against municipal database.`
        );
        setSelectedOrgToVerify(null);
        setReviewNotes('');
        // Refresh local orgs
        const res = await api.admin.getOrganizations();
        setOrganizations(res.organizations);
      } catch (err: any) {
        addToast('Verification update failed', err.message, 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Platform Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Trust, Safety & Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            NourishNet Central Administration Console
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Logged in as <span className="font-semibold text-white">{currentUser?.name}</span>. Monitor real-time surplus food dispatch, enforce food safety compliance, moderate community listings, and verify non-profit 501(c)(3) tax status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {dbStatus && (
            <div
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border font-medium ${
                dbStatus.mongoConnected
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title={dbStatus.database}
            >
              <Database className={`w-3.5 h-3.5 ${dbStatus.mongoConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{dbStatus.mongoConnected ? 'MongoDB (Connected)' : 'Local File Store'}</span>
            </div>
          )}
          {flaggedListings.length > 0 && (
            <div className="bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{flaggedListings.length} Flagged Item(s)</span>
            </div>
          )}
          {pendingOrgs.length > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{pendingOrgs.length} Pending Verifications</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            Total Meals Saved & Delivered
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {adminMetrics?.totalMealsRescued || 45}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            across verified relief pickups
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            Active Surplus Listings
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {adminMetrics?.activeListingsCount || listings.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            broadcast across metro hubs
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Participating Organizations
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {organizations.length || 6}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {adminMetrics?.totalDonors || 3} Donors · {adminMetrics?.totalRecipients || 2} Recipient NGOs
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Emissions Diverted
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {adminMetrics?.co2TonsSaved || 0.45} Tons CO₂e
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            landfill diversion index 94.2%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Listing Moderation & Safety Review ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Organization Verification Queue</span>
          {pendingOrgs.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold tabular-nums">
              {pendingOrgs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Safety & Activity Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: LISTING MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                All Active Community Surplus Food Listings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect submissions and enforce removal of spoiled, mislabeled, or prohibited items with immutable audit logging.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Food Item</th>
                  <th className="py-2.5 px-4">Donor Org</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Est. Meals</th>
                  <th className="py-2.5 px-4">Expires</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((listing) => {
                  const isFlagged = listing.status === 'FLAGGED';
                  const isAvailable = listing.status === 'AVAILABLE';
                  const isClaimed = listing.status === 'CLAIMED';

                  return (
                    <tr
                      key={listing.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isFlagged ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{listing.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{listing.quantity}</div>
                        {isFlagged && listing.flagReason && (
                          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                            {listing.flagReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {listing.donorName}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600">
                        {listing.category}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {listing.estimatedMeals}
                      </td>
                      <td className="py-3 px-4 text-slate-600 tabular-nums">
                        {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {isFlagged ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Flagged / In Review
                          </span>
                        ) : isAvailable ? (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Live
                          </span>
                        ) : isClaimed ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Claimed
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">{listing.status}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setModerationTargetListingId(listing.id)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Listing</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATION VERIFICATION QUEUE */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Organization Compliance & Verification Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review food service permits, ServSafe credentials, and 501(c)(3) documentation. Non-verified donors cannot publish live listings until approved.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              {pendingOrgs.length} Pending Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Organization / Contact</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Submitted Credentials</th>
                  <th className="py-2.5 px-4">Registered Date</th>
                  <th className="py-2.5 px-4">Verification Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.map((org) => {
                  const isPending = org.verifiedStatus === 'PENDING';
                  const isVerified = org.verifiedStatus === 'VERIFIED';
                  const isRejected = org.verifiedStatus === 'REJECTED';

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {org.organizationDetails?.type || org.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {org.name} · {org.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {org.role === 'DONOR' ? 'Food Donor' : org.role === 'RECIPIENT' ? 'Recipient Charity' : 'Admin'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {org.organizationDetails?.foodSafetyCert || org.organizationDetails?.taxExemptId || 'Standard Documentation'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          License: {org.organizationDetails?.licenseNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums">
                        {new Date(org.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Pending Audit
                          </span>
                        )}
                        {isVerified && (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrgToVerify(org)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Review & Decide
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Regulatory Compliance Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable chronological log of all administrator actions, moderation removals, and organization verifications.
              </p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => {
              const date = new Date(log.timestamp);
              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors text-xs flex items-start gap-4">
                  <div className="font-mono text-slate-400 text-[11px] tabular-nums whitespace-nowrap pt-0.5">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 font-medium">By Admin: {log.adminName}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Moderation Removal Modal */}
      {moderationTargetListingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Remove Inappropriate Surplus Listing</span>
            </div>
            <p className="text-slate-600">
              Removing this item will immediately unpublish it from all connected clients via Socket.io and record an immutable event in the audit trail.
            </p>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Select Violation / Safety Reason:
              </label>
              <select
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Packaging breached or potential temperature abuse reported">Packaging breached or potential temperature abuse reported</option>
                <option value="Missing required allergen disclosures for high-risk prepared item">Missing required allergen disclosures for high-risk prepared item</option>
                <option value="Item exceeds safe shelf-life / past safe consumption window">Item exceeds safe shelf-life / past safe consumption window</option>
                <option value="Prohibited item (Alcohol, prepared shellfish without inspection)">Prohibited item (Alcohol, prepared shellfish without inspection)</option>
                <option value="Listing contains inappropriate or non-food content">Listing contains inappropriate or non-food content</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModerationTargetListingId(null)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModeration}
                className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Removal & Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Decision Modal */}
      {selectedOrgToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">
              Review Organization Verification
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Organization:</span>
                <span className="font-bold text-slate-900 block">{selectedOrgToVerify.organizationDetails?.type || selectedOrgToVerify.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Role:</span>
                <span className="font-medium text-slate-800 block">{selectedOrgToVerify.role}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Compliance Officer Audit Notes:
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Verified against state department of public health establishment registry."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrgToVerify(null)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerificationDecision('REJECTED')}
                className="px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
              >
                Reject Permit
              </button>
              <button
                onClick={() => handleVerificationDecision('VERIFIED')}
                className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
              >
                Approve & Grant Verified Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
