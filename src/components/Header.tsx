import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Shield,
  Building2,
  Store,
  Lock,
  LogOut,
  Wifi,
  WifiOff,
  AlertTriangle,
  UserCheck,
  Github
} from 'lucide-react';
import { GitHubExportModal } from './common/GitHubExportModal';

interface HeaderProps {
  onOpenSafetyModal: () => void;
  selectedView: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  setSelectedView: (view: 'DONOR' | 'RECIPIENT' | 'ADMIN') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSafetyModal,
  selectedView,
  setSelectedView
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    logout,
    socketConnected,
    requests,
    listings,
    addToast
  } = useApp();

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const pendingDonorRequests = currentUser
    ? requests.filter((r) => r.donorId === currentUser.id && r.status === 'PENDING').length
    : 0;

  const acceptedRecipientPickups = currentUser
    ? requests.filter((r) => r.recipientId === currentUser.id && r.status === 'ACCEPTED').length
    : 0;

  const flaggedListingsCount = listings.filter((l) => l.status === 'FLAGGED').length;

  const handleSelectView = (view: 'DONOR' | 'RECIPIENT' | 'ADMIN') => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // Role-based protection: non-admins cannot switch to ADMIN view
    if (view === 'ADMIN' && currentUser?.role !== 'ADMIN') {
      addToast(
        '403 Forbidden: Access Denied',
        'Administrator privileges are required to view the Compliance Console. Please log in with an Admin account.',
        'error'
      );
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedView(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">
                NourishNet
              </span>
              <span className="hidden sm:inline text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Enterprise Full-Stack
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: View Switcher (with RBAC protection) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => handleSelectView('DONOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'DONOR'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Donor Portal</span>
            {pendingDonorRequests > 0 && (
              <span className="ml-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {pendingDonorRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectView('RECIPIENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'RECIPIENT'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Recipient NGO</span>
            {acceptedRecipientPickups > 0 && (
              <span className="ml-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {acceptedRecipientPickups}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectView('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'ADMIN'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
            {flaggedListingsCount > 0 && (
              <span className="ml-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {flaggedListingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: Real-Time Sync Indicator, User Gateway & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Socket.io Live Status */}
          <div
            title={socketConnected ? 'Connected to WebSocket sync server' : 'Connecting to WebSocket...'}
            className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-1 bg-slate-50 rounded-lg border border-slate-200"
          >
            {socketConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Socket.io Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Connecting...</span>
              </>
            )}
          </div>

          {/* User Account / Auth Modal Trigger */}
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {currentUser.organizationDetails?.type || currentUser.role}
                </span>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                title="Switch User Account or Session"
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Switch Account</span>
              </button>

              <button
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Auth Gateway</span>
            </button>
          )}

          {/* GitHub / Export Button */}
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Push directly to GitHub or Download Code ZIP"
          >
            <Github className="w-3.5 h-3.5 text-slate-900" />
            <span className="hidden sm:inline">Push to GitHub</span>
          </button>

          {/* Safety Button */}
          <button
            onClick={onOpenSafetyModal}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Safety</span>
          </button>
        </div>
      </div>

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />
    </header>
  );
};
