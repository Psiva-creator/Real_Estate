import { db } from '../database.js';
import { hashPassword } from '../../middleware/auth.js';
import { ALL_13_DOCS } from '../../middleware/security.js';
import { User, Owner, Property, UserRole, PropertyStatus } from '../../types/index.js';

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
  type: 'LAND' | 'FLAT';
  status: PropertyStatus;
  titleEn: string;
  titleTe?: string;
  descriptionEn: string;
  descriptionTe?: string;
  location: any;
  land?: any;
  flat?: any;
  pricing: any;
  mainImage: string;
  galleryImages?: string[];
  sitePlanImage?: string;
  isFeatured?: boolean;
}): Promise<Property> {
  const allProps = await db.listAllProperties();
  let existing: Property | undefined = allProps.find((p) => p.titleEn === data.titleEn);
  if (!existing && data.id) {
    const byId = await db.findPropertyById(data.id);
    if (byId) existing = byId;
  }
  if (existing) {
    const updated = await db.updateProperty(existing.id, {
      sellerId: data.sellerId,
      type: data.type,
      status: data.status,
      titleEn: data.titleEn,
      titleTe: data.titleTe,
      descriptionEn: data.descriptionEn,
      descriptionTe: data.descriptionTe,
      location: data.location,
      land: data.land,
      flat: data.flat,
      pricing: data.pricing,
      mainImage: data.mainImage,
      galleryImages: data.galleryImages || [],
      sitePlanImage: data.sitePlanImage,
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

  // 4. Create / Upsert Properties across Tiers 1, 2, 3 (Exactly 6 properties)
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

  // 5. Create / Upsert Exactly 78 Property Documents (13 per property)
  const verifiedProps = [prop1, prop2, prop3, prop4];
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
  console.log(`- Users: 6 (1 Admin, 2 Agents, 3 Sellers)`);
  console.log(`- Sourced Sellers: 3`);
  console.log(`- Properties: 6 (4 LIVE & Verified, 1 UNDER_REVIEW, 1 DRAFT)`);
  console.log(`- Property Documents: 78 (53 Verified, 1 Uploaded, 24 Pending)`);
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
