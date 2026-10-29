export type Role = 'donor' | 'recipient' | 'admin';

export type FoodCategory = 
  | 'prepared' 
  | 'produce' 
  | 'bakery' 
  | 'dairy' 
  | 'packaged' 
  | 'beverages';

export type DietaryTag = 
  | 'vegetarian' 
  | 'vegan' 
  | 'halal' 
  | 'kosher' 
  | 'gluten_free' 
  | 'dairy_free' 
  | 'nut_free';

export type StorageCondition = 
  | 'refrigerated' 
  | 'frozen' 
  | 'ambient' 
  | 'hot_hold';

export type ListingStatus = 
  | 'available' 
  | 'reserved' 
  | 'completed' 
  | 'cancelled' 
  | 'flagged';

export type RequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed';

export interface FoodListing {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  donorVerified: boolean;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  estimatedMeals: number;
  weightKg: number;
  dietaryTags: DietaryTag[];
  storageCondition: StorageCondition;
  prepTime: string; // ISO date-time string
  expiryTime: string; // ISO date-time string
  pickupAddress: string;
  distanceKm: number;
  neighborhood: string;
  pickupWindowStart: string; // ISO date-time string
  pickupWindowEnd: string; // ISO date-time string
  pickupInstructions: string;
  allergens: string[];
  status: ListingStatus;
  imageUrl?: string;
  createdAt: string;
  activeRequestsCount: number;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface DonationRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  recipientContact: string;
  recipientAddress: string;
  requestedMeals: number;
  pickupVolunteer: string;
  volunteerPhone: string;
  vehicleType: string;
  estimatedPickupTime: string;
  notes: string;
  status: RequestStatus;
  requestedAt: string;
  pickupCode: string;
  rejectionReason?: string;
  completedAt?: string;
}

export interface DonorProfile {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  licenseNumber: string;
  foodSafetyCert: string;
  verified: boolean;
  operatingHours: string;
  pickupInstructions: string;
  description: string;
}

export interface RecipientProfile {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  taxExemptId: string; // 501(c)(3) or charity reg
  verified: boolean;
  beneficiariesServedDaily: number;
  coldStorageCapacity: string;
  transportTypes: string[];
  preferredCategories: FoodCategory[];
  description: string;
}

export interface VerificationApplication {
  id: string;
  orgId: string;
  orgName: string;
  orgRole: 'donor' | 'recipient';
  documentType: string;
  documentRef: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  details: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
