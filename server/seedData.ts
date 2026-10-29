import bcrypt from 'bcryptjs';
import { UserRecord, ListingRecord, RequestRecord, AuditLogRecord } from './types';

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

export const DEFAULT_HASH = bcrypt.hashSync('password123', 10);

export const SEED_DATA = {
  users: [
    {
      id: 'user-donor-1',
      email: 'chef@grandhotel.com',
      passwordHash: DEFAULT_HASH,
      role: 'DONOR' as const,
      name: 'Chef Marcus Vance',
      organizationDetails: {
        type: 'Grand Hotel Restaurant & Banquets',
        contactPerson: 'Chef Marcus Vance',
        phone: '(555) 234-8901',
        address: '450 Grand Avenue, Downtown Metro',
        neighborhood: 'Downtown',
        licenseNumber: 'FD-LIC-2024-8841',
        foodSafetyCert: 'ServSafe Manager #SS-99214',
        description: 'Premier downtown hotel producing freshly catered meals and executive banquet platters.'
      },
      verifiedStatus: 'VERIFIED' as const,
      createdAt: hoursAgo(120)
    },
    {
      id: 'user-donor-2',
      email: 'surplus@greenvalleymart.org',
      passwordHash: DEFAULT_HASH,
      role: 'DONOR' as const,
      name: 'Elena Rostova',
      organizationDetails: {
        type: 'GreenValley Organic Mart',
        contactPerson: 'Elena Rostova',
        phone: '(555) 489-3120',
        address: '1120 Harvest Boulevard, Midtown East',
        neighborhood: 'Midtown',
        licenseNumber: 'GRC-STATE-55102',
        foodSafetyCert: 'HACCP Retail Certified #HC-4401',
        description: 'Regional grocery market donating surplus farm-direct organic produce and dairy.'
      },
      verifiedStatus: 'VERIFIED' as const,
      createdAt: hoursAgo(90)
    },
    {
      id: 'user-donor-unverified',
      email: 'bistro@crestview.com',
      passwordHash: DEFAULT_HASH,
      role: 'DONOR' as const,
      name: 'Julian Hayes',
      organizationDetails: {
        type: 'Crestview Bistro & Tavern',
        contactPerson: 'Julian Hayes',
        phone: '(555) 789-0123',
        address: '109 Harbor View, Eastside',
        neighborhood: 'Eastside',
        licenseNumber: 'FD-PEND-2026-09',
        foodSafetyCert: 'Pending Health Inspection Review',
        description: 'Casual neighborhood bistro with evening surplus.'
      },
      verifiedStatus: 'PENDING' as const,
      createdAt: hoursAgo(12)
    },
    {
      id: 'user-recipient-1',
      email: 'sarah@hopekitchen.org',
      passwordHash: DEFAULT_HASH,
      role: 'RECIPIENT' as const,
      name: 'Sarah Jenkins',
      organizationDetails: {
        type: 'Hope Community Kitchen',
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
      verifiedStatus: 'VERIFIED' as const,
      createdAt: hoursAgo(150)
    },
    {
      id: 'user-recipient-2',
      email: 'torres@stjudeshelter.org',
      passwordHash: DEFAULT_HASH,
      role: 'RECIPIENT' as const,
      name: 'Michael Torres',
      organizationDetails: {
        type: "St. Jude's Family Shelter",
        contactPerson: 'Michael Torres',
        phone: '(555) 912-3045',
        address: '640 Oakway Terrace, Westside District',
        neighborhood: 'Westside',
        taxExemptId: '501(c)(3) EIN: 72-1849201',
        dailyMeals: 120,
        coldStorageCapacity: '2 Double-Door Refrigerators, 1 Chest Freezer',
        transportTypes: ['Cargo Minivan with Thermal Tubs'],
        description: 'Providing emergency housing and warm meals for 40 unhoused families.'
      },
      verifiedStatus: 'VERIFIED' as const,
      createdAt: hoursAgo(100)
    },
    {
      id: 'user-admin-1',
      email: 'admin@nourishnet.org',
      passwordHash: DEFAULT_HASH,
      role: 'ADMIN' as const,
      name: 'Elena Vance (Compliance Lead)',
      organizationDetails: {
        type: 'NourishNet Food Safety & Administration Board',
        contactPerson: 'Elena Vance',
        phone: '(555) 100-2000',
        address: '100 Federal Square, Suite 400',
        description: 'Platform regulatory oversight, non-profit tax verification, and food safety standards.'
      },
      verifiedStatus: 'VERIFIED' as const,
      createdAt: hoursAgo(200)
    }
  ],
  listings: [
    {
      id: 'list-1',
      donorId: 'user-donor-1',
      donorName: 'Grand Hotel Restaurant & Banquets',
      donorVerified: true,
      title: 'Gourmet Herb-Roasted Chicken & Steamed Market Vegetables',
      description: 'Fresh surplus from executive dinner banquet. Roasted bone-in chicken thighs with rosemary and garlic, served with honey-glazed carrots, steamed broccoli florets, and yukon potato mash. Blast-chilled according to health code standards.',
      category: 'prepared',
      quantity: '45 portions (15 deep stainless pans)',
      estimatedMeals: 45,
      weightKg: 22.5,
      prepareTime: hoursAgo(2),
      expiryTime: hoursFromNow(5),
      locationAddress: '450 Grand Avenue, Downtown Metro',
      neighborhood: 'Downtown',
      storageType: 'REFRIGERATED' as const,
      dietaryTags: ['gluten_free', 'dairy_free', 'halal'],
      allergens: ['Garlic', 'No nuts', 'No gluten'],
      pickupWindowStart: hoursFromNow(0.5),
      pickupWindowEnd: hoursFromNow(4),
      pickupInstructions: 'Dock B on rear courtyard alley. Bring heavy duty catering boxes or cambro insulated carriers.',
      imageUrl: '/src/assets/images/prepared_catering_meals_1793181937634.jpg',
      status: 'AVAILABLE' as const,
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2)
    },
    {
      id: 'list-2',
      donorId: 'user-donor-1',
      donorName: 'Grand Hotel Restaurant & Banquets',
      donorVerified: true,
      title: 'Artisan Continental Breakfast Pastries & Bagels',
      description: 'Morning corporate conference surplus. Sealed bakery boxes with butter croissants, cinnamon rolls, blueberry danishes, and fresh NY style bagels.',
      category: 'bakery',
      quantity: '40 assorted pastries & bagels',
      estimatedMeals: 40,
      weightKg: 8.5,
      prepareTime: hoursAgo(5),
      expiryTime: hoursFromNow(16),
      locationAddress: '450 Grand Avenue, Downtown Metro',
      neighborhood: 'Downtown',
      storageType: 'AMBIENT' as const,
      dietaryTags: ['vegetarian'],
      allergens: ['Wheat', 'Dairy', 'Eggs'],
      pickupWindowStart: hoursFromNow(0),
      pickupWindowEnd: hoursFromNow(4),
      pickupInstructions: 'Kitchen entrance at Dock B. Inquire with sous-chef on duty.',
      imageUrl: '/src/assets/images/hero_surplus_food_1793181935977.jpg',
      status: 'AVAILABLE' as const,
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5)
    },
    {
      id: 'list-3',
      donorId: 'user-donor-2',
      donorName: 'GreenValley Organic Mart',
      donorVerified: true,
      title: 'Organic Farm Harvest Crates: Heirloom Tomatoes, Kale, Apples & Squash',
      description: 'Wholesome organic farm surplus overstocked this morning. Includes 3 crates of ripe heirloom tomatoes, 2 crates of lacinato kale bunches, crisp gala apples, and butternut squash.',
      category: 'produce',
      quantity: '8 wooden crates (approx. 90 kg)',
      estimatedMeals: 85,
      weightKg: 90.0,
      prepareTime: hoursAgo(3),
      expiryTime: hoursFromNow(48),
      locationAddress: '1120 Harvest Boulevard, Midtown East',
      neighborhood: 'Midtown',
      storageType: 'AMBIENT' as const,
      dietaryTags: ['vegan', 'gluten_free', 'kosher', 'halal'],
      allergens: ['None'],
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(8),
      pickupInstructions: 'Back receiving bay 2. Forklift assistance available if picking up with a van or truck.',
      imageUrl: '/src/assets/images/fresh_produce_crates_1793181937574.jpg',
      status: 'AVAILABLE' as const,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3)
    },
    {
      id: 'list-4',
      donorId: 'user-donor-2',
      donorName: 'GreenValley Organic Mart',
      donorVerified: true,
      title: 'Organic Whole & Almond Milk Cartons (Unopened)',
      description: 'Fresh dairy and plant milk cartons within 5 days of code date. Rotated from display to make room for new pallet. Kept in continuous cold chain at 3°C.',
      category: 'dairy',
      quantity: '48 half-gallon cartons (24 cow milk, 24 organic almond)',
      estimatedMeals: 50,
      weightKg: 45.0,
      prepareTime: hoursAgo(4),
      expiryTime: hoursFromNow(72),
      locationAddress: '1120 Harvest Boulevard, Midtown East',
      neighborhood: 'Midtown',
      storageType: 'REFRIGERATED' as const,
      dietaryTags: ['vegetarian', 'kosher'],
      allergens: ['Milk (Cow milk cartons)', 'Almonds (Almond milk cartons)'],
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(7),
      pickupInstructions: 'Direct pickup from walk-in dairy staging room.',
      status: 'AVAILABLE' as const,
      createdAt: hoursAgo(4),
      updatedAt: hoursAgo(4)
    },
    {
      id: 'list-5',
      donorId: 'user-donor-1',
      donorName: 'Grand Hotel Restaurant & Banquets',
      donorVerified: true,
      title: 'Mediterranean Penne Pasta with Braised Eggplant & San Marzano Sauce',
      description: 'Chilled vegan pasta entree with roasted zucchini, kalamata olives, capers, fresh basil, and extra virgin olive oil.',
      category: 'prepared',
      quantity: '30 generous meals',
      estimatedMeals: 30,
      weightKg: 16.0,
      prepareTime: hoursAgo(3),
      expiryTime: hoursFromNow(6),
      locationAddress: '450 Grand Avenue, Downtown Metro',
      neighborhood: 'Downtown',
      storageType: 'REFRIGERATED' as const,
      dietaryTags: ['vegan', 'dairy_free', 'halal'],
      allergens: ['Wheat'],
      pickupWindowStart: hoursFromNow(1),
      pickupWindowEnd: hoursFromNow(5),
      pickupInstructions: 'Packaged in insulated thermal pans ready for immediate reheat or freezing.',
      status: 'AVAILABLE' as const,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3)
    }
  ],
  requests: [
    {
      id: 'req-1',
      listingId: 'list-1',
      listingTitle: 'Gourmet Herb-Roasted Chicken & Steamed Market Vegetables',
      donorId: 'user-donor-1',
      donorName: 'Grand Hotel Restaurant & Banquets',
      recipientId: 'user-recipient-1',
      recipientName: 'Hope Community Kitchen',
      recipientPhone: '(555) 678-4321',
      requestedMeals: 45,
      pickupVolunteer: 'David Miller (Staff Driver)',
      volunteerPhone: '(555) 301-4492',
      vehicleType: 'Refrigerated Cargo Van (White Ford Transit)',
      pickupTime: hoursFromNow(1.5),
      notes: 'For tonight’s 6:00 PM community dinner serving ~160 neighbors. We have cambro hot carriers.',
      status: 'PENDING' as const,
      pickupCode: 'NOURISH-884',
      timestamp: hoursAgo(1)
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      adminId: 'user-admin-1',
      adminName: 'Elena Vance',
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER' as const,
      targetId: 'user-donor-1',
      details: 'Approved health permit & ServSafe certification for Grand Hotel Restaurant & Banquets.',
      timestamp: hoursAgo(120)
    },
    {
      id: 'log-2',
      adminId: 'user-admin-1',
      adminName: 'Elena Vance',
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER' as const,
      targetId: 'user-recipient-1',
      details: 'Verified 501(c)(3) tax exempt status for Hope Community Kitchen.',
      timestamp: hoursAgo(150)
    }
  ]
};
