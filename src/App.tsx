/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { RecipientDashboard } from './components/recipient/RecipientDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { SafetyGuidelinesModal } from './components/common/SafetyGuidelinesModal';
import { AuthModal } from './components/auth/AuthModal';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

const MainView: React.FC = () => {
  const { currentUser, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'DONOR' | 'RECIPIENT' | 'ADMIN'>('DONOR');

  // Sync selected view with logged-in user role
  useEffect(() => {
    if (currentUser?.role) {
      if (currentUser.role === 'RECIPIENT_NGO' || currentUser.role === 'RECIPIENT') {
        setSelectedView('RECIPIENT');
      } else if (currentUser.role === 'ADMIN') {
        setSelectedView('ADMIN');
      } else {
        setSelectedView('DONOR');
      }
    }
  }, [currentUser?.role]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16 md:pb-0">
      {/* Platform Safety Disclaimer Banner */}
      <SafetyBanner onOpenGuidelines={() => setIsSafetyModalOpen(true)} />

      {/* Main Top Navigation with Role Switcher & Real-Time Auth Gateway */}
      <Header
        onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />

      {/* Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 overflow-hidden">
        {selectedView === 'DONOR' && <DonorDashboard />}
        {selectedView === 'RECIPIENT' && <RecipientDashboard />}
        {selectedView === 'ADMIN' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">NourishNet Food Donation Platform</span>
            <span aria-hidden="true">·</span>
            <span>Enterprise Full-Stack Edition (Problem ID: HACK-P197)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              className="hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Good Samaritan Compliance & Safety Standards
            </button>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-slate-400">Node.js Express + Socket.io + JWT RBAC</span>
          </div>
        </div>
      </footer>

      {/* Modals and Toasts */}
      <SafetyGuidelinesModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
