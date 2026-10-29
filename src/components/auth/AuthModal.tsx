import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, Building, ShieldCheck, Key, CheckCircle, ArrowRight, Store, Building2, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { login, signup, register, addToast } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT_NGO' | 'ADMIN'>('DONOR');
  const [orgName, setOrgName] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = async (emailCred: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(emailCred, 'Password123!');
      onClose();
    } catch (err: any) {
      // Fallback try lowercase password123
      try {
        await login(emailCred, 'password123');
        onClose();
      } catch (err2: any) {
        setErrorMsg(err2.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else {
        await signup({
          email,
          password,
          name,
          role,
          organizationName: orgName || name,
          organizationDetails: {
            type: orgName || name,
            contactPerson: name,
            phone: orgPhone,
            address: orgAddress
          }
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              NourishNet Security & Auth Gateway
            </h2>
            <p className="text-xs text-slate-500">
              JWT Authenticated Session with Role-Based Access Control (RBAC)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Section */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            ⚡ Quick-Test Verified Accounts (One-Click Login):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('donor@nourishnet.org')}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>Donor</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">
                donor@nourishnet.org
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('recipient@nourishnet.org')}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Recipient NGO</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">
                recipient@nourishnet.org
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@nourishnet.org')}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50/40 text-left transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">
                admin@nourishnet.org
              </div>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="p-6 pb-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-4">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Sign In (Existing Account)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Register New Organization
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {tab === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Account Type / Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="DONOR">Food Donor (Hotel / Restaurant / Grocery)</option>
                      <option value="RECIPIENT_NGO">Recipient NGO (Shelter / Food Bank / Relief)</option>
                      <option value="ADMIN">Platform Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Contact Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chef Marcus Vance"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Organization / Establishment Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Grand Hotel Banquets LLC"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="(555) 234-8901"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Address / City
                    </label>
                    <input
                      type="text"
                      value={orgAddress}
                      onChange={(e) => setOrgAddress(e.target.value)}
                      placeholder="450 Grand Avenue, Downtown"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : tab === 'login' ? (
                  <>
                    <span>Authenticate & Access Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Create Account & Request Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 pt-3 text-[11px] text-slate-400 text-center">
          Secured with JSON Web Tokens (JWT) · Good Samaritan Act Protected
        </div>
      </div>
    </div>
  );
};
