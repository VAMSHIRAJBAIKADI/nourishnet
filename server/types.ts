export type UserRole = 'DONOR' | 'RECIPIENT' | 'ADMIN';

export type VerifiedStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'REQUESTED' 
  | 'CLAIMED' 
  | 'EXPIRED' 
  | 'CANCELLED'
  | 'FLAGGED';

export type RequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'COMPLETED';

export type StorageType = 
  | 'REFRIGERATED' 
  | 'FROZEN' 
  | 'AMBIENT' 
  | 'HOT_HOLD';

export interface OrganizationDetails {
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
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  organizationDetails: OrganizationDetails;
  verifiedStatus: VerifiedStatus;
  createdAt: string;
}

export interface ListingRecord {
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
  storageType: StorageType;
  dietaryTags: string[];
  allergens: string[];
  pickupWindowStart: string;
  pickupWindowEnd: string;
  pickupInstructions: string;
  imageUrl?: string;
  status: ListingStatus;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
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
  targetType: 'LISTING' | 'USER' | 'REQUEST';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AuthJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
