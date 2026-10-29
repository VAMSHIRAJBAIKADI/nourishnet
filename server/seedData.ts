import bcrypt from 'bcryptjs';
import { UserRecord, ListingRecord, RequestRecord, AuditLogRecord, ClaimRecord } from './types';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

export const DEFAULT_HASH = bcrypt.hashSync('Password123!', 10);

export const SEED_DATA: {
  users: UserRecord[];
  listings: ListingRecord[];
  requests: RequestRecord[];
  claims: ClaimRecord[];
  auditLogs: AuditLogRecord[];
} = {
  users: [
    {
      id: 'user-donor-default',
      name: 'Chef Marcus Vance',
      email: 'donor@nourishnet.org',
      passwordHash: DEFAULT_HASH,
      password_hash: DEFAULT_HASH,
      role: 'DONOR',
      organizationName: 'Grand Hotel Restaurant & Banquets',
      organizationDetails: {
        type: 'Grand Hotel Restaurant & Banquets',
        name: 'Grand Hotel Restaurant & Banquets',
        contactPerson: 'Chef Marcus Vance',
        phone: '(555) 234-8901',
        address: '450 Grand Avenue, Downtown Metro',
        neighborhood: 'Downtown',
        licenseNumber: 'FD-LIC-2024-8841',
        foodSafetyCert: 'ServSafe Manager #SS-99214',
        description: 'Premier downtown hotel producing freshly catered meals and executive banquet platters.'
      },
      verifiedStatus: 'VERIFIED',
      verified_status: 'VERIFIED',
      createdAt: hoursAgo(120),
      created_at: hoursAgo(120)
    },
    {
      id: 'user-donor-1',
      name: 'Chef Marcus Vance',
      email: 'chef@grandhotel.com',
      passwordHash: DEFAULT_HASH,
      password_hash: DEFAULT_HASH,
      role: 'DONOR',
      organizationName: 'Grand Hotel Restaurant & Banquets',
      organizationDetails: {
        type: 'Grand Hotel Restaurant & Banquets',
        name: 'Grand Hotel Restaurant & Banquets',
        contactPerson: 'Chef Marcus Vance',
        phone: '(555) 234-8901',
        address: '450 Grand Avenue, Downtown Metro',
        neighborhood: 'Downtown',
        licenseNumber: 'FD-LIC-2024-8841',
        foodSafetyCert: 'ServSafe Manager #SS-99214',
        description: 'Premier downtown hotel producing freshly catered meals and executive banquet platters.'
      },
      verifiedStatus: 'VERIFIED',
      verified_status: 'VERIFIED',
      createdAt: hoursAgo(120),
      created_at: hoursAgo(120)
    },
    {
      id: 'user-recipient-default',
      name: 'Sarah Jenkins',
      email: 'recipient@nourishnet.org',
      passwordHash: DEFAULT_HASH,
      password_hash: DEFAULT_HASH,
      role: 'RECIPIENT_NGO',
      organizationName: 'Hope Community Kitchen',
      organizationDetails: {
        type: 'Hope Community Kitchen',
        name: 'Hope Community Kitchen',
        contactPerson: 'Sarah Jenkins',
        phone: '(555) 678-4321',
        address: '210 Pine Street, Downtown',
        neighborhood: 'Downtown',
        taxExemptId: '501(c)(3) EIN: 84-2910394',
        dailyMeals: 280,
        coldStorageCapacity: 'Large Commercial Walk-in Cooler (350 cu ft) + 2 Freezers',
        transportTypes: ['Refrigerated Cargo Van (Ford Transit)', 'Volunteer SUV with Thermal Coolers'],
        description: 'Serving hot, nutritious lunch and dinner 7 days a week to community members.'
      },
      verifiedStatus: 'VERIFIED',
      verified_status: 'VERIFIED',
      createdAt: hoursAgo(150),
      created_at: hoursAgo(150)
    },
    {
      id: 'user-recipient-1',
      name: 'Sarah Jenkins',
      email: 'sarah@hopekitchen.org',
      passwordHash: DEFAULT_HASH,
      password_hash: DEFAULT_HASH,
      role: 'RECIPIENT',
      organizationName: 'Hope Community Kitchen',
      organizationDetails: {
        type: 'Hope Community Kitchen',
        name: 'Hope Community Kitchen',
        contactPerson: 'Sarah Jenkins',
        phone: '(555) 678-4321',
        address: '210 Pine Street, Downtown',
        neighborhood: 'Downtown',
        taxExemptId: '501(c)(3) EIN: 84-2910394',
        dailyMeals: 280,
        coldStorageCapacity: 'Large Commercial Walk-in Cooler (350 cu ft) + 2 Freezers',
        transportTypes: ['Refrigerated Cargo Van (Ford Transit)', 'Volunteer SUV with Thermal Coolers'],
        description: 'Serving hot, nutritious lunch and dinner 7 days a week to community members.'
      },
      verifiedStatus: 'VERIFIED',
      verified_status: 'VERIFIED',
      createdAt: hoursAgo(150),
      created_at: hoursAgo(150)
    },
    {
      id: 'user-admin-1',
      name: 'Elena Vance (Compliance Lead)',
      email: 'admin@nourishnet.org',
      passwordHash: DEFAULT_HASH,
      password_hash: DEFAULT_HASH,
      role: 'ADMIN',
      organizationName: 'NourishNet Food Safety Board',
      organizationDetails: {
        type: 'NourishNet Food Safety & Administration Board',
        name: 'NourishNet Food Safety & Administration Board',
        contactPerson: 'Elena Vance',
        phone: '(555) 100-2000',
        address: '100 Federal Square, Suite 400',
        description: 'Platform regulatory oversight, non-profit tax verification, and food safety standards.'
      },
      verifiedStatus: 'VERIFIED',
      verified_status: 'VERIFIED',
      createdAt: hoursAgo(200),
      created_at: hoursAgo(200)
    }
  ],
  listings: [
    {
      id: 'list-1',
      donorId: 'user-donor-default',
      donor_id: 'user-donor-default',
      donorName: 'Grand Hotel Restaurant & Banquets',
      donorVerified: true,
      title: 'Gourmet Herb-Roasted Chicken & Steamed Market Vegetables',
      description: 'Fresh surplus from executive dinner banquet. Roasted bone-in chicken thighs with rosemary and garlic, served with honey-glazed carrots, steamed broccoli florets, and yukon potato mash. Blast-chilled according to health code standards.',
      category: 'PREPARED',
      storage_temp: 'Refrigerated',
      storageType: 'REFRIGERATED',
      quantity_portions: 45,
      quantity: '45 portions (15 deep stainless pans)',
      estimatedMeals: 45,
      weight_kg: 22.5,
      weightKg: 22.5,
      prepareTime: hoursAgo(2),
      expiry_timestamp: hoursFromNow(5),
      expiryTime: hoursFromNow(5),
      locationAddress: '450 Grand Avenue, Downtown Metro',
      neighborhood: 'Downtown',
      dietaryTags: ['gluten_free', 'dairy_free', 'halal'],
      allergens: ['Garlic', 'No nuts', 'No gluten'],
      pickupWindowStart: hoursFromNow(0.5),
      pickupWindowEnd: hoursFromNow(4),
      pickupInstructions: 'Dock B on rear courtyard alley. Bring heavy duty catering boxes or cambro insulated carriers.',
      imageUrl: '/src/assets/images/prepared_catering_meals_1793181937634.jpg',
      status: 'LIVE',
      createdAt: hoursAgo(2),
      created_at: hoursAgo(2),
      updatedAt: hoursAgo(2)
    },
    {
      id: 'list-2',
      donorId: 'user-donor-default',
      donor_id: 'user-donor-default',
      donorName: 'Grand Hotel Restaurant & Banquets',
      donorVerified: true,
      title: 'Artisan Continental Breakfast Pastries & Bagels',
      description: 'Morning corporate conference surplus. Sealed bakery boxes with butter croissants, cinnamon rolls, blueberry danishes, and fresh NY style bagels.',
      category: 'BAKERY',
      storage_temp: 'Ambient',
      storageType: 'AMBIENT',
      quantity_portions: 40,
      quantity: '40 assorted pastries & bagels',
      estimatedMeals: 40,
      weight_kg: 8.5,
      weightKg: 8.5,
      prepareTime: hoursAgo(5),
      expiry_timestamp: hoursFromNow(16),
      expiryTime: hoursFromNow(16),
      locationAddress: '450 Grand Avenue, Downtown Metro',
      neighborhood: 'Downtown',
      dietaryTags: ['vegetarian'],
      allergens: ['Wheat', 'Dairy', 'Eggs'],
      pickupWindowStart: hoursFromNow(0),
      pickupWindowEnd: hoursFromNow(4),
      pickupInstructions: 'Kitchen entrance at Dock B. Inquire with sous-chef on duty.',
      imageUrl: '/src/assets/images/hero_surplus_food_1793181935977.jpg',
      status: 'LIVE',
      createdAt: hoursAgo(5),
      created_at: hoursAgo(5),
      updatedAt: hoursAgo(5)
    },
    {
      id: 'list-3',
      donorId: 'user-donor-default',
      donor_id: 'user-donor-default',
      donorName: 'GreenValley Organic Mart',
      donorVerified: true,
      title: 'Organic Farm Harvest Crates: Heirloom Tomatoes, Kale, Apples & Squash',
      description: 'Wholesome organic farm surplus overstocked this morning. Includes 3 crates of ripe heirloom tomatoes, 2 crates of lacinato kale bunches, crisp gala apples, and butternut squash.',
      category: 'PRODUCE',
      storage_temp: 'Ambient',
      storageType: 'AMBIENT',
      quantity_portions: 85,
      quantity: '8 wooden crates (approx. 90 kg)',
      estimatedMeals: 85,
      weight_kg: 90.0,
      weightKg: 90.0,
      prepareTime: hoursAgo(3),
      expiry_timestamp: hoursFromNow(48),
      expiryTime: hoursFromNow(48),
      locationAddress: '1120 Harvest Boulevard, Midtown East',
      neighborhood: 'Midtown',
      dietaryTags: ['vegan', 'gluten_free', 'kosher', 'halal'],
      allergens: ['None'],
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(8),
      pickupInstructions: 'Back receiving bay 2. Forklift assistance available if picking up with a van or truck.',
      imageUrl: '/src/assets/images/fresh_produce_crates_1793181937574.jpg',
      status: 'LIVE',
      createdAt: hoursAgo(3),
      created_at: hoursAgo(3),
      updatedAt: hoursAgo(3)
    }
  ],
  requests: [
    {
      id: 'req-1',
      listingId: 'list-1',
      listingTitle: 'Gourmet Herb-Roasted Chicken & Steamed Market Vegetables',
      donorId: 'user-donor-default',
      donorName: 'Grand Hotel Restaurant & Banquets',
      recipientId: 'user-recipient-default',
      recipientName: 'Hope Community Kitchen',
      recipientPhone: '(555) 678-4321',
      requestedMeals: 45,
      pickupVolunteer: 'David Miller (Staff Driver)',
      volunteerPhone: '(555) 301-4492',
      vehicleType: 'Refrigerated Cargo Van (White Ford Transit)',
      pickupTime: hoursFromNow(1.5),
      notes: 'For tonight’s 6:00 PM community dinner serving ~160 neighbors. We have cambro hot carriers.',
      status: 'PENDING',
      pickupCode: 'NOURISH-884',
      timestamp: hoursAgo(1)
    }
  ],
  claims: [
    {
      id: 'claim-1',
      listing_id: 'list-1',
      listingId: 'list-1',
      recipient_id: 'user-recipient-default',
      recipientId: 'user-recipient-default',
      status: 'PENDING',
      claimed_at: hoursAgo(1),
      timestamp: hoursAgo(1),
      listingTitle: 'Gourmet Herb-Roasted Chicken & Steamed Market Vegetables',
      donorId: 'user-donor-default',
      donorName: 'Grand Hotel Restaurant & Banquets',
      recipientName: 'Hope Community Kitchen',
      notes: 'Scheduled pickup with refrigerated cargo van.'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      adminId: 'user-admin-1',
      adminName: 'Elena Vance',
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER',
      targetId: 'user-donor-default',
      details: 'Approved health permit & ServSafe certification for Grand Hotel Restaurant & Banquets.',
      timestamp: hoursAgo(120)
    },
    {
      id: 'log-2',
      adminId: 'user-admin-1',
      adminName: 'Elena Vance',
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER',
      targetId: 'user-recipient-default',
      details: 'Verified 501(c)(3) tax exempt status for Hope Community Kitchen.',
      timestamp: hoursAgo(150)
    }
  ]
};
