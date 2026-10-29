import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api, UserProfile, ApiListing, ApiRequest, ApiAuditLog, AdminMetrics } from '../services/api';
import { getSocketClient } from '../services/socket';
import { ToastMessage } from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  socketConnected: boolean;

  listings: ApiListing[];
  requests: ApiRequest[];
  auditLogs: ApiAuditLog[];
  adminMetrics: AdminMetrics | null;
  toasts: ToastMessage[];

  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; password: string; role: string; name: string; organizationName?: string; organizationDetails?: any }) => Promise<void>;
  register: (payload: { email: string; password: string; role: string; name: string; organizationDetails?: any }) => Promise<void>;
  logout: () => void;

  refreshListings: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshAdminData: () => Promise<void>;

  createListing: (data: Partial<ApiListing> | any) => Promise<ApiListing>;
  withdrawListing: (id: string) => Promise<void>;
  updateListingStatus: (id: string, status: string, flagReason?: string) => Promise<void>;
  createClaim: (data: { listing_id: string; notes?: string; requestedMeals?: number; pickupVolunteer?: string }) => Promise<void>;
  createRequest: (data: {
    listingId: string;
    requestedMeals: number;
    pickupVolunteer: string;
    volunteerPhone?: string;
    vehicleType?: string;
    pickupTime?: string;
    notes?: string;
  }) => Promise<void>;
  updateRequestStatus: (id: string, status: string, rejectionReason?: string, notes?: string) => Promise<void>;
  adminDeleteListing: (id: string, reason?: string) => Promise<void>;
  adminVerifyOrg: (userId: string, status: string, notes?: string) => Promise<void>;

  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nourishnet_jwt_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const [listings, setListings] = useState<ApiListing[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast system
  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial user profile if token exists
  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        // Auto-login with default Chef account so the app starts populated and functional immediately
        try {
          const res = await api.auth.login({ email: 'chef@grandhotel.com', password: 'password123' });
          localStorage.setItem('nourishnet_jwt_token', res.token);
          setToken(res.token);
          setCurrentUser(res.user);
        } catch (err) {
          console.warn('Initial auto-login fallback skipped:', err);
        }
        return;
      }
      try {
        const res = await api.auth.getMe();
        setCurrentUser(res.user);
      } catch (err) {
        console.warn('Token expired or invalid, clearing session.');
        localStorage.removeItem('nourishnet_jwt_token');
        setToken(null);
        setCurrentUser(null);
      }
    }
    loadCurrentUser();
  }, [token]);

  // Load listings from REST API
  const refreshListings = useCallback(async () => {
    try {
      const data = await api.listings.getAll();
      setListings(data.listings);
    } catch (err: any) {
      console.error('Failed to load listings:', err);
    }
  }, []);

  // Load requests from REST API
  const refreshRequests = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.requests.getAll();
      setRequests(data.requests);
    } catch (err: any) {
      console.error('Failed to load requests:', err);
    }
  }, [token]);

  // Load admin data
  const refreshAdminData = useCallback(async () => {
    if (!token || currentUser?.role !== 'ADMIN') return;
    try {
      const [metricsData, logsData] = await Promise.all([
        api.admin.getMetrics(),
        api.admin.getAuditLogs()
      ]);
      setAdminMetrics(metricsData.metrics);
      setAuditLogs(logsData.auditLogs);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  }, [token, currentUser]);

  // Initial load
  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    if (currentUser) {
      refreshRequests();
      if (currentUser.role === 'ADMIN') {
        refreshAdminData();
      }
    }
  }, [currentUser, refreshRequests, refreshAdminData]);

  // Socket.io Real-Time Event Sync
  useEffect(() => {
    const socket = getSocketClient();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onListingCreated = (newListing: ApiListing) => {
      setListings((prev) => {
        // Idempotency check
        if (prev.some((l) => l.id === newListing.id)) return prev;
        return [newListing, ...prev];
      });
      addToast(
        'New Surplus Food Available',
        `"${newListing.title}" posted by ${newListing.donorName} (${newListing.quantity}).`,
        'info'
      );
    };

    const onListingUpdated = (updatedListing: ApiListing) => {
      setListings((prev) =>
        prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
      );
    };

    const onListingDeleted = (data: { id: string }) => {
      setListings((prev) => prev.filter((l) => l.id !== data.id));
      addToast('Listing Removed', 'A listing was moderated by platform administrators.', 'warning');
    };

    const onRequestCreated = (newRequest: ApiRequest) => {
      setRequests((prev) => {
        if (prev.some((r) => r.id === newRequest.id)) return prev;
        return [newRequest, ...prev];
      });
      if (currentUser?.id === newRequest.donorId) {
        addToast(
          'New Pickup Request Received!',
          `${newRequest.recipientName} requested ${newRequest.requestedMeals} meals for "${newRequest.listingTitle}".`,
          'success'
        );
      }
    };

    const onRequestUpdated = (updatedRequest: ApiRequest) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
      );
      if (currentUser?.id === updatedRequest.recipientId) {
        if (updatedRequest.status === 'ACCEPTED') {
          addToast(
            'Request Accepted by Donor!',
            `Your pickup code is ${updatedRequest.pickupCode} for "${updatedRequest.listingTitle}".`,
            'success'
          );
        } else if (updatedRequest.status === 'REJECTED') {
          addToast(
            'Request Declined',
            `Donor declined request: ${updatedRequest.rejectionReason || 'No reason specified'}`,
            'warning'
          );
        }
      }
    };

    const onAdminAudit = (log: ApiAuditLog) => {
      setAuditLogs((prev) => [log, ...prev]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('listing:created', onListingCreated);
    socket.on('listing:updated', onListingUpdated);
    socket.on('listing:deleted', onListingDeleted);
    socket.on('request:created', onRequestCreated);
    socket.on('request:updated', onRequestUpdated);
    socket.on('admin:audit', onAdminAudit);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('listing:created', onListingCreated);
      socket.off('listing:updated', onListingUpdated);
      socket.off('listing:deleted', onListingDeleted);
      socket.off('request:created', onRequestCreated);
      socket.off('request:updated', onRequestUpdated);
      socket.off('admin:audit', onAdminAudit);
    };
  }, [currentUser, addToast]);

  // Auth actions
  const login = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    localStorage.setItem('nourishnet_jwt_token', res.token);
    setToken(res.token);
    setCurrentUser(res.user);
    addToast('Authentication Successful', `Welcome back, ${res.user.name}!`, 'success');
  };

  const signup = async (payload: { email: string; password: string; role: string; name: string; organizationName?: string; organizationDetails?: any }) => {
    const res = await api.auth.signup(payload);
    localStorage.setItem('nourishnet_jwt_token', res.token);
    setToken(res.token);
    setCurrentUser(res.user);
    addToast('Account Registered', `Welcome to NourishNet, ${res.user.name}!`, 'success');
  };

  const register = async (payload: { email: string; password: string; role: string; name: string; organizationDetails?: any }) => {
    const res = await api.auth.register(payload);
    localStorage.setItem('nourishnet_jwt_token', res.token);
    setToken(res.token);
    setCurrentUser(res.user);
    addToast('Registration Successful', `Account created with role ${res.user.role}.`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('nourishnet_jwt_token');
    setToken(null);
    setCurrentUser(null);
    addToast('Logged Out', 'You have been disconnected from the session.', 'info');
  };

  // Listings actions
  const createListing = async (data: Partial<ApiListing> | any) => {
    const res = await api.listings.create(data);
    addToast('Listing Published', res.message, 'success');
    return res.listing;
  };

  const withdrawListing = async (id: string) => {
    await api.listings.withdraw(id);
    addToast('Listing Withdrawn', 'Listing has been withdrawn from surplus dispatch.', 'info');
  };

  const updateListingStatus = async (id: string, status: string, flagReason?: string) => {
    await api.listings.updateStatus(id, status, flagReason);
    addToast('Status Updated', `Listing marked as ${status}.`, 'info');
  };

  const createClaim = async (data: { listing_id: string; notes?: string; requestedMeals?: number; pickupVolunteer?: string }) => {
    await api.claims.create(data);
    addToast('Claim Placed Successfully', 'Your pickup claim has been dispatched to the donor in real-time.', 'success');
  };

  // Requests actions
  const createRequest = async (data: {
    listingId: string;
    requestedMeals: number;
    pickupVolunteer: string;
    volunteerPhone?: string;
    vehicleType?: string;
    pickupTime?: string;
    notes?: string;
  }) => {
    await api.requests.create(data);
    addToast('Request Submitted', 'Awaiting donor acceptance.', 'success');
  };

  const updateRequestStatus = async (id: string, status: string, rejectionReason?: string, notes?: string) => {
    await api.requests.update(id, { status, rejectionReason, notes });
    addToast('Request Updated', `Request status changed to ${status}.`, 'info');
  };

  // Admin actions
  const adminDeleteListing = async (id: string, reason?: string) => {
    await api.admin.deleteListing(id, reason);
    addToast('Listing Removed', 'Listing was removed and logged in regulatory audit trail.', 'warning');
  };

  const adminVerifyOrg = async (userId: string, status: string, notes?: string) => {
    await api.admin.verifyOrganization(userId, status, notes);
    addToast('Verification Updated', `Organization status set to ${status}.`, 'success');
    refreshAdminData();
  };

  const activeRole: 'DONOR' | 'RECIPIENT' | 'ADMIN' =
    currentUser?.role === 'RECIPIENT_NGO' ? 'RECIPIENT' : (currentUser?.role || 'DONOR');

  return (
    <AppContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        activeRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        socketConnected,
        listings,
        requests,
        auditLogs,
        adminMetrics,
        toasts,
        login,
        signup,
        register,
        logout,
        refreshListings,
        refreshRequests,
        refreshAdminData,
        createListing,
        withdrawListing,
        updateListingStatus,
        createClaim,
        createRequest,
        updateRequestStatus,
        adminDeleteListing,
        adminVerifyOrg,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
