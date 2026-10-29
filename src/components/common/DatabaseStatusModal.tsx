import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X,
  Copy,
  Check
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [healthData, setHealthData] = useState<{
    database: string;
    mongoConnected: boolean;
    mongoDetails?: {
      isConnected: boolean;
      uriConfigured: boolean;
      status: string;
      reason: string | null;
      ipWhitelistHelp: boolean;
      lastChecked: string;
    };
  } | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const res = await fetch('/api/mongo/retry', { method: 'POST' });
      const data = await res.json();
      setHealthData((prev) => ({
        ...prev,
        database: data.database,
        mongoConnected: data.mongoConnected,
        mongoDetails: data.mongoDetails
      }));
    } catch (err) {
      console.error('Retry error', err);
    } finally {
      setRetrying(false);
    }
  };

  const handleCopyIpHelp = () => {
    navigator.clipboard.writeText('0.0.0.0/0');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const isConnected = healthData?.mongoConnected;
  const isAtlasWhitelistIssue = healthData?.mongoDetails?.ipWhitelistHelp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Database Engine & Storage</h2>
              <p className="text-xs text-slate-300">
                Hybrid MongoDB Mongoose + High-Speed Persistent Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Database Engine
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isConnected ? 'MongoDB Atlas (Live)' : 'Persistent JSON Storage (Active)'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                {healthData?.database || 'Local File Persistence (data/database.json)'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {isConnected
                  ? 'All listings, requests, users, and audit logs are syncing live to MongoDB collections via Mongoose.'
                  : 'All CRUD operations, donations, requests, and admin logs persist reliably on disk without data loss.'}
              </p>
            </div>
          </div>

          {/* Atlas IP Whitelist Notice (if applicable) */}
          {isAtlasWhitelistIssue && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Connect Your MongoDB Atlas Cluster
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your <code className="font-mono text-[11px] bg-amber-100 px-1 py-0.5 rounded">MONGODB_URI</code> is recognized. By default, MongoDB Atlas blocks connections from cloud IP addresses until whitelisted.
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1.5">
                <p className="font-semibold text-slate-800">Quick 2-Step Atlas Whitelist:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>
                    Open <strong>MongoDB Atlas</strong> &gt; Click <strong>Network Access</strong> in the left sidebar.
                  </li>
                  <li>
                    Click <strong>Add IP Address</strong> &gt; Click <strong>Allow Access from Anywhere</strong> (or enter <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">0.0.0.0/0</code>).
                  </li>
                </ol>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCopyIpHelp}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied 0.0.0.0/0!' : 'Copy 0.0.0.0/0'}</span>
                  </button>
                  <a
                    href="https://cloud.mongodb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Open MongoDB Atlas Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Testing Connection...' : 'Test & Reconnect MongoDB'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
