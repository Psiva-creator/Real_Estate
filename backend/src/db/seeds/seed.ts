import { db } from '../database.js';
import { hashPassword } from '../../middleware/auth.js';
import { ALL_13_DOCS } from '../../middleware/security.js';
import { User, Owner, Property, PropertyType, UserRole, PropertyStatus } from '../../types/index.js';

async function upsertUser(data: {
  id?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}): Promise<User> {
  let existing = await db.findUserByEmail(data.email);
  if (!existing) {
    existing = await db.findUserByPhone(data.phone);
  }
  if (!existing && data.id) {
    existing = await db.findUserById(data.id);
  }
  if (existing) {
    return await db.updateUser(existing.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      role: data.role,
      passwordHash: data.passwordHash,
      isActive: data.isActive,
    });
  }
  return await db.createUser(data);
}

async function upsertOwner(data: {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  aadharNumber: string;
  propertiesCount: number;
  dealsCompleted: number;
  rating: number;
}): Promise<Owner> {
  let existing = await db.findOwnerByUserId(data.userId);
  if (!existing) {
    existing = await db.findOwnerByPhone(data.phone);
  }
  if (!existing && data.email) {
    existing = await db.findOwnerByEmail(data.email);
  }
  if (!existing && data.id) {
    existing = await db.findOwnerById(data.id);
  }
  if (existing) {
    return await db.updateOwner(existing.id, {
      userId: data.userId,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      aadharNumber: data.aadharNumber,
      propertiesCount: data.propertiesCount,
      dealsCompleted: data.dealsCompleted,
      rating: data.rating,
    });
  }
  return await db.createOwner(data);
}

async function upsertProperty(data: {
  id?: string;
  sellerId: string;
  type: PropertyType;
  status: PropertyStatus;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: any;
  land?: any;
  flat?: any;
  villa?: any;
  pricing: any;
  mainImage: string;
  galleryImages?: string[];
  sitePlanImage?: string;
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
  isFeatured?: boolean;
  projectHighlights?: string[];
  locationHighlights?: string[];
  bankApprovals?: string[];
  externalLinks?: {
    projectLink?: string;
    mapLink?: string;
    website?: string;
  };
  specialAttractions?: string[];
  discrepancyNotes?: string[];
  paymentTerms?: string[];
  inventory?: Array<{
    unitNumber: string;
    facing: string;
    plotAreaSqYards?: number;
    builtUpAreaSqFt?: number;
    status: string;
  }>;
  bookingAmount?: number;
  monthlyInstallment?: number;
  tenureMonths?: number;
  promotedBy?: string;
  reraNumber?: string;
}): Promise<Property> {
  const allProps = await db.listAllProperties();
  let existing: Property | undefined = allProps.find((p) => p.titleEn === data.titleEn);
  if (!existing && data.id) {
    const byId = await db.findPropertyById(data.id);
    if (byId) existing = byId;
  }
  if (existing) {
    const updated = await db.updateProperty(existing.id, {
      ...data,
      galleryImages: data.galleryImages || [],
      isFeatured: data.isFeatured ?? false,
    });
    return updated ?? existing;
  }
  return await db.createProperty({
    ...data,
    galleryImages: data.galleryImages || [],
    isFeatured: data.isFeatured ?? false,
  });
}

