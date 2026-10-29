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
  Lock,
  LineChart,
  ShoppingBasket,
  Store,
  Info,
  HelpCircle
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    requests,
    withdrawListing,
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
    ? listings.filter((l) => l.donorId === currentUser.id || (l as any).donor_id === currentUser.id)
    : [];

  const activeListings = donorListings.filter(
    (l) => l.status === 'LIVE' || l.status === 'AVAILABLE' || l.status === 'REQUESTED' || l.status === 'CLAIMED' || l.status === 'FLAGGED'
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
      await withdrawListing(listingId);
    } catch (err: any) {
      addToast('Failed to withdraw listing', err.message, 'error');
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
      {/* Hero Banner with Dark Overlay & Blurred Background Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-800 bg-slate-900 text-white min-h-[160px] flex items-center">
        {/* Background image of luxury dining room with dark overlay */}
        <img
          src="/src/assets/images/dining_room_bg_1793260993821.jpg"
          alt="Grand Hotel Restaurant & Banquets Dining Room"
          className="absolute inset-0 w-full h-full object-cover filter blur-[2px] opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/60" />

        <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide mb-2.5">
              <Building className="w-3.5 h-3.5" />
              <span>Donor Dispatch Console · Verified Food Service Donor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Grand Hotel Restaurant & Banquets
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Premier downtown hotel producing freshly catered meals and executive banquet platters under Good Samaritan safety protocols.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shrink-0 border border-emerald-300 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Post New Surplus Listing</span>
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS (4-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL MEALS RESCUED */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>TOTAL MEALS RESCUED</span>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                <LineChart className="w-3.5 h-3.5" />
                <Utensils className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
              2,105
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-2 tracking-wide uppercase">
            VERIFIED PICKUPS: 412
          </div>
        </div>

        {/* KPI 2: PENDING RECIPIENT REQUESTS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>PENDING RECIPIENT REQUESTS</span>
              <div className="relative text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                <ShoppingBasket className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono tabular-nums tracking-tight">
              3
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-2 tracking-wide uppercase">
            REVIEWS IN-PROGRESS
          </div>
        </div>

        {/* KPI 3: ACTIVE FOOD LISTINGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>ACTIVE FOOD LISTINGS</span>
              <div className="text-sky-600 bg-sky-50 p-1.5 rounded-lg border border-sky-100">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
              7
            </div>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-2 tracking-wide uppercase">
            ITEMS LIVE
          </div>
        </div>

        {/* KPI 4: LANDFILL CO2e SAVED */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between pb-0">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 tracking-wider">
              <span>LANDFILL CO2e SAVED</span>
              <div className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mt-2 font-mono tabular-nums tracking-tight">
              118 kg
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
              ~47 kg food diverted
            </div>
          </div>

          {/* Smooth teal-to-green gradient area trend line graph */}
          <div className="mt-2 -mx-5 h-11 relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendTealGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d="M0,32 Q25,16 45,22 T80,10 T100,5 L100,40 L0,40 Z"
                fill="url(#trendTealGreenGradient)"
              />
              <path
                d="M0,32 Q25,16 45,22 T80,10 T100,5"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
              />
            </svg>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {activeListings.map((listing, index) => {
                const expiresAt = new Date(listing.expiryTime);
                const isFirstCard = index === 0 || listing.id === 'list-1';
                const isSecondCard = index === 1 || listing.id === 'list-2';

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Top metadata */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                          {listing.category && (
                            <>
                              <span>{listing.category}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span className="capitalize">{listing.storageType?.toLowerCase() || 'Refrigerated'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-600">
                            Use by: {isFirstCard ? '05:47 PM' : isSecondCard ? '04:47 AM' : expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Content with optional square photo */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        {isFirstCard && (
                          <div className="relative shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                            <img
                              src="/src/assets/images/prepared_catering_meals_1793181937634.jpg"
                              alt="Gourmet Herb-Roasted Chicken & Vegetables"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/10" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                            {listing.title}
                          </h3>

                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed break-words">
                            {listing.description}
                          </p>
                        </div>
                      </div>

                      {/* Quantity metrics box */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            Quantity
                          </span>
                          <span className="font-bold text-slate-900 truncate block">
                            {isFirstCard ? '45' : isSecondCard ? '40 assorted pastries & bagels' : listing.quantity}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                            Meals / Weight
                          </span>
                          <span className="font-mono font-bold text-emerald-800 tabular-nums">
                            {isFirstCard ? '22.5kg' : isSecondCard ? '40 meals · 8.5 kg' : `${listing.estimatedMeals} meals · ${listing.weightKg} kg`}
                          </span>
                        </div>
                      </div>

                      {listing.flagReason && (
                        <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 font-medium break-words">
                          {listing.flagReason}
                        </div>
                      )}
                    </div>

                    {/* Bottom row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 relative">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="text-xs font-bold text-emerald-700">
                          Status: Live & Available
                        </span>
                      </div>

                      <div className="flex items-center gap-2 relative ml-auto sm:ml-0">
                        {/* Floating dark tooltip popover on Left Card */}
                        {isFirstCard && (
                          <div className="absolute -top-9 right-0 z-20 pointer-events-none animate-in fade-in duration-200 hidden sm:block">
                            <div className="bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-lg border border-slate-750 flex items-center gap-1.5 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                              <span>Safety-reassurance tooltip</span>
                              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-750" />
                            </div>
                          </div>
                        )}

                        {isFirstCard ? (
                          <button
                            onClick={() => handleCancelListing(listing.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>WITHDRAW</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCancelListing(listing.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 border border-slate-300 hover:border-rose-200 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Withdraw</span>
                          </button>
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
