import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiListing, ApiRequest } from '../../services/api';
import { CreateListingModal } from './CreateListingModal';
import {
  Plus,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Truck,
  Trash2,
  Building,
  ShieldCheck,
  ShieldAlert,
  Save,
  Check,
  Utensils,
  Leaf,
  Lock
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    requests,
    updateListingStatus,
    updateRequestStatus,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'history' | 'profile'>('listings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Schedule mismatch / pickup window passed');

  // RBAC Access Guard: if user is not logged in or not a DONOR
  const isDonor = currentUser?.role === 'DONOR';

  // Filter listings and requests for this donor
  const donorListings = currentUser
    ? listings.filter((l) => l.donorId === currentUser.id)
    : [];

  const activeListings = donorListings.filter(
    (l) => l.status === 'AVAILABLE' || l.status === 'REQUESTED' || l.status === 'CLAIMED' || l.status === 'FLAGGED'
  );

  const donorRequests = currentUser
    ? requests.filter((r) => r.donorId === currentUser.id)
    : [];

  const pendingRequests = donorRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = donorRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = donorRequests.filter((r) => r.status === 'COMPLETED');

  // Metrics
  const totalMealsDonated = completedRequests.reduce((acc, r) => acc + r.requestedMeals, 0);
  const totalMealsInCirculation = donorListings.reduce((acc, l) => acc + l.estimatedMeals, 0);
  const totalWeightKg = donorListings.reduce((acc, l) => acc + l.weightKg, 0);
  const estimatedCo2Kg = Math.round(totalWeightKg * 2.5);

  const handleCancelListing = async (listingId: string) => {
    try {
      await updateListingStatus(listingId, 'CANCELLED');
    } catch (err: any) {
      addToast('Failed to cancel listing', err.message, 'error');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'ACCEPTED');
    } catch (err: any) {
      addToast('Failed to accept request', err.message, 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (rejectingRequestId) {
      try {
        await updateRequestStatus(rejectingRequestId, 'REJECTED', rejectionReason);
        setRejectingRequestId(null);
      } catch (err: any) {
        addToast('Failed to decline request', err.message, 'error');
      }
    }
  };

  if (!isAuthenticated || !isDonor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Donor Access Required</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {isAuthenticated
            ? `You are currently authenticated as "${currentUser?.name}" with role [${currentUser?.role}]. Please switch to a verified Food Donor account to manage kitchen surplus.`
            : 'Please authenticate with your food donor account to publish surplus listings and review incoming non-profit requests.'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-4 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Sign In as Verified Donor
        </button>
      </div>
    );
  }

  const isVerified = currentUser?.verifiedStatus === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Donor Banner & Primary Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>Donor Dispatch Console</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              {isVerified ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Food Service Donor
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pending Health Permit Verification
                </span>
              )}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentUser.organizationDetails?.type || currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {currentUser.organizationDetails?.description || 'Commercial food establishment coordinating surplus recovery under Good Samaritan standards.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Surplus Listing</span>
        </button>
      </div>

      {/* Verification Warning Notice if unverified */}
      {!isVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950 block">Organization Verification In Progress:</span>
            Your food establishment permit is currently under administrative audit. New listings you post will be automatically held in the admin moderation queue before public broadcast.
          </div>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            Meals Rescued & Completed
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {totalMealsDonated}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            from {completedRequests.length} verified pickups
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Recipient Requests
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            awaiting your approval
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-sky-600" />
            Active Food Listings
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {activeListings.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalMealsInCirculation} total meals listed
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Landfill CO₂e Avoided
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            {estimatedCo2Kg} kg
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            ~{totalWeightKg.toFixed(0)} kg food diverted
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Listings ({activeListings.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Incoming Requests</span>
          {pendingRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold tabular-nums">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Donation History ({completedRequests.length})
        </button>
      </div>

      {/* TAB CONTENT 1: ACTIVE LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {activeListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No active surplus listings right now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Got extra prepared pans, surplus bakery items, or excess inventory? List them to notify local community relief networks immediately.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeListings.map((listing) => {
                const expiresAt = new Date(listing.expiryTime);
                const isExpiringSoon = expiresAt.getTime() - Date.now() < 3600000 * 4;

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top metadata */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                          {listing.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{listing.storageType.toLowerCase()}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            isExpiringSoon ? 'text-rose-600 font-mono tabular-nums' : 'text-slate-600'
                          }`}
                        >
                          Use by: {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>

                      <div className="mt-3.5 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Quantity</span>
                          <span className="font-semibold text-slate-900">{listing.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Meals / Weight</span>
                          <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                            {listing.estimatedMeals} meals · {listing.weightKg} kg
                          </span>
                        </div>
                      </div>

                      {listing.flagReason && (
                        <div className="mt-2.5 p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 font-medium">
                          {listing.flagReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-500">
                        {listing.status === 'CLAIMED' ? (
                          <span className="text-emerald-700 font-semibold">Claimed & Reserved</span>
                        ) : listing.status === 'REQUESTED' ? (
                          <span className="text-amber-600 font-semibold">Pending Request</span>
                        ) : listing.status === 'FLAGGED' ? (
                          <span className="text-amber-700 font-semibold">In Moderation</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Live & Available</span>
                        )}
                      </span>

                      <button
                        onClick={() => handleCancelListing(listing.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: INCOMING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {donorRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No incoming donation requests yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When a verified shelter or food bank requests one of your active listings, their pickup vehicle, volunteer driver, and arrival time will show up here via real-time WebSocket sync.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {donorRequests.map((request) => {
                const isPending = request.status === 'PENDING';
                const isAccepted = request.status === 'ACCEPTED';
                const isCompleted = request.status === 'COMPLETED';
                const isRejected = request.status === 'REJECTED';

                return (
                  <div
                    key={request.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                      isPending
                        ? 'border-amber-300 ring-1 ring-amber-200/60'
                        : isAccepted
                        ? 'border-emerald-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-900 text-sm">
                            {request.recipientName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            {request.requestedMeals} meals requested
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-700">
                          For listing: <span className="text-slate-900 font-bold">{request.listingTitle}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Volunteer Driver / Contact</span>
                            <span className="font-medium text-slate-800">{request.pickupVolunteer}</span>
                            <span className="text-slate-500 block text-[11px]">{request.volunteerPhone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Vehicle & Pickup Time</span>
                            <span className="font-medium text-slate-800">{request.vehicleType}</span>
                            <span className="text-slate-500 block text-[11px]">
                              {new Date(request.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded border border-amber-100">
                            "{request.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                        <div>
                          {isPending && (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                              Action Required: Pending
                            </span>
                          )}
                          {isAccepted && (
                            <div className="text-right">
                              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md block">
                                Accepted · Awaiting Pickup
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-700 mt-1 block">
                                Verification PIN: {request.pickupCode}
                              </span>
                            </div>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                              Completed & Collected
                            </span>
                          )}
                          {isRejected && (
                            <div className="text-right">
                              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md block">
                                Declined
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block max-w-xs">
                                {request.rejectionReason}
                              </span>
                            </div>
                          )}
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => setRejectingRequestId(request.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: DONATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Completed Surplus Donations Log
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Total Meals: {totalMealsDonated}
            </span>
          </div>

          {completedRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No donations marked as completed yet. Once a recipient confirms collection, records will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date Completed</th>
                    <th className="py-2.5 px-4">Food Item</th>
                    <th className="py-2.5 px-4">Recipient Charity</th>
                    <th className="py-2.5 px-4 text-right">Meals</th>
                    <th className="py-2.5 px-4 text-right">Pickup Code</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                        {req.completedAt
                          ? new Date(req.completedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Completed'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.listingTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {req.recipientName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                        {req.requestedMeals}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {req.pickupCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Verified Receipt
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rejection Dialog Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Decline Donation Request
            </h3>
            <p className="text-xs text-slate-600">
              Please specify a reason to inform the recipient organization:
            </p>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800"
            >
              <option value="Pickup window expired / kitchen closing">Pickup window expired / kitchen closing</option>
              <option value="Food committed to another urgent emergency relief order">Food committed to another urgent emergency relief order</option>
              <option value="Vehicle lacks required cold-chain refrigeration for this item">Vehicle lacks required cold-chain refrigeration for this item</option>
              <option value="Quantity requested exceeds available remaining inventory">Quantity requested exceeds available remaining inventory</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
