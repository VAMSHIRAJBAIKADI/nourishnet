import React from 'react';
import { ApiListing } from '../../services/api';
import {
  X,
  Clock,
  MapPin,
  ShieldCheck,
  Thermometer,
  AlertTriangle,
  Utensils,
  Truck,
  HeartHandshake,
  Check
} from 'lucide-react';

interface ListingDetailModalProps {
  listing: ApiListing | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestDonation: (listing: ApiListing) => void;
  hasActiveRequest: boolean;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onRequestDonation,
  hasActiveRequest
}) => {
  if (!isOpen || !listing) return null;

  const expiresAt = new Date(listing.expiryTime);
  const pickupStart = new Date(listing.pickupWindowStart);
  const pickupEnd = new Date(listing.pickupWindowEnd);
  const isExpiringSoon = expiresAt.getTime() - Date.now() < 3600000 * 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
      >
        {/* Image header if available */}
        {listing.imageUrl ? (
          <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                {listing.category} · {listing.storageType.toLowerCase()}
              </span>
              <h2 id="listing-detail-title" className="text-xl font-bold leading-tight mt-0.5">
                {listing.title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {listing.category} · {listing.storageType.toLowerCase()}
              </span>
              <h2 id="listing-detail-title" className="text-lg font-bold text-slate-900">
                {listing.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Donor Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm">{listing.donorName}</span>
                {listing.donorVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Donor
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {listing.donorName} · {listing.neighborhood}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Available Quantity</span>
              <span className="font-mono text-base font-bold text-emerald-800 tabular-nums">
                {listing.estimatedMeals} meals ({listing.weightKg} kg)
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
              Food Description & Contents
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {listing.description}
            </p>
          </div>

          {/* Dietary & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1.5 text-xs">
                Dietary Compatibility
              </span>
              {listing.dietaryTags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {listing.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium capitalize text-[11px]"
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">Standard non-dietary specific</span>
              )}
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <span className="font-bold text-amber-950 block mb-1.5 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Allergen Disclosures
              </span>
              <div className="text-amber-900 text-[11px]">
                {listing.allergens.length > 0 ? (
                  <span>{listing.allergens.join(', ')}</span>
                ) : (
                  <span>No declared major allergens.</span>
                )}
              </div>
            </div>
          </div>

          {/* Critical Timeline & Storage Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Storage Requirement</span>
              <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5 capitalize">
                <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                {listing.storageType.toLowerCase()}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {listing.storageType === 'REFRIGERATED'
                  ? 'Keep < 40°F (4°C)'
                  : listing.storageType === 'FROZEN'
                  ? 'Keep < 0°F (-18°C)'
                  : 'Ambient storage'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Safe Until / Expiry</span>
              <div
                className={`font-semibold flex items-center gap-1 mt-0.5 tabular-nums ${
                  isExpiringSoon ? 'text-rose-600 font-bold' : 'text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {expiresAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Pickup Window</span>
              <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                {pickupStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                {pickupEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {pickupStart.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Location & Instructions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Pickup Location & Dock Logistics
            </h4>
            <p className="text-slate-800 font-medium">{listing.locationAddress}</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-700">Instructions: </span>
              {listing.pickupInstructions || 'Inquire at front desk or loading bay.'}
            </p>
          </div>

          {/* Legal Reminder */}
          <div className="text-[11px] text-slate-500 italic">
            * By requesting this donation, you confirm your organization possesses suitable thermal transport equipment (insulated coolers / refrigerated vehicle) to maintain food temperature.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          {hasActiveRequest ? (
            <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-amber-600" />
              Request Already Submitted
            </div>
          ) : listing.status !== 'AVAILABLE' ? (
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              Listing Reserved or Unavailable
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onRequestDonation(listing);
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Request This Food Donation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
