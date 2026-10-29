import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiListing } from '../../services/api';
import { X, Send, Truck, Clock, User, Phone, AlertCircle } from 'lucide-react';

interface RequestDonationModalProps {
  listing: ApiListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestDonationModal: React.FC<RequestDonationModalProps> = ({
  listing,
  isOpen,
  onClose
}) => {
  const { currentUser, createRequest, addToast } = useApp();

  const now = new Date();
  const defaultArrival = new Date(now.getTime() + 3600000).toISOString().slice(0, 16);

  const [requestedMeals, setRequestedMeals] = useState<number>(listing?.estimatedMeals || 20);
  const [pickupVolunteer, setPickupVolunteer] = useState('David Miller (Volunteer Driver)');
  const [volunteerPhone, setVolunteerPhone] = useState(currentUser?.organizationDetails?.phone || '(555) 678-4321');
  const [vehicleType, setVehicleType] = useState('Cargo Van with Insulated Thermal Cambros');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState(defaultArrival);
  const [notes, setNotes] = useState(
    `Serving ${currentUser?.organizationDetails?.dailyMeals || 150} community members today. We have temperature probes and insulated transport bags.`
  );
  const [complianceAgreement, setComplianceAgreement] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupVolunteer.trim() || requestedMeals <= 0) return;

    setSubmitting(true);
    try {
      await createRequest({
        listingId: listing.id,
        requestedMeals: Number(requestedMeals),
        pickupVolunteer: pickupVolunteer.trim(),
        volunteerPhone: volunteerPhone.trim(),
        vehicleType: vehicleType.trim(),
        pickupTime: new Date(estimatedPickupTime).toISOString(),
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      addToast('Failed to submit request', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="request-modal-title" className="text-lg font-bold text-slate-900">
              Submit Food Donation Request
            </h2>
            <p className="text-xs text-slate-500">
              Requesting on behalf of <span className="font-semibold text-slate-800">{currentUser?.organizationDetails?.type || currentUser?.name || 'Recipient NGO'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Listing Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Surplus Item</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{listing.title}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                From: {listing.donorName} ({listing.neighborhood})
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Available</span>
              <span className="font-mono text-emerald-800 font-bold block tabular-nums">
                {listing.estimatedMeals} meals
              </span>
            </div>
          </div>

          {/* Meals Requested */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Quantity / Portions Requested <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={listing.estimatedMeals}
              required
              value={requestedMeals}
              onChange={(e) => setRequestedMeals(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              You can request full quantity ({listing.estimatedMeals} meals) or partial if limited by transport.
            </span>
          </div>

          {/* Driver & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Assigned Volunteer / Driver Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupVolunteer}
                onChange={(e) => setPickupVolunteer(e.target.value)}
                placeholder="e.g. David Miller"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Driver Mobile Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={volunteerPhone}
                onChange={(e) => setVolunteerPhone(e.target.value)}
                placeholder="e.g. (555) 678-4321"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Vehicle & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Vehicle & Transport Setup
              </label>
              <input
                type="text"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. Refrigerated Van, SUV with thermal coolers"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Estimated Pickup Arrival
              </label>
              <input
                type="datetime-local"
                required
                value={estimatedPickupTime}
                onChange={(e) => setEstimatedPickupTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Message to Donor (Recipient Needs & Logistics Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any context for the chef or dispatch team..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Safety Checkbox */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="transport-compliance"
              required
              checked={complianceAgreement}
              onChange={(e) => setComplianceAgreement(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="transport-compliance" className="text-xs text-emerald-950 leading-relaxed cursor-pointer">
              <span className="font-semibold">Safe Transit Commitment:</span> Our organization certifies that we will transport this perishable food in continuous compliance with food-safety temperature requirements and distribute it promptly without charge to community members.
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!complianceAgreement}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                complianceAgreement
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Send Pickup Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
