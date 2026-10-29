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
  Github,
  Database
} from 'lucide-react';
import { GitHubExportModal } from './common/GitHubExportModal';
import { DatabaseStatusModal } from './common/DatabaseStatusModal';

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
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                NourishNet
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
              Sustainable Sourcing, Reimagined
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Buttons */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => handleSelectView('DONOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'DONOR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>DONOR PORTAL</span>
            {pendingDonorRequests > 0 && (
              <span className="ml-1 w-4 h-4 bg-emerald-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                {pendingDonorRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectView('RECIPIENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'RECIPIENT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>RECIPIENT NGO</span>
            {acceptedRecipientPickups > 0 && (
              <span className="ml-1 w-4 h-4 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                {acceptedRecipientPickups}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectView('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedView === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ADMIN CONSOLE</span>
            {flaggedListingsCount > 0 && (
              <span className="ml-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center tabular-nums">
                {flaggedListingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: System Status Indicator, Database & User Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Green Pulsing Indicator: SYSTEM STATUS: LIVE */}
          <div
            title="Real-Time Node.js & WebSocket Engine Online"
            className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">SYSTEM STATUS: LIVE</span>
          </div>

          {/* Database Engine Status Button */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            title="View Database Engine & MongoDB Connection Status"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>DATABASE</span>
          </button>

          {/* User Account / Profile Dropdown */}
          {isAuthenticated && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.organizationDetails?.type || currentUser.role}
                  </span>
                </div>
                <span className="text-slate-400 text-xs">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-750 rounded-xl shadow-xl z-50 py-1.5 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white text-xs">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      // Switch to profile tab or show details
                      handleSelectView('DONOR');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>MY PROFILE</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span>SWITCH ACCOUNT</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-950/60 text-rose-400 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Auth Gateway</span>
            </button>
          )}

          {/* GitHub / Export Button */}
          <button
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Push directly to GitHub or Download Code ZIP"
          >
            <Github className="w-3.5 h-3.5 text-slate-200" />
            <span className="hidden sm:inline">Push to GitHub</span>
          </button>
        </div>
      </div>

      {/* GitHub Export Modal */}
      <GitHubExportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Database Status & Config Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </header>
  );
};
