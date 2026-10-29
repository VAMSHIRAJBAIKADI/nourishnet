import React from 'react';
import { X, ShieldCheck, Thermometer, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface SafetyGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="safety-modal-title" className="text-lg font-bold text-slate-900">
                Food Safety, Liability & Compliance Protocol
              </h2>
              <p className="text-xs text-slate-500">
                Standards governed by the Bill Emerson Good Samaritan Food Donation Act
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700">
          {/* Important Role Statement */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold text-amber-950">Platform Coordination Disclaimer: </span>
              NourishNet is a technology coordination tool that facilitates connections between verified donors and qualified non-profit charitable organizations. NourishNet is not an inspection or certification authority. Participating donors and recipients agree to strictly uphold municipal food safety laws, state health codes, and continuous cold-chain integrity.
            </div>
          </div>

          {/* Legal Protection */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              1. The Bill Emerson Good Samaritan Food Donation Act (42 U.S. Code § 1791)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Federal law protects individuals, restaurants, hotels, grocery stores, and food manufacturers from civil and criminal liability when donating food in good faith to non-profit organizations for distribution to food-insecure individuals. Protection covers apparently wholesome food with normal aesthetic imperfections.
            </p>
          </section>

          {/* Temperature Guidelines */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              2. Mandatory Temperature & Cold Chain Standards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">Cold Food Storage</span>
                <p className="text-slate-600">Must be continuously maintained at or below <strong>40°F (4°C)</strong> during prep, storage, and transport.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">Frozen Food Storage</span>
                <p className="text-slate-600">Must be kept solidly frozen at <strong>0°F (-18°C)</strong> or below. Re-freezing thawed foods is prohibited.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">Hot-Holding Limits</span>
                <p className="text-slate-600">Hot prepared foods must remain at <strong>140°F (60°C)</strong> or above, or be chilled to 40°F within 2 hours of prep.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-900 block mb-1">Insulated Transit</span>
                <p className="text-slate-600">Recipients must transport perishable foods in refrigerated vehicles or cambro insulated carriers.</p>
              </div>
            </div>
          </section>

          {/* Allergen & Labeling */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Allergen Transparency & Packaging Standards
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>Donors must clearly disclose common allergens (Milk, Eggs, Fish, Shellfish, Tree nuts, Peanuts, Wheat, Soy, Sesame).</li>
              <li>Prepared trays must be securely covered, food-grade sealed, and stamped with prep date/time.</li>
              <li>Recipient volunteers must visually inspect packaging integrity before loading onto transport vehicles.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            I Understand & Agree to Safety Terms
          </button>
        </div>
      </div>
    </div>
  );
};
