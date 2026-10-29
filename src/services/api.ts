export interface UserProfile {
  id: string;
  email: string;
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  name: string;
  organizationDetails?: {
    type?: string;
    contactPerson?: string;
    phone?: string;
    address?: string;
    neighborhood?: string;
    licenseNumber?: string;
    foodSafetyCert?: string;
    taxExemptId?: string;
    dailyMeals?: number;
    coldStorageCapacity?: string;
    transportTypes?: string[];
    description?: string;
  };
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

export interface ApiListing {
  id: string;
  donorId: string;
  donorName: string;
  donorVerified: boolean;
  title: string;
  description: string;
  category: string;
  quantity: string;
  estimatedMeals: number;
  weightKg: number;
  prepareTime: string;
  expiryTime: string;
  locationAddress: string;
  neighborhood: string;
  storageType: 'REFRIGERATED' | 'FROZEN' | 'AMBIENT' | 'HOT_HOLD';
  dietaryTags: string[];
  allergens: string[];
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupInstructions: string;
  imageUrl?: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED' | 'FLAGGED';
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  requestedMeals: number;
  pickupVolunteer: string;
  volunteerPhone: string;
  vehicleType: string;
  pickupTime: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  pickupCode: string;
  rejectionReason?: string;
  completedAt?: string;
  timestamp: string;
}

export interface ApiAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AdminMetrics {
  totalListings: number;
  activeListingsCount: number;
  totalMealsRescued: number;
  totalDonors: number;
  totalRecipients: number;
  totalWeightKg: number;
  co2TonsSaved: number;
  pendingVerifications: number;
  flaggedListingsCount: number;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('nourishnet_jwt_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    async register(payload: { email: string; password: string; role: string; name: string; organizationDetails?: any }) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return handleResponse<{ token: string; user: UserProfile }>(res);
    },

    async login(payload: { email: string; password: string }) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return handleResponse<{ token: string; user: UserProfile }>(res);
    },

    async getMe() {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });
      return handleResponse<{ user: UserProfile }>(res);
    }
  },

  listings: {
    async getAll(params?: { category?: string; status?: string; search?: string; donorId?: string }) {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      if (params?.donorId) query.append('donorId', params.donorId);

      const res = await fetch(`/api/listings?${query.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<{ listings: ApiListing[] }>(res);
    },

    async create(payload: Partial<ApiListing>) {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse<{ message: string; listing: ApiListing }>(res);
    },

    async updateStatus(id: string, status: string, flagReason?: string) {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, flagReason })
      });
      return handleResponse<{ message: string; listing: ApiListing }>(res);
    }
  },

  requests: {
    async getAll() {
      const res = await fetch('/api/requests', {
        headers: getAuthHeaders()
      });
      return handleResponse<{ requests: ApiRequest[] }>(res);
    },

    async create(payload: {
      listingId: string;
      requestedMeals: number;
      pickupVolunteer: string;
      volunteerPhone?: string;
      vehicleType?: string;
      pickupTime?: string;
      notes?: string;
    }) {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse<{ message: string; request: ApiRequest }>(res);
    },

    async update(id: string, payload: { status: string; rejectionReason?: string; notes?: string }) {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      return handleResponse<{ message: string; request: ApiRequest }>(res);
    }
  },

  admin: {
    async getMetrics() {
      const res = await fetch('/api/admin/metrics', {
        headers: getAuthHeaders()
      });
      return handleResponse<{ metrics: AdminMetrics }>(res);
    },

    async getAuditLogs() {
      const res = await fetch('/api/admin/audit-logs', {
        headers: getAuthHeaders()
      });
      return handleResponse<{ auditLogs: ApiAuditLog[] }>(res);
    },

    async getOrganizations() {
      const res = await fetch('/api/admin/organizations', {
        headers: getAuthHeaders()
      });
      return handleResponse<{ organizations: UserProfile[] }>(res);
    },

    async verifyOrganization(userId: string, status: string, notes?: string) {
      const res = await fetch(`/api/admin/verifications/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, notes })
      });
      return handleResponse<{ message: string; user: UserProfile; auditLog: ApiAuditLog }>(res);
    },

    async deleteListing(id: string, reason?: string) {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      return handleResponse<{ message: string; auditLog: ApiAuditLog }>(res);
    }
  },

  system: {
    async getHealth() {
      const res = await fetch('/api/health');
      return handleResponse<{
        status: string;
        database: string;
        mongoConnected: boolean;
        timestamp: string;
      }>(res);
    }
  }
};