export async function runSeeds() {
  console.log('🌱 Seeding database with Telangana & Hyderabad real-estate dataset...');

  // Standard development / testing password hash (Admin@1234)
  const passwordHash = await hashPassword('Admin@1234');

  // 1. Upsert Team Users (Admin & Agents)
  const allUsers = await db.listUsers();
  const adminId = allUsers.find((u) => u.email === 'admin@telanganarealty.in')?.id || 'acb3448c-8b52-4388-8f19-b2eae7794132';
  const agent1Id = allUsers.find((u) => u.email === 'suresh.reddy@telanganarealty.in')?.id || '7ab173b7-4f2f-49d8-8eda-5776249da5d6';
  const agent2Id = allUsers.find((u) => u.email === 'lavanya.rao@telanganarealty.in')?.id || '37ebcb56-6532-41f9-8a2a-7c5d923f6931';

  const admin = await upsertUser({
    id: adminId,
    name: 'Siva Krishna (Lead Director)',
    email: 'admin@telanganarealty.in',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  });

  const agent1 = await upsertUser({
    id: agent1Id,
    name: 'Suresh Reddy (Senior Land Advisor)',
    email: 'suresh.reddy@telanganarealty.in',
    phone: '+919876543211',
    whatsapp: '+919876543211',
    passwordHash,
    role: 'AGENT',
    isActive: true,
  });

  const agent2 = await upsertUser({
    id: agent2Id,
    name: 'Lavanya Rao (Residential Specialist)',
    email: 'lavanya.rao@telanganarealty.in',
    phone: '+919876543212',
    whatsapp: '+919876543212',
    passwordHash,
    role: 'AGENT',
    isActive: true,
  });

  // 2. Create / Upsert Seller Users (role = SELLER)
  const seller1User = await upsertUser({
    name: 'K. Venkateshwara Rao',
    email: 'kvrao.hyderabad@gmail.com',
    phone: '+919848011223',
    whatsapp: '+919848011223',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  const seller2User = await upsertUser({
    name: 'M. Anitha Reddy',
    email: 'anitha.reddy@yahoo.com',
    phone: '+919849022334',
    whatsapp: '+919849022334',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  const seller3User = await upsertUser({
    name: 'B. Satish Goud',
    email: 'satish.goud77@gmail.com',
    phone: '+919440033445',
    whatsapp: '+919440033445',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  // 3. Create / Upsert Sourced Sellers (Owners linked to Seller Users)
  const allOwners = await db.listOwners();
  const owner1Id = allOwners.find((o) => o.userId === seller1User.id || o.phone === '+919848011223')?.id || '4b5785de-7508-429b-81c9-5c81f686ac6b';
  const owner2Id = allOwners.find((o) => o.userId === seller2User.id || o.phone === '+919849022334')?.id || 'b5dfe5ab-939e-4ae5-93d7-2154fd864f15';
  const owner3Id = allOwners.find((o) => o.userId === seller3User.id || o.phone === '+919440033445')?.id || '93b0feda-e005-4b0e-86ec-fc394d2d7787';

  const seller1 = await upsertOwner({
    id: owner1Id,
    userId: seller1User.id,
    name: 'K. Venkateshwara Rao',
    phone: '+919848011223',
    whatsapp: '+919848011223',
    email: 'kvrao.hyderabad@gmail.com',
    aadharNumber: '458912345678',
    propertiesCount: 2,
    dealsCompleted: 3,
    rating: 4.9,
  });

  const seller2 = await upsertOwner({
    id: owner2Id,
    userId: seller2User.id,
    name: 'M. Anitha Reddy',
    phone: '+919849022334',
    whatsapp: '+919849022334',
    email: 'anitha.reddy@yahoo.com',
    aadharNumber: '569023456789',
    propertiesCount: 2,
    dealsCompleted: 1,
    rating: 4.8,
  });

  const seller3 = await upsertOwner({
    id: owner3Id,
    userId: seller3User.id,
    name: 'B. Satish Goud',
    phone: '+919440033445',
    whatsapp: '+919440033445',
    email: 'satish.goud77@gmail.com',
    aadharNumber: '670134567890',
    propertiesCount: 2,
    dealsCompleted: 4,
    rating: 5.0,
  });

  const nskUser = await upsertUser({
    name: 'NSK Group LLP',
    email: 'contact@nskgroupllp.com',
    phone: '+919392559013',
    whatsapp: '+919392559013',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  const nskSeller = await upsertOwner({
    id: 'b5dfe5ab-939e-4ae5-93d7-2154fd864f99',
    userId: nskUser.id,
    name: 'NSK Group LLP',
    phone: '+919392559013',
    whatsapp: '+919392559013',
    email: 'contact@nskgroupllp.com',
    aadharNumber: '999900001111',
    propertiesCount: 1,
    dealsCompleted: 1,
    rating: 5.0,
  });

  const seller4User = await upsertUser({
    name: 'Dr. K. Sitarama Raju',
    email: 'dr.raju.mokila@gmail.com',
    phone: '+919848033445',
    whatsapp: '+919848033445',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  const seller5User = await upsertUser({
    name: 'Smt. G. Vasundhara Devi',
    email: 'vasundhara.devi.farms@gmail.com',
    phone: '+919440177889',
    whatsapp: '+919440177889',
    passwordHash,
    role: 'SELLER',
    isActive: true,
  });

  const owner4Id = allOwners.find((o) => o.userId === seller4User.id || o.phone === '+919848033445')?.id || '78124567-8901-4b12-9c34-d14285703901';
  const owner5Id = allOwners.find((o) => o.userId === seller5User.id || o.phone === '+919440177889')?.id || '89235678-9012-4c23-8d45-e25396814012';

  const seller4 = await upsertOwner({
    id: owner4Id,
    userId: seller4User.id,
    name: 'Dr. K. Sitarama Raju',
    phone: '+919848033445',
    whatsapp: '+919848033445',
    email: 'dr.raju.mokila@gmail.com',
    aadharNumber: '781245678901',
    propertiesCount: 1,
    dealsCompleted: 2,
    rating: 5.0,
  });

  const seller5 = await upsertOwner({
    id: owner5Id,
    userId: seller5User.id,
    name: 'Smt. G. Vasundhara Devi',
    phone: '+919440177889',
    whatsapp: '+919440177889',
    email: 'vasundhara.devi.farms@gmail.com',
    aadharNumber: '892356789012',
    propertiesCount: 1,
    dealsCompleted: 1,
    rating: 4.9,
  });

  // 4. Create / Upsert Properties across Tiers 1, 2, 3
  const prop1Id = '6787eca4-b72f-4669-bc65-cd2f51f12672';
  const prop2Id = '844e0cc2-72f6-42a7-b991-cbb1d9693737';

  // Property 1: Kokapet Commercial Land (Tier 2, LIVE, 100% Verified)
  const prop1 = await upsertProperty({
    id: prop1Id,
    sellerId: seller1.id,
    type: 'LAND',
    status: 'LIVE',
    titleEn: '25 Acres Prime Commercial / IT Corridor Land in Kokapet SEZ',
    titleTe: 'కోకాపేట SEZ వద్ద 25 ఎకరాల ప్రైమ్ కమర్షియల్ / ఐటీ కారిడార్ భూమి',
    descriptionEn:
      'Clear title 25-acre land parcel located adjacent to Kokapet Neopolis layout. Just 2.8 km from Outer Ring Road (ORR) Junction 1. 100-feet master plan road frontage, uninterrupted water and 33KV power feeder line. Ideal for high-rise commercial towers or SEZ expansion.',
    descriptionTe:
      'కోకాపేట నియోపోలిస్ లేఅవుట్ సమీపంలో 25 ఎకరాల క్లియర్ టైటిల్ భూమి. ఔటర్ రింగ్ రోడ్ (ORR) నుండి కేవలం 2.8 కి.మీ దూరం. 100 అడుగుల మాస్టర్ ప్లాన్ రోడ్డు ఫేసింగ్, మంచినీరు మరియు 33KV విద్యుత్ సదుపాయం కలదు.',
    location: {
      district: 'Rangareddy',
      mandal: 'Gandipet',
      village: 'Kokapet',
      latitude: 17.3986,
      longitude: 78.3245,
      distanceFromOrrKm: 2.8,
      zone: 'Commercial / High-Rise Zone',
      tier: 'TIER_2',
    },
    land: {
      totalAcres: 25.0,
      surveyNumbers: ['142/A', '142/AA', '143/1'],
      soilType: 'RED',
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 100,
      waterAvailable: true,
      electricityAvailable: true,
    },
    pricing: {
      pricePerAcre: 150000000,
      totalPrice: 3750000000,
      isNegotiable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    ],
    sitePlanImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  });

  // Property 2: Kollur R1 Residential Land (Tier 2, LIVE, 100% Verified)
  const prop2 = await upsertProperty({
    id: prop2Id,
    sellerId: seller2.id,
    type: 'LAND',
    status: 'LIVE',
    titleEn: '5.5 Acres R1 Residential Zone Land near Kollur ORR Exit 2',
    titleTe: 'కొల్లూరు ORR ఎగ్జిట్ 2 వద్ద 5.5 ఎకరాల R1 రెసిడెన్షియల్ జోన్ భూమి',
    descriptionEn:
      'Gated villa venture ready land with DTCP layout feasibility. Located in peaceful growth pocket with direct 60ft approach road. 1.2 km from Outer Ring Road service road.',
    descriptionTe:
      'విల్లా ప్రాజెక్ట్‌లకు అనువైన 5.5 ఎకరాల రెసిడెన్షియల్ R1 జోన్ భూమి. ఔటర్ రింగ్ రోడ్ సర్వీస్ రోడ్డు నుండి కేవలం 1.2 కి.మీ దూరం.',
    location: {
      district: 'Sangareddy',
      mandal: 'Ramachandrapuram',
      village: 'Kollur',
      latitude: 17.4728,
      longitude: 78.2491,
      distanceFromOrrKm: 1.2,
      zone: 'R1 Residential',
      tier: 'TIER_2',
    },
    land: {
      totalAcres: 5.5,
      surveyNumbers: ['210/P', '211'],
      soilType: 'BLACK',
      developmentLevel: 'FENCED',
      roadWidthFt: 60,
      waterAvailable: true,
      electricityAvailable: true,
    },
    pricing: {
      pricePerAcre: 80000000,
      totalPrice: 440000000,
      isNegotiable: false,
    },
    mainImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    ],
    isFeatured: true,
  });

  // Property 3: Narsingi Luxury High-Rise Penthouse (Tier 2, LIVE, 100% Verified)
  const prop3 = await upsertProperty({
    sellerId: seller3.id,
    type: 'FLAT',
    status: 'LIVE',
    titleEn: '4 BHK Ultra Luxury Sky Penthouse with Lake View in Narsingi',
    titleTe: 'నర్సింగి లేక్ వ్యూతో 4 BHK అల్ట్రా లగ్జరీ స్కై పెంట్‌హౌస్',
    descriptionEn:
      'Stunning 3,850 sqft 4-bedroom corner penthouse on 32nd floor. Floor-to-ceiling glass windows with panoramic views of Gandipet lake. 100% Vastu compliant, private sky garden, Italian marble flooring.',
    descriptionTe:
      '32వ అంతస్తులో గండిపేట చెరువు వీక్షణతో కూడిన 3,850 చదరపు అడుగుల 4 BHK పెంట్‌హౌస్. 100% వాస్తు ప్రకారం నిర్మించబడింది, ప్రైవేట్ స్కై గార్డెన్ కలదు.',
    location: {
      district: 'Rangareddy',
      mandal: 'Gandipet',
      village: 'Narsingi',
      latitude: 17.3789,
      longitude: 78.3612,
      distanceFromOrrKm: 2.1,
      zone: 'Residential High-Rise',
      tier: 'TIER_2',
    },
    flat: {
      sqft: 3850,
      bedrooms: 4,
      bathrooms: 4,
      floor: 32,
      totalFloors: 35,
      amenities: ['Clubhouse', 'Swimming Pool', 'EV Charging', 'Gym', '24/7 Security'],
      possessionStatus: 'READY_TO_MOVE',
    },
    pricing: {
      pricePerSqft: 12600,
      totalPrice: 48510000,
      isNegotiable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    isFeatured: true,
  });

  // Property 4: Kukatpally Premium 3 BHK Flat (Tier 1 Core, LIVE, 100% Verified)
  const prop4 = await upsertProperty({
    sellerId: seller1.id,
    type: 'FLAT',
    status: 'LIVE',
    titleEn: '3 BHK Gated High-Rise Apartment near Forum Sujana Mall, Kukatpally',
    titleTe: 'కూకట్‌పల్లి సుజనా మాల్ సమీపంలో 3 BHK గేటెడ్ హై-రైజ్ అపార్ట్‌మెంట్',
    descriptionEn:
      'Spacious 1,850 sqft 3 BHK apartment in landmark gated community. Walkable distance to Metro station and IT feeder bus routes. Modern clubhouse, 2 reserved car parkings.',
    descriptionTe:
      'మెట్రో స్టేషన్‌కు సమీపంలో 1,850 చదరపు అడుగుల 3 BHK గేటెడ్ అపార్ట్‌మెంట్. క్లబ్‌హౌస్ మరియు 2 కార్ పార్కింగ్ సౌకర్యాలు.',
    location: {
      district: 'Medchal-Malkajgiri',
      mandal: 'Kukatpally',
      village: 'KPHB Colony',
      latitude: 17.4849,
      longitude: 78.4138,
      distanceFromOrrKm: 12.0,
      zone: 'Core Residential',
      tier: 'TIER_1',
    },
    flat: {
      sqft: 1850,
      bedrooms: 3,
      bathrooms: 3,
      floor: 11,
      totalFloors: 14,
      amenities: ['Power Backup', 'Lift', 'Kids Play Area', 'Clubhouse'],
      possessionStatus: 'READY_TO_MOVE',
    },
    pricing: {
      pricePerSqft: 8900,
      totalPrice: 16465000,
      isNegotiable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    isFeatured: false,
  });

  // Property 5: Shamshabad Airport Land (Tier 2, UNDER_REVIEW)
  const prop5 = await upsertProperty({
    sellerId: seller2.id,
    type: 'LAND',
    status: 'UNDER_REVIEW',
    titleEn: '12 Acres Warehousing & Logistics Land near RGIA Airport, Shamshabad',
    titleTe: 'శంషాబాద్ ఎయిర్‌పోర్ట్ సమీపంలో 12 ఎకరాల లాజిస్టిక్స్ భూమి',
    descriptionEn:
      'Highway facing flat land parcel ideal for cold storage or e-commerce fulfillment center. 4.5 km from ORR Exit 16.',
    descriptionTe:
      'శంషాబాద్ ఎయిర్‌పోర్ట్ కారిడార్‌లో వేర్‌హౌసింగ్ మరియు లాజిస్టిక్స్‌కు అనువైన 12 ఎకరాల భూమి.',
    location: {
      district: 'Rangareddy',
      mandal: 'Shamshabad',
      village: 'Ootpally',
      latitude: 17.2524,
      longitude: 78.4312,
      distanceFromOrrKm: 4.5,
      zone: 'Industrial & Logistics',
      tier: 'TIER_2',
    },
    land: {
      totalAcres: 12.0,
      surveyNumbers: ['88/1', '89/2'],
      soilType: 'RED',
      developmentLevel: 'RAW',
      roadWidthFt: 80,
      waterAvailable: true,
      electricityAvailable: true,
    },
    pricing: {
      pricePerAcre: 45000000,
      totalPrice: 540000000,
      isNegotiable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    isFeatured: false,
  });

  // Property 6: Shadnagar Farmland (Tier 3 Regional Growth, DRAFT)
  const prop6 = await upsertProperty({
    sellerId: seller3.id,
    type: 'LAND',
    status: 'DRAFT',
    titleEn: '15 Acres Fertile Agri Farmland with Red Soil near Shadnagar',
    titleTe: 'షాద్‌నగర్ సమీపంలో 15 ఎకరాల ఎర్ర నేల వ్యవసాయ భూమి',
    descriptionEn:
      'Scenic agricultural land suitable for farmhouses or sandalwood/mango plantation. Active borewell with drip irrigation facility.',
    descriptionTe:
      'ఫామ్‌హౌస్‌లకు లేదా తోటల సాగుకు అనువైన 15 ఎకరాల సారవంతమైన ఎర్ర నేల భూమి. బోర్‌వెల్ సదుపాయం కలదు.',
    location: {
      district: 'Rangareddy',
      mandal: 'Farooqnagar',
      village: 'Shadnagar',
      latitude: 17.0673,
      longitude: 78.2098,
      distanceFromOrrKm: 28.5,
      zone: 'Agricultural',
      tier: 'TIER_3',
    },
    land: {
      totalAcres: 15.0,
      surveyNumbers: ['340/A'],
      soilType: 'RED',
      developmentLevel: 'FENCED',
      roadWidthFt: 30,
      waterAvailable: true,
      electricityAvailable: true,
    },
    pricing: {
      pricePerAcre: 7500000,
      totalPrice: 112500000,
      isNegotiable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    isFeatured: false,
  });

  // 4a. Real Project 1: Lotus Manapolam Lucky Plots (Narayankhed)
  const propLotusId = '10101010-1010-4010-8010-101010101010';
  const propLotus = await upsertProperty({
    id: propLotusId,
    sellerId: seller1.id,
    type: 'LAND',
    status: 'LIVE',
    titleEn: 'Lotus Manapolam Lucky Plots – Narayankhed',
    titleTe: 'లోటస్ మనపొలం లక్కీ ప్లాట్స్ – నారాయణఖేడ్',
    descriptionEn:
      'Lotus Manapolam Lucky Plots in Abendha Village, Narayankhed Mandal, Sangareddy District (Sy No 120/5 part). 121 Sq. Yards plots with 30 feet road layout, fruit plantation, 3 years free maintenance, and monthly lucky draw opportunity.',
    descriptionTe:
      'సంగారెడ్డి జిల్లా నారాయణఖేడ్ మండలం అభేంద గ్రామంలో లోటస్ మనపొలం లక్కీ ప్లాట్స్ (సర్వే నెం 120/5 పార్ట్). 121 గజాల ప్లాట్లు, 30 అడుగుల రోడ్లు, పండ్ల తోటలు, 3 సంవత్సరాల ఉచిత నిర్వహణ మరియు నెలవారీ లక్కీ డ్రా అవకాశం.',
    location: {
      district: 'Sangareddy',
      mandal: 'Narayankhed',
      village: 'Abendha',
      zone: 'Residential Layout',
      tier: 'TIER_3',
    },
    land: {
      sqYards: 121,
      surveyNumbers: ['120/5 part'],
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 30,
    },
    pricing: {
      totalPrice: 200000,
      isNegotiable: false,
    },
    mainImage: '/images/properties/lotus-manapolam/poster.jpeg',
    galleryImages: ['/images/properties/lotus-manapolam/layout-plan.png'],
    sitePlanImage: '/images/properties/lotus-manapolam/layout-plan.png',
    isFeatured: false,
    monthlyInstallment: 9999,
    tenureMonths: 20,
    specialAttractions: [
      'Lucky draw opportunity – each group consists of 100 members',
      'NOTE (discrepancy): One source states draw months are from 4th to 20th month; another source states 4th to 19th month. Both noted for transparency.',
      'Free dinner set on every plot booking',
      'Fruit plantation',
      '3 years free maintenance',
    ],
    discrepancyNotes: [
      'Source text states a chance to win 1 free plot every month from the 4th month to the 20th month; another source note states draw months are from the 4th to the 19th month.',
    ],
    paymentTerms: [
      'Total Price: ₹2,00,000',
      'Monthly installment: ₹9,999 for 20 months',
      'Monthly payment by/before the 10th',
      'Monthly draw on the 15th',
      'Terms and conditions apply',
    ],
    projectHighlights: [
      'Plot Area: 121 Sq. Yards',
      'Sy No 120/5 part, Abendha Village, Narayankhed Mandal, Sangareddy District',
      '30 feet road layout',
      'Project amenities including site office, swimming pool, park and plantation areas',
    ],
  });

  // 4b. Real Project 2: NIMZ Siri Kshetram (Narayankhed)
  const propNimzId = '20202020-2020-4020-8020-202020202020';
  const propNimz = await upsertProperty({
    id: propNimzId,
    sellerId: nskSeller.id,
    type: 'LAND',
    status: 'LIVE',
    titleEn: 'NIMZ Siri Kshetram – Narayankhed',
    titleTe: 'నిమ్జ్ సిరి క్షేత్రం – నారాయణఖేడ్',
    descriptionEn:
      'NIMZ Siri Kshetram, a 99-acre mega venture in Narayankhed promoted by NSK Group LLP. Featuring plot options of 100 Sq. Yards and 1 Gunta, jackfruit plantation, customized capsule houses, and flexible EMI payment options.',
    descriptionTe:
      'నారాయణఖేడ్‌లో ఎన్‌ఎస్‌కే గ్రూప్ ఎల్‌ఎల్‌పి వారి 99 ఎకరాల మెగా వెంచర్ నిమ్జ్ సిరి క్షేత్రం. 100 గజాలు మరియు 1 గుంట ప్లాట్ ఆప్షన్లు, పనస తోటలు, కస్టమైజ్డ్ క్యాప్సూల్ హౌస్‌లు మరియు సులభ ఈఎమ్‌ఐ చెల్లింపు అవకాశాలు.',
    promotedBy: 'NSK Group LLP',
    location: {
      district: 'Sangareddy',
      mandal: 'Narayankhed',
      village: 'Narayankhed',
      zone: 'Agro Residential Layout',
      tier: 'TIER_3',
    },
    land: {
      totalAcres: 99,
      developmentLevel: 'PARTIALLY_DEVELOPED',
      surveyNumbers: [],
    },
    pricing: {
      totalPrice: 0,
      isNegotiable: true,
    },
    mainImage: '/images/properties/nimz-siri-kshetram/poster.jpeg',
    galleryImages: [
      '/images/properties/nimz-siri-kshetram/photo-1.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-2.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-3.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-4.jpeg',
    ],
    isFeatured: false,
    projectHighlights: [
      'Project Size: 99 Acres',
      'Plot options: 100 Sq. Yards / 1 Gunta',
      'Promoted by NSK Group LLP',
      'Jackfruit plantation',
      'Customized capsule houses',
      'EMI / payment options mentioned',
    ],
    discrepancyNotes: [
      'Supplied promotional material contains conflicting price information. Exact price not disclosed.',
    ],
    paymentTerms: ['EMI / payment options mentioned'],
  });

  // 4c. Real Project 3: Vasu Sri Pride (Gandimaisamma)
  const propVspId = '30303030-3030-4030-8030-303030303030';
  const propVsp = await upsertProperty({
    id: propVspId,
    sellerId: seller2.id,
    type: 'FLAT',
    status: 'LIVE',
    titleEn: 'Vasu Sri Pride – Gandimaisamma, Hyderabad',
    titleTe: 'వాసు శ్రీ ప్రైడ్ – గండిమైసమ్మ, హైదరాబాద్',
    descriptionEn:
      'Vasu Sri Pride in Gandimaisamma, Hyderabad. TS RERA Approved (Registration No.: P02200005287), Ready to Move (RTM) 2 & 3 BHK apartments at ₹4,799 per Sft across 5.5 Acres with 330 flats, 2 commercial & 3 residential blocks, 2-level car parking, and premier bank approvals.',
    descriptionTe:
      'హైదరాబాద్ గండిమైసమ్మలో వాసు శ్రీ ప్రైడ్. TS RERA ఆమోదం (రిజిస్ట్రేషన్ నెం: P02200005287), రెడీ టు మూవ్ (RTM) 2 & 3 BHK ఫ్లాట్లు. చ.అ.కు ₹4,799. 5.5 ఎకరాల్లో 330 ఫ్లాట్లు, 2 కమర్షియల్ & 3 రెసిడెన్షియల్ బ్లాకులు, 2 స్థాయిల కార్ పార్కింగ్ మరియు ప్రముఖ బ్యాంకుల ఆమోదం.',
    reraNumber: 'P02200005287',
    location: {
      district: 'Medchal-Malkajgiri',
      mandal: 'Balanagar',
      village: 'Gandimaisamma',
      zone: 'Residential',
      tier: 'TIER_2',
    },
    flat: {
      sqft: 1175,
      bedrooms: 2,
      bathrooms: 2,
      floor: 1,
      totalFloors: 7,
      possessionStatus: 'READY_TO_MOVE',
      amenities: [
        '2 BHK: 1175 Sft, 1235 Sft',
        '3 BHK: 1380 Sft, 1575 Sft, 1605 Sft',
        '2-level car parking',
        '100% Vaastu compliant claim',
        'Well ventilated flats',
        '2 Commercial Blocks & 3 Residential Blocks',
        '330 Flats across 5.5 Acres',
      ],
    },
    pricing: {
      totalPrice: 5638825,
      pricePerSqft: 4799,
      isNegotiable: false,
    },
    mainImage: '/images/properties/vasu-sri-pride/poster.jpeg',
    galleryImages: [
      '/images/properties/vasu-sri-pride/photo-1.jpeg',
      '/images/properties/vasu-sri-pride/photo-2.jpeg',
      '/images/properties/vasu-sri-pride/photo-3.jpeg',
      '/images/properties/vasu-sri-pride/photo-4.jpeg',
      '/images/properties/vasu-sri-pride/photo-5.jpeg',
      '/images/properties/vasu-sri-pride/photo-6.jpeg',
      '/images/properties/vasu-sri-pride/photo-7.jpeg',
      '/images/properties/vasu-sri-pride/photo-8.jpeg',
      '/images/properties/vasu-sri-pride/photo-9.jpeg',
      '/images/properties/vasu-sri-pride/photo-10.jpeg',
      '/images/properties/vasu-sri-pride/floor-plan-ab.png',
      '/images/properties/vasu-sri-pride/floor-plan-c.png',
    ],
    isFeatured: true,
    projectHighlights: [
      '5.5 Acres',
      '330 Flats',
      '2 Commercial Blocks',
      '3 Residential Blocks',
      'Well ventilated flats',
      '100% Vaastu compliant claim',
      '2-level car parking',
      '2 BHK: 1175 Sft, 1235 Sft',
      '3 BHK: 1380 Sft, 1575 Sft, 1605 Sft',
      'Possession: Ready to Move (RTM)',
      'Price: ₹4,799 per Sft',
      '2 Cellar + Ground + 5 floors proposal (Block A & B, Block C)',
    ],
    locationHighlights: [
      'About 20 minutes drive from Gachibowli / Financial District',
      'Near IARE, MRIT and HITAM Engineering Colleges',
      'Close to ORR',
      'Near pharma hubs',
    ],
    bankApprovals: ['PNB', 'HDFC', 'LIC', 'SBI', 'CANARA'],
    externalLinks: {
      projectLink: 'http://bit.ly/3XZlhvM',
      mapLink: 'http://bit.ly/3F63yds',
    },
  });

  // 4d. Real Project 4: Krishna's Arena (Masjid Banda, Kondapur)
  const propKaId = '40404040-4040-4040-8040-404040404040';
  const propKa = await upsertProperty({
    id: propKaId,
    sellerId: seller1.id,
    type: 'FLAT',
    status: 'LIVE',
    titleEn: "Krishna's Arena – Masjid Banda, Kondapur, Hyderabad",
    titleTe: 'కృష్ణాస్ ఎరీనా – మసీద్ బండ, కొండాపూర్, హైదరాబాద్',
    descriptionEn:
      "Krishna's Arena in Masjid Banda, Kondapur, Hyderabad. Premium & luxurious green limited-edition 4 BHK apartments on 4000 Square Yards. Single tower with 2 Cellars + Stilt + 17 Floors, 64 corner 4 BHK units (2995 Sft to 3247 Sft), and comprehensive indoor and outdoor lifestyle amenities with G+1 Clubhouse.",
    descriptionTe:
      'కొండాపూర్ మసీద్ బండలో కృష్ణాస్ ఎరీనా. 4000 చదరపు గజాలలో ప్రీమియం లిమిటెడ్-ఎడిషన్ 4 BHK అపార్ట్‌మెంట్లు. సింగిల్ టవర్ (2 సెల్లార్లు + స్టిల్ట్ + 17 అంతస్తులు), 64 కార్నర్ 4 BHK యూనిట్లు (2995 Sft నుండి 3247 Sft) మరియు G+1 క్లబ్‌హౌస్.',
    location: {
      district: 'Rangareddy',
      mandal: 'Serilingampally',
      village: 'Masjid Banda',
      zone: 'Premium Residential',
      tier: 'TIER_1',
    },
    flat: {
      sqft: 3121,
      bedrooms: 4,
      bathrooms: 4,
      floor: 9,
      totalFloors: 17,
      possessionStatus: 'UNDER_CONSTRUCTION',
      amenities: [
        'Reception',
        'Lounge',
        'Multipurpose Hall',
        'Indoor Games',
        'Mini Theatre',
        'Fully Equipped AC Gym',
        'Couple of Guest Rooms',
        'Swimming Pool',
        'Kids Pool',
        'Terrace Seating Deck',
        'Barbeque Lawn',
        'Party Area',
        'Open Gym',
        'Badminton Court',
        'Yoga Deck',
        'Climbing Wall',
        'Elders Seating Zones',
        'Jogging Track',
        "Children's Play Area",
        'Toddler Play Area',
        'Half Basketball Court',
        'Outdoor Gym',
        'Amphitheater',
        '24/7 Security Services',
        'CCTV Surveillance',
        'Boundary Avenue Planting',
        'Reflexology Zone',
        'Centralized Gas Bank',
        'EV Charging Stations',
        'Seating Areas & Work Pots',
        'Solar Power',
        'Rainwater Harvesting',
        'Grid Planting',
        'Sandpit',
        'Car Wash',
      ],
    },
    pricing: {
      totalPrice: 0,
      isNegotiable: true,
    },
    mainImage: '/images/property-placeholder.svg',
    galleryImages: [],
    isFeatured: false,
    projectHighlights: [
      'Premium & luxurious green limited-edition 4 BHK apartments',
      '4000 Square Yards',
      'Single tower',
      '2 Cellars + Stilt + 17 Floors',
      '64 corner 4 BHK units',
      'Unit sizes: 2995 Sft to 3247 Sft',
      'G+1 Club House',
    ],
    externalLinks: {
      website: 'https://www.krishnasarena.in',
    },
    discrepancyNotes: [
      'Price, RERA details, and coordinates are not disclosed in initial promotional material.',
    ],
  });

  // 4e. Real Project 5: Kaakatiya Golden Meadows (Indresham, Patancheru)
  const propKgmId = '50505050-5050-4050-8050-505050505050';
  const propKgm = await upsertProperty({
    id: propKgmId,
    sellerId: seller2.id,
    type: 'VILLA',
    status: 'LIVE',
    titleEn: 'Kaakatiya Golden Meadows – Indresham, Patancheru',
    titleTe: 'కాకతీయ గోల్డెన్ మెడోస్ – ఇంద్రేశం, పటాన్‌చెరు',
    descriptionEn:
      'Kaakatiya Golden Meadows in Indresham, Patancheru. 1 Acre project with 20 exclusive G+2 3 BHK villas (East & West facing). Plot size 150 Sq. Yards, built-up area 2140–2250 Sft. Ready to Move, ₹1.40 Cr onwards with ₹5 Lakhs booking amount.',
    descriptionTe:
      'పటాన్‌చెరు ఇంద్రేశంలో కాకతీయ గోల్డెన్ మెడోస్. 1 ఎకరంలో 20 ప్రత్యేక G+2 3 BHK విల్లాలు (తూర్పు మరియు పడమర ముఖంగా). 150 గజాల ప్లాట్, 2140–2250 Sft బిల్ట్-అప్ ఏరియా. రెడీ టు మూవ్, ₹1.40 కోట్లు నుండి, బుకింగ్ మొత్తం ₹5 లక్షలు.',
    location: {
      district: 'Sangareddy',
      mandal: 'Patancheru',
      village: 'Indresham',
      distanceFromOrrKm: 3.5,
      zone: 'Gated Villa Community',
      tier: 'TIER_2',
    },
    pricing: {
      totalPrice: 14000000,
      pricePerSqft: 6378,
      isNegotiable: false,
    },
    villa: {
      plotAreaSqYards: 150,
      builtUpAreaSqFt: 2195,
      configuration: '3 BHK G+2',
      floors: 'G+2',
      facing: 'EAST',
      communityName: 'Kaakatiya Golden Meadows',
      gatedCommunity: true,
      bedrooms: 3,
      bathrooms: 4,
      amenities: [
        'G+2 Club House',
        'Children Play Area',
        '24/7 Surveillance Camera',
        'Gym',
        'Indoor Games',
        'Intercom Facility',
        'LED Street Lights',
        'Avenue Plantation',
        'Landscape Gardens',
        'Grand Entrance',
        'Underground Drainage',
        'Underground Water Tank',
      ],
    },
    mainImage: '/images/properties/kaakatiya-golden-meadows/poster.jpeg',
    galleryImages: [
      '/images/properties/kaakatiya-golden-meadows/photo-1.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-2.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-3.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-4.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-5.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-6.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-7.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-8.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-9.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-10.jpeg',
      '/images/properties/kaakatiya-golden-meadows/photo-11.jpeg',
    ],
    isFeatured: true,
    projectHighlights: [
      'Project Size: 1 Acre',
      'Total Villas: 20',
      'Villa Type: G+2',
      'Unit Type: 3 BHK',
      'Facing: East, West',
      'Plot Size: 150 Sq. Yards',
      'Built-up Area: 2140–2250 Sft',
      'Ready to Move',
      'Price: ₹1.40 Cr onwards',
      'Booking Amount: ₹5 Lakhs',
    ],
    locationHighlights: [
      '5 minutes to ORR',
      '10 minutes to Oakdale School',
      '10 minutes to Maheshwara Medical College',
      '10 minutes to Ellenki College of Engineering',
      '20 minutes to BHEL Township',
      '30 minutes to Financial District',
      '40 minutes to Gachibowli',
    ],
    bookingAmount: 500000,
    inventory: [
      { unitNumber: 'Villa 8', facing: 'WEST', plotAreaSqYards: 150, builtUpAreaSqFt: 2250, status: 'AVAILABLE' },
      { unitNumber: 'Villa 11', facing: 'EAST', plotAreaSqYards: 150, builtUpAreaSqFt: 2140, status: 'AVAILABLE' },
      { unitNumber: 'Villa 20', facing: 'EAST', plotAreaSqYards: 150, builtUpAreaSqFt: 2140, status: 'AVAILABLE' },
    ],
    externalLinks: {
      mapLink: 'https://maps.app.goo.gl/hnU4875',
    },
  });

  // Property 7: Mokila Ultra-Luxury Gated Villa (Tier 2, LIVE, 100% Verified)
  const prop7Id = '9a5c8e21-4f11-482a-bc93-d14285703901';
  const prop7 = await upsertProperty({
    id: prop7Id,
    sellerId: seller4.id,
    type: 'VILLA',
    status: 'LIVE',
    titleEn: '4 BHK Ultra-Luxury Triplex Gated Villa in Mokila Growth Belt',
    titleTe: 'మోకిల గ్రోత్ బెల్ట్‌లో 4 BHK అల్ట్రా లగ్జరీ ట్రిప్లెక్స్ గేటెడ్ విల్లా',
    descriptionEn:
      'Brand-new 4 BHK G+2 Triplex Villa in an upscale 40-acre gated community. 350 sq.yd plot with 4,200 sq.ft built-up area, private landscaped garden, Italian marble flooring, 30,000 sq.ft clubhouse with swimming pool, and 24/7 security. Just 8.2 km from ORR Exit 2.',
    descriptionTe:
      'మోకిల 40 ఎకరాల గేటెడ్ కమ్యూనిటీలో బ్రాండ్ న్యూ 4 BHK G+2 ట్రిప్లెక్స్ విల్లా. 350 గజాల ప్లాట్, 4,200 చ.అ. నిర్మాణం, సొంత తోట మరియు క్లబ్‌హౌస్ సదుపాయాలు.',
    location: {
      district: 'Rangareddy',
      mandal: 'Shankarpally',
      village: 'Mokila',
      latitude: 17.4201,
      longitude: 78.1923,
      distanceFromOrrKm: 8.2,
      zone: 'R1 Residential Gated',
      tier: 'TIER_2',
    },
    villa: {
      plotSqYards: 350,
      builtUpSqft: 4200,
      bedrooms: 4,
      bathrooms: 5,
      floors: 3,
      amenities: ['Clubhouse', 'Swimming Pool', 'Private Garden', 'Power Backup', '24/7 Security'],
      possessionStatus: 'READY_TO_MOVE',
    },
    pricing: {
      pricePerSqft: 11547,
      totalPrice: 48500000,
      isNegotiable: true,
    },
    boundaryCoordinates: [
      { lat: 17.4205, lng: 78.1919 },
      { lat: 17.4206, lng: 78.1927 },
      { lat: 17.4197, lng: 78.1928 },
      { lat: 17.4196, lng: 78.1918 },
    ],
    mainImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    isFeatured: true,
  });

  // Property 8: Maheshwaram Managed Agro-Farmland (Tier 2, LIVE, 100% Verified)
  const prop8Id = '5d3f9b12-7e44-461a-9821-b38421098472';
  const prop8 = await upsertProperty({
    id: prop8Id,
    sellerId: seller5.id,
    type: 'LAND',
    status: 'LIVE',
    titleEn: '2.50 Acre Clear-Title Managed Agro-Farmland in Maheshwaram Growth Belt',
    titleTe: 'మహేశ్వరం గ్రోత్ కారిడార్‌లో 2.50 ఎకరాల స్పష్టమైన టైటిల్ సాగు భూమి / వ్యవసాయ క్షేత్రం',
    descriptionEn:
      'Clear title 2.50 acre fertile agricultural land in Mansanpally Village, Maheshwaram. 350 mature Malabar Neem trees, 40 organic fruit trees, automated micro-drip irrigation, and 2 high-yield borewells. 11.5 km from ORR Exit 14 Tukkuguda.',
    descriptionTe:
      'మహేశ్వరం మండలం మాన్సన్‌పల్లిలో 2.50 ఎకరాల సాగు భూమి. 350 మలబార్ వేప చెట్లు, డ్రిప్ ఇరిగేషన్ మరియు 2 బోర్‌వెల్స్ సదుపాయం.',
    location: {
      district: 'Rangareddy',
      mandal: 'Maheshwaram',
      village: 'Mansanpally',
      latitude: 17.1824,
      longitude: 78.4356,
      distanceFromOrrKm: 11.5,
      zone: 'Agricultural & Conservation',
      tier: 'TIER_2',
    },
    land: {
      totalAcres: 2.5,
      surveyNumbers: ['184/A', '184/AA'],
      soilType: 'RED_LOAM',
      developmentLevel: 'FENCED_WITH_GATE',
      roadWidthFt: 30,
      waterAvailable: true,
      electricityAvailable: true,
    },
    pricing: {
      pricePerAcre: 12500000,
      totalPrice: 31250000,
      isNegotiable: true,
    },
    boundaryCoordinates: [
      { lat: 17.1831, lng: 78.4348 },
      { lat: 17.1832, lng: 78.4365 },
      { lat: 17.1818, lng: 78.4364 },
      { lat: 17.1817, lng: 78.4347 },
    ],
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
    ],
    isFeatured: false,
  });

  // 5. Create / Upsert Property Documents (13 per verified property)
  const verifiedProps = [prop1, prop2, prop3, prop4, prop7, prop8];
  for (const prop of verifiedProps) {
    for (const docType of ALL_13_DOCS) {
      await db.upsertDocument({
        propertyId: prop.id,
        documentType: docType,
        fileUrl: `/uploads/docs/${prop.id}/${docType}.pdf`,
        status: 'VERIFIED',
        verifiedBy: admin.id,
        verifiedAt: new Date().toISOString(),
      });
    }
  }

  // Property 5: 1 VERIFIED, 1 UPLOADED, 11 PENDING
  await db.upsertDocument({
    propertyId: prop5.id,
    documentType: 'SALE_DEED',
    fileUrl: `/uploads/docs/${prop5.id}/SALE_DEED.pdf`,
    status: 'VERIFIED',
    verifiedBy: admin.id,
    verifiedAt: new Date().toISOString(),
  });

  await db.upsertDocument({
    propertyId: prop5.id,
    documentType: 'EC',
    fileUrl: `/uploads/docs/${prop5.id}/EC.pdf`,
    status: 'UPLOADED',
  });

  const prop5PendingDocs = ALL_13_DOCS.filter((d) => d !== 'SALE_DEED' && d !== 'EC');
  for (const docType of prop5PendingDocs) {
    await db.upsertDocument({
      propertyId: prop5.id,
      documentType: docType,
      fileUrl: `/uploads/docs/${prop5.id}/${docType}.pdf`,
      status: 'PENDING',
    });
  }

  // Property 6: All 13 PENDING
  for (const docType of ALL_13_DOCS) {
    await db.upsertDocument({
      propertyId: prop6.id,
      documentType: docType,
      fileUrl: `/uploads/docs/${prop6.id}/${docType}.pdf`,
      status: 'PENDING',
    });
  }

  // Real Project 3 (Vasu Sri Pride): 1 VERIFIED (HMDA_DTCP_APPROVAL)
  await db.upsertDocument({
    propertyId: propVsp.id,
    documentType: 'HMDA_DTCP_APPROVAL',
    fileUrl: `/uploads/docs/${propVsp.id}/HMDA_DTCP_APPROVAL.pdf`,
    status: 'VERIFIED',
    verifiedBy: admin.id,
    verifiedAt: new Date().toISOString(),
  });

  // 6. Create Initial Buyer Enquiries (only if none exist to preserve existing data)
  const existingEnquiries = await db.listEnquiries();
  if (existingEnquiries.length === 0) {
    await db.createEnquiry({
      propertyId: prop1.id,
      buyerName: 'Ramesh Naidu (Tech Director)',
      phone: '+919988776655',
      whatsapp: '+919988776655',
      enquiryType: 'SITE_VISIT',
      status: 'SITE_VISIT_SCHEDULED',
      assignedTo: agent1.id,
      leadScore: 85,
      notes: 'Interested in acquiring 10-15 acres for enterprise campus development. Budget pre-approved.',
      preferredLanguage: 'en',
      followUpDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    });

    await db.createEnquiry({
      propertyId: prop3.id,
      buyerName: 'Vikram Chary',
      phone: '+919876001122',
      whatsapp: '+919876001122',
      enquiryType: 'CALL',
      status: 'ASSIGNED',
      assignedTo: agent2.id,
      leadScore: 75,
      notes: 'Enquired about floor plan, Vastu orientation, and loan pre-approvals with SBI/HDFC.',
      preferredLanguage: 'te',
    });
  }

  console.log('✅ Seeding complete!');
  console.log(`- Users & Sellers seeded successfully`);
  console.log(`- Properties & Documents seeded successfully`);
  console.log(`- Enquiries: ${existingEnquiries.length > 0 ? existingEnquiries.length : 2}`);
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
