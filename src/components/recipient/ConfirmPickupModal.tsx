import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiRequest } from '../../services/api';
import { X, CheckCircle2, ShieldCheck, Thermometer, MapPin } from 'lucide-react';

interface ConfirmPickupModalProps {
  request: ApiRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmPickupModal: React.FC<ConfirmPickupModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { updateRequestStatus, addToast } = useApp();
  const [temperatureCheck, setTemperatureCheck] = useState(true);
  const [packagingCheck, setPackagingCheck] = useState(true);
  const [collectorNotes, setCollectorNotes] = useState('Food inspected, loaded into refrigerated storage unit, temperature recorded at 38°F.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateRequestStatus(request.id, 'COMPLETED', undefined, collectorNotes);
      addToast('Pickup Confirmed!', `Food safely received and logged. Thank you for rescuing ${request.requestedMeals} meals!`, 'success');
      onClose();
    } catch (err: any) {
      addToast('Failed to confirm pickup', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-pickup-title"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="confirm-pickup-title" className="text-lg font-bold text-slate-900">
              Confirm Food Collection
            </h2>
            <p className="text-xs text-slate-500">
              Finalize handoff from <span className="font-semibold text-slate-800">{request.donorName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          {/* Pickup PIN Verification Card */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
              Pickup Security Verification Code
            </span>
            <div className="text-2xl font-mono font-extrabold text-emerald-950 mt-1 tracking-widest tabular-nums">
              {request.pickupCode}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Provide this code to the donor's staff upon taking custody of the food.
            </p>
          </div>

          {/* Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Listing:</span>
              <span className="font-semibold text-slate-900 text-right">{request.listingTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Meals Rescued:</span>
              <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                {request.requestedMeals} meals
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Driver / Contact:</span>
              <span className="text-slate-800 font-medium">{request.pickupVolunteer}</span>
            </div>
          </div>

          {/* Inspection Checks */}
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={temperatureCheck}
                onChange={(e) => setTemperatureCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 leading-snug">
                <span className="font-semibold text-slate-900">Temperature & Cold Chain Checked:</span> Food temperature has been verified within safe range and is transferred directly into compliant storage.
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={packagingCheck}
                onChange={(e) => setPackagingCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 leading-snug">
                <span className="font-semibold text-slate-900">Packaging Integrity Checked:</span> Seals, lids, and protective wrapping are sound with no signs of contamination or damage.
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Collection Notes / Log
            </label>
            <textarea
              rows={2}
              value={collectorNotes}
              onChange={(e) => setCollectorNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
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
              disabled={!temperatureCheck || !packagingCheck}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                temperatureCheck && packagingCheck
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Pickup & Close Donation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
