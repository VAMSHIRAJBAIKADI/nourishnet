export type UserRole = 'DONOR' | 'RECIPIENT' | 'RECIPIENT_NGO' | 'ADMIN';

export type VerifiedStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ListingStatus = 
  | 'LIVE'
  | 'CLAIMED'
  | 'WITHDRAWN'
  | 'AVAILABLE' 
  | 'REQUESTED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'FLAGGED';

export type RequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'APPROVED'
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export type StorageType = 
  | 'REFRIGERATED' 
  | 'FROZEN' 
  | 'AMBIENT' 
  | 'HOT_HOLD'
  | 'Refrigerated'
  | 'Frozen'
  | 'Ambient';

export interface OrganizationDetails {
  type?: string;
  name?: string;
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
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  password_hash?: string;
  role: UserRole;
  organizationName?: string;
  organizationDetails: OrganizationDetails;
  verifiedStatus: VerifiedStatus;
  verified_status?: VerifiedStatus;
  createdAt: string;
  created_at?: string;
}

export interface ListingRecord {
  id: string;
  donorId: string;
  donor_id?: string;
  donorName: string;
  donorVerified: boolean;
  title: string;
  description: string;
  category: string; // PREPARED, BAKERY, PRODUCE, etc.
  quantity: string;
  quantity_portions?: number;
  estimatedMeals: number;
  weightKg: number;
  weight_kg?: number;
  storageType: StorageType;
  storage_temp?: string; // Refrigerated, Ambient, Frozen
  prepareTime: string;
  expiryTime: string;
  expiry_timestamp?: string;
  locationAddress: string;
  neighborhood: string;
  dietaryTags: string[];
  allergens: string[];
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupInstructions: string;
  imageUrl?: string;
  status: ListingStatus;
  flagReason?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
}

export interface ClaimRecord {
  id: string;
  listing_id: string;
  listingId?: string;
  recipient_id: string;
  recipientId?: string;
  status: ClaimStatus;
  claimed_at: string;
  timestamp?: string;
  listingTitle?: string;
  donorId?: string;
  donorName?: string;
  recipientName?: string;
  notes?: string;
}

export interface RequestRecord {
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
  status: RequestStatus;
  pickupCode: string;
  rejectionReason?: string;
  completedAt?: string;
  timestamp: string;
}

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'LISTING' | 'USER' | 'REQUEST' | 'CLAIM';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AuthJWTPayload {
  userId: string;
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  organizationName?: string;
}
