import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiListing, ApiRequest } from '../../services/api';
import { ListingDetailModal } from './ListingDetailModal';
import { RequestDonationModal } from './RequestDonationModal';
import { ConfirmPickupModal } from './ConfirmPickupModal';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  HeartHandshake,
  RotateCcw,
  Lock
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    listings,
    requests,
    updateRequestStatus,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'my_requests'>('browse');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');

  // Requests sub-filter
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED'>('all');

  // Modals state
  const [selectedListingForDetail, setSelectedListingForDetail] = useState<ApiListing | null>(null);
  const [selectedListingForRequest, setSelectedListingForRequest] = useState<ApiListing | null>(null);
  const [selectedRequestForPickup, setSelectedRequestForPickup] = useState<ApiRequest | null>(null);

  const isRecipient = currentUser?.role === 'RECIPIENT';

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      // Must not be flagged by admin or cancelled
      if (l.status === 'FLAGGED' || l.status === 'CANCELLED' || l.status === 'EXPIRED') return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesDesc = l.description.toLowerCase().includes(q);
        const matchesDonor = l.donorName.toLowerCase().includes(q);
        const matchesAllergen = l.allergens.some((a) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesDonor && !matchesAllergen) return false;
      }

      // Category match
      if (selectedCategory !== 'all' && l.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Dietary
      if (selectedDietary !== 'all' && !l.dietaryTags.map(t => t.toLowerCase()).includes(selectedDietary.toLowerCase())) {
        return false;
      }

      // Storage condition
      if (selectedStorage !== 'all' && l.storageType !== selectedStorage) {
        return false;
      }

      // Urgency filter
      if (selectedUrgency !== 'all') {
        const hoursLeft = (new Date(l.expiryTime).getTime() - Date.now()) / 3600000;
        if (selectedUrgency === 'urgent' && (hoursLeft > 6 || hoursLeft <= 0)) return false;
        if (selectedUrgency === 'today' && (hoursLeft > 24 || hoursLeft <= 0)) return false;
        if (selectedUrgency === 'multi_day' && hoursLeft <= 24) return false;
      }

      return true;
    });
  }, [listings, searchQuery, selectedCategory, selectedDietary, selectedStorage, selectedUrgency]);

  // Recipient's requests
  const myRequests = currentUser
    ? requests.filter((r) => r.recipientId === currentUser.id)
    : [];

  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = myRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = myRequests.filter((r) => r.status === 'COMPLETED');

  const filteredRequests = myRequests.filter((r) => {
    if (requestStatusFilter === 'all') return true;
    return r.status === requestStatusFilter;
  });

  const totalMealsReceived = completedRequests.reduce((acc, r) => acc + r.requestedMeals, 0);

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'CANCELLED');
    } catch (err: any) {
      addToast('Failed to cancel request', err.message, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDietary('all');
    setSelectedUrgency('all');
    setSelectedStorage('all');
  };

  if (!isAuthenticated || !isRecipient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <Lock className="w-12 h-12 text-sky-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Recipient NGO Access Required</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {isAuthenticated
            ? `You are currently authenticated as "${currentUser?.name}" with role [${currentUser?.role}]. Please switch to a verified Recipient NGO account to reserve surplus food donations.`
            : 'Please authenticate with your charitable organization account to browse available surplus and submit pickup reservations.'}
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-4 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          Sign In as Recipient NGO (e.g. Hope Community Kitchen)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recipient Organization Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Recipient Organization Portal</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {currentUser.organizationDetails?.taxExemptId || 'Verified 501(c)(3)'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentUser.organizationDetails?.type || currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {currentUser.organizationDetails?.description || 'Community relief pantry distributing wholesome surplus food directly to vulnerable populations.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-xl text-xs">
            <span className="text-emerald-800 font-medium block">Total Meals Rescued</span>
            <span className="font-mono text-xl font-extrabold text-emerald-950 tabular-nums">
              {totalMealsReceived} meals
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Available Surplus Food ({filteredListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my_requests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'my_requests'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>My Requests & Pickups</span>
          {acceptedRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold tabular-nums">
              {acceptedRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BROWSE SURPLUS FOOD */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by dish, donor name, ingredients, or allergens (e.g. salmon, chicken, organic, gluten-free)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 uppercase">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="prepared">Prepared Meals</option>
                  <option value="produce">Fresh Produce</option>
                  <option value="bakery">Bakery & Bread</option>
                  <option value="dairy">Dairy & Eggs</option>
                  <option value="packaged">Packaged Pantry</option>
                  <option value="beverages">Beverages & Juices</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 uppercase">
                  Urgency / Safe-By
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">Any Expiry Window</option>
                  <option value="urgent">Urgent (&lt; 6 Hours)</option>
                  <option value="today">Today (&lt; 24 Hours)</option>
                  <option value="multi_day">2+ Days Safe</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 uppercase">
                  Storage Type
                </label>
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Storage Types</option>
                  <option value="REFRIGERATED">Refrigerated (&lt; 4°C)</option>
                  <option value="AMBIENT">Ambient (Room Temp)</option>
                  <option value="FROZEN">Frozen (&lt; -18°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 uppercase">
                  Dietary
                </label>
                <select
                  value={selectedDietary}
                  onChange={(e) => setSelectedDietary(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Diets</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="gluten_free">Gluten-Free</option>
                </select>
              </div>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedDietary !== 'all' || selectedUrgency !== 'all' || selectedStorage !== 'all') && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Showing {filteredListings.length} matching surplus listings
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No matching surplus listings found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your search terms or checking back soon as commercial donors upload banquet surplus.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => {
                const expiresAt = new Date(listing.expiryTime);
                const pickupStart = new Date(listing.pickupWindowStart);
                const pickupEnd = new Date(listing.pickupWindowEnd);
                const isExpiringSoon = expiresAt.getTime() - Date.now() < 3600000 * 4;
                const hasExistingRequest = myRequests.some(
                  (r) => r.listingId === listing.id && (r.status === 'PENDING' || r.status === 'ACCEPTED')
                );

                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    {listing.imageUrl ? (
                      <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                            {listing.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5 text-white flex justify-between items-baseline">
                          <span className="text-[11px] font-medium text-slate-200">
                            {listing.donorName}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
                            {listing.estimatedMeals} meals
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 pb-0 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {listing.category}
                        </span>
                        <span className="font-mono font-bold text-slate-800 tabular-nums">
                          {listing.estimatedMeals} meals
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div>
                        {!listing.imageUrl && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                            <span className="font-semibold text-slate-700">{listing.donorName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{listing.neighborhood}</span>
                          </div>
                        )}
                        <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {listing.neighborhood}
                          </span>
                          <span className="capitalize text-slate-500 font-medium">
                            {listing.storageType.toLowerCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Pickup window:
                          </span>
                          <span className="font-mono text-slate-700 tabular-nums font-medium">
                            {pickupStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                            {pickupEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-slate-500">Use by:</span>
                          <span
                            className={`font-semibold tabular-nums ${
                              isExpiringSoon ? 'text-rose-600 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedListingForDetail(listing)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Inspect Details
                      </button>

                      {hasExistingRequest ? (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                          Requested
                        </span>
                      ) : listing.status === 'CLAIMED' ? (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                          Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedListingForRequest(listing)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Request</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REQUESTS & PICKUPS */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium w-fit">
            <button
              onClick={() => setRequestStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                requestStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({myRequests.length})
            </button>
            <button
              onClick={() => setRequestStatusFilter('ACCEPTED')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                requestStatusFilter === 'ACCEPTED' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <span>Ready for Pickup</span>
              {acceptedRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {acceptedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setRequestStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                requestStatusFilter === 'PENDING' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setRequestStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                requestStatusFilter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Completed ({completedRequests.length})
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No requests in this view</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore the "Browse Available Surplus Food" tab to request meals from local verified donors.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const isAccepted = request.status === 'ACCEPTED';
                const isPending = request.status === 'PENDING';
                const isCompleted = request.status === 'COMPLETED';
                const isRejected = request.status === 'REJECTED';

                return (
                  <div
                    key={request.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                      isAccepted
                        ? 'border-emerald-300 ring-1 ring-emerald-200'
                        : isPending
                        ? 'border-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-slate-900 text-sm">
                            {request.listingTitle}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-800 font-mono">
                            {request.requestedMeals} meals
                          </span>
                        </div>

                        <div className="text-xs text-slate-700">
                          From Donor: <span className="font-bold text-slate-900">{request.donorName}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Pickup Vehicle & Driver</span>
                            <span className="font-medium text-slate-800">{request.pickupVolunteer}</span>
                            <span className="text-slate-500 block text-[11px]">{request.vehicleType}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Pickup Time</span>
                            <span className="font-medium text-slate-800">
                              {new Date(request.pickupTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {isAccepted && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                                Pickup Verification Code
                              </span>
                              <span className="text-lg font-mono font-extrabold text-emerald-950 tracking-wider">
                                {request.pickupCode}
                              </span>
                            </div>
                            <div className="text-right text-[11px] text-emerald-700">
                              Show code to donor kitchen steward upon arrival
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                        <div>
                          {isAccepted && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md block text-center">
                              Ready for Pickup
                            </span>
                          )}
                          {isPending && (
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md block text-center">
                              Awaiting Donor Approval
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md block text-center">
                              Collected & Completed
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md block text-center">
                              Declined by Donor
                            </span>
                          )}
                        </div>

                        {isAccepted && (
                          <button
                            onClick={() => setSelectedRequestForPickup(request)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Food Collected</span>
                          </button>
                        )}

                        {isPending && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Cancel Request
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

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListingForDetail}
        isOpen={!!selectedListingForDetail}
        onClose={() => setSelectedListingForDetail(null)}
        onRequestDonation={(listing) => setSelectedListingForRequest(listing)}
        hasActiveRequest={myRequests.some(
          (r) => r.listingId === selectedListingForDetail?.id && (r.status === 'PENDING' || r.status === 'ACCEPTED')
        )}
      />

      <RequestDonationModal
        listing={selectedListingForRequest}
        isOpen={!!selectedListingForRequest}
        onClose={() => setSelectedListingForRequest(null)}
      />

      <ConfirmPickupModal
        request={selectedRequestForPickup}
        isOpen={!!selectedRequestForPickup}
        onClose={() => setSelectedRequestForPickup(null)}
      />
    </div>
  );
};
