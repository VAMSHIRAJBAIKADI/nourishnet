import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, X } from 'lucide-react';

interface SafetyBannerProps {
  onOpenGuidelines: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ onOpenGuidelines }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside 
      aria-label="Platform safety coordination disclaimer"
      className="bg-amber-50 border-b border-amber-200/80 px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-amber-900 transition-colors w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 w-full">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug sm:leading-normal break-words text-wrap text-[11px] sm:text-xs">
            <span className="font-semibold text-amber-950">Safety Coordination Notice:</span>{' '}
            NourishNet coordinates food donation logistics and does not inspect or certify food safety. Donors and charities operate under the Bill Emerson Good Samaritan Food Donation Act and local public health standards.
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-amber-200/60 text-[11px] sm:text-xs">
          <button
            onClick={onOpenGuidelines}
            className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>Safety & Temp Protocol</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-700 hover:text-amber-950 rounded hover:bg-amber-100/60 transition-colors cursor-pointer ml-auto sm:ml-0"
            title="Dismiss notice for this session"
            aria-label="Dismiss safety banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
