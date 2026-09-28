import { AdminPropertyDetails } from '@/types/adminDetails';

export type PropertyType = 'LAND' | 'FLAT' | 'VILLA';
export type PropertyStatus = 'DRAFT' | 'UNDER_REVIEW' | 'VERIFIED' | 'LIVE' | 'SOLD' | 'OFF_MARKET';
export type ServiceTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface LocationDetails {
  village: string;
  mandal: string;
  district: string;
  distanceFromOrrKm?: number;
  zone: string;
  tier: ServiceTier;
  landmark?: string;
  landmarkTe?: string;
  latitude?: number;
  longitude?: number;
}

export interface LandDetails {
  totalAcres?: number;
  sqYards?: number;
  surveyNumbers: string[];
  soilType?: 'RED' | 'BLACK' | 'MIXED' | string;
  developmentLevel: 'RAW' | 'FENCED' | 'PARTIALLY_DEVELOPED' | 'VENTURE_READY';
  roadWidthFt?: number;
  waterAvailable?: boolean;
  electricityAvailable?: boolean;
}

export interface FlatDetails {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  amenities: string[];
  possessionStatus: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';
  furnishingStatus?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
}

export interface VillaDetails {
  plotAreaSqYards?: number;
  builtUpAreaSqFt?: number;
  configuration?: string;
  floors?: string;
  facing?: 'EAST' | 'WEST' | 'NORTH' | 'SOUTH' | string;
  communityName?: string;
  gatedCommunity?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

export interface PricingDetails {
  totalPrice: number;
  pricePerSqft?: number;
  pricePerAcre?: number;
  pricePerSqYard?: number;
  isNegotiable: boolean;
}

export interface MockProperty {
  id: string;
  title: string;
  titleTe: string;
  description: string;
  descriptionTe: string;
  type: PropertyType;
  status: PropertyStatus;
  location: LocationDetails;
  pricing: PricingDetails;
  land?: LandDetails;
  flat?: FlatDetails;
  villa?: VillaDetails;
  mainImage: string;
  galleryImages: string[];
  sitePlanImage?: string;
  verifiedDocsCount: number;
  totalDocsRequired: number;
  isFeatured: boolean;
  isOrrCorridor: boolean;
  dharaniApproved?: boolean;
  hmdaApproved?: boolean;
  reraApproved?: boolean;
  // Extended project metadata (for real projects with promotional materials)
  projectHighlights?: string[];
  locationHighlights?: string[];
  bankApprovals?: string[];
  externalLinks?: {
    projectLink?: string;
    mapLink?: string;
    website?: string;
  };
  specialAttractions?: string[];
  /** Transparent audit trail for conflicting promotional information */
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
  adminDetails?: AdminPropertyDetails;
}

export const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: 'PROP-HYD-001',
    title: 'Luxury 3 BHK High-Rise in Neopolis Corridor',
    titleTe: 'నియోపోలిస్ కారిడార్‌లో లగ్జరీ 3 BHK హై-రైజ్ ఫ్లాట్',
    description: 'Ultra-luxurious 3 BHK apartment in Kokapet Golden Mile zone. 100% HMDA and RERA approved project with 30-year EC and clear legal title vetted by senior High Court advocates.',
    descriptionTe: 'కోకాపేట్ గోల్డెన్ మైల్ జోన్‌లో అల్ట్రా-లగ్జరీ 3 BHK అపార్ట్‌మెంట్. 30 సంవత్సరాల క్లియర్ ఈసీ మరియు సీనియర్ న్యాయవాదులచే 100% ధృవీకరించబడిన HMDA ప్రాజెక్ట్.',
    type: 'FLAT',
    status: 'VERIFIED',
    location: {
      village: 'Kokapet',
      mandal: 'Gandipet',
      district: 'Rangareddy',
      distanceFromOrrKm: 1.2,
      zone: 'Residential R1 High-Rise',
      tier: 'TIER_2',
      landmark: 'Near Neopolis Financial SEZ, Exit 1',
      landmarkTe: 'నియోపోలిస్ ఫైనాన్షియల్ సెజ్ సమీపంలో, ఎగ్జిట్ 1',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.3986,
      longitude: 78.3245,
    },
    pricing: {
      totalPrice: 28500000, // ₹2.85 Cr
      pricePerSqft: 11630,
      isNegotiable: false,
    },
    flat: {
      sqft: 2450,
      bedrooms: 3,
      bathrooms: 3,
      floor: 18,
      totalFloors: 35,
      amenities: ['Clubhouse 50,000 sqft', 'Infinity Swimming Pool', '2 Car Parking', '100% DG Power Backup'],
      possessionStatus: 'READY_TO_MOVE',
      furnishingStatus: 'SEMI_FURNISHED',
    },
    mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    hmdaApproved: true,
    reraApproved: true,
    adminDetails: {
      projectDescription: 'Premium high-rise tower curated directly by TRH Desk. Structural inspection and title chain vetted for 30 consecutive revenue years. Prime residential corridor with immediate connectivity to Neopolis SEZ.',
      highlights: [
        '30-year unencumbered title verified by senior High Court advocate',
        'Adjacent to 100-foot master plan connecting road',
        'Ready for immediate registration and title deed execution',
        '100% Vastu compliant north-east entrance',
      ],
      amenities: [
        '24/7 Multi-tier Security & CCTV Surveillance',
        '100% DG Power Backup for Apartment & Common Areas',
        'Clubhouse (50,000 sq.ft) with Infinity Pool',
        'Dedicated Covered Car Parking (2 Bays)',
        'EV Charging Bay Provision',
      ],
      locationAdvantages: [
        '1.2 km from ORR Exit 1 (Kokapet)',
        '5 minutes from Neopolis Financial Corridor',
        '15 minutes to Financial District & Gachibowli',
      ],
      nearbyLandmarks: [
        'Rockwell International School — 2.5 km',
        'Continental Hospital — 4.8 km',
        'Inorbit Mall Cyberabad — 9 km',
      ],
      additionalSpecifications: [
        { id: 'spec-1', label: 'Facing', value: 'East Facing Corner' },
        { id: 'spec-2', label: 'Power Backup', value: '100% Full DG Backup' },
        { id: 'spec-3', label: 'Water Source', value: 'HMWS&SB (Manjeera) + 2 High-Yield Borewells' },
        { id: 'spec-4', label: 'Flooring', value: 'Italian Marble in Living/Dining, Wooden in Master' },
      ],
      specialFeatures: [
        'Corner apartment with unobstructed valley view',
        'Three-sided ventilation with ample natural lighting',
        'Premium Kohler & Grohe sanitary fittings',
      ],
      pricingNotes: 'Quoted base price excludes registration fees and stamp duty. Home loan pre-approved with SBI, HDFC, and ICICI Bank at competitive rates.',
      siteVisitInstructions: 'Site visits are scheduled strictly with prior 2-hour notice. TRH Senior Property Advisor will accompany prospective buyers and provide the physical deed docket for verification.',
      additionalNotes: 'Maintenance charges: ₹3.50 per sq.ft per month payable directly to the resident welfare association.',
      internalNotes: 'Seller is firm on price; margin for negotiation is max 1.5% for all-cash or quick 15-day settlement. Original sale deed verified at Gandipet Sub-Registrar Office.',
      updatedAt: '2026-09-24T10:00:00Z',
      updatedBy: 'Lead Director Siva (Admin)',
    },
  },
  {
    id: 'PROP-HYD-002',
    title: 'Gated Villa Plot in Shankarpally Growth Belt',
    titleTe: 'శంకర్‌పల్లి రోడ్‌లో గేటెడ్ విల్లా ప్లాట్',
    description: 'Premium east-facing residential plot in HMDA sanctioned gated layout. Direct access to 100ft road, clear link records from 1985, spot Dharani passbook mutation guaranteed.',
    descriptionTe: 'HMDA అనుమతి పొందిన లేఅవుట్‌లో తూర్పు ముఖపు రెసిడెన్షియల్ ప్లాట్. 100 అడుగుల రోడ్డు కనెక్టివిటీ, 1985 నుండి క్లియర్ లింక్ డాక్యుమెంట్లు మరియు స్పాట్ రిజిస్ట్రేషన్.',
    type: 'LAND',
    status: 'VERIFIED',
    location: {
      village: 'Mokila',
      mandal: 'Shankarpally',
      district: 'Rangareddy',
      distanceFromOrrKm: 7.5,
      zone: 'Residential R1',
      tier: 'TIER_2',
      landmark: 'Near ICFAI University Campus',
      landmarkTe: 'ఐసీఎఫ్‌ఏఐ యూనివర్సిటీ క్యాంపస్ సమీపంలో',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.4258,
      longitude: 78.1882,
    },
    pricing: {
      totalPrice: 6800000, // ₹68 Lakhs
      pricePerSqYard: 19428,
      isNegotiable: true,
    },
    land: {
      sqYards: 350,
      surveyNumbers: ['248/AA', '249/E'],
      soilType: 'RED',
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 40,
      waterAvailable: true,
      electricityAvailable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    hmdaApproved: true,
    dharaniApproved: true,
  },
  {
    id: 'PROP-HYD-003',
    title: 'Clear Title Agricultural Farm Land near Airport',
    titleTe: 'శంషాబాద్ ఎయిర్‌పోర్ట్ సమీపంలో వ్యవసాయ భూమి',
    description: '2.25 Acres prime agricultural parcel. Dharani digital e-Pattadar Passbook verified, zero encumbrance for 30 years, 40ft BT road approach with drip irrigation and solar fencing.',
    descriptionTe: '2.25 ఎకరాల ప్రైమ్ అగ్రికల్చర్ భూమి. ధరణి డిజిటల్ ఈ-పట్టాదారు పాస్‌బుక్, 30 ఏళ్ల నిరభ్యంతర ఈసీ, 40 అడుగుల బీటీ రోడ్డు మరియు సోలార్ ఫెన్సింగ్ అందుబాటులో ఉన్నాయి.',
    type: 'LAND',
    status: 'VERIFIED',
    location: {
      village: 'Mamidipally',
      mandal: 'Shamshabad',
      district: 'Rangareddy',
      distanceFromOrrKm: 4.0,
      zone: 'Agricultural / Green Belt',
      tier: 'TIER_2',
      landmark: '8 mins to Rajiv Gandhi International Airport',
      landmarkTe: 'రాజీవ్ గాంధీ అంతర్జాతీయ విమానాశ్రయం నుండి 8 నిమిషాలు',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.2580,
      longitude: 78.4610,
    },
    pricing: {
      totalPrice: 33750000, // ₹3.375 Cr
      pricePerAcre: 15000000, // ₹1.5 Cr/Acre
      isNegotiable: true,
    },
    land: {
      totalAcres: 2.25,
      surveyNumbers: ['182/1', '182/2'],
      soilType: 'RED',
      developmentLevel: 'FENCED',
      roadWidthFt: 40,
      waterAvailable: true,
      electricityAvailable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    dharaniApproved: true,
  },
  {
    id: 'PROP-HYD-004',
    title: '2.5 BHK Tech Corridor Smart Residence',
    titleTe: 'కొల్లూరు కారిడార్‌లో 2.5 BHK స్మార్ట్ అపార్ట్‌మెంట్',
    description: 'Fast-appreciating location just 3 mins from Kollur ORR Exit 2. Gated society with clubhouse, piped gas, and full revenue verification including occupancy certificate track.',
    descriptionTe: 'కొల్లూరు ORR ఎగ్జిట్ 2 నుండి కేవలం 3 నిమిషాల దూరం. క్లబ్‌హౌస్, పైప్డ్ గ్యాస్ మరియు పూర్తి రెవెన్యూ ధృవీకరణ పత్రాలు కలిగిన గేటెడ్ కమ్యూనిటీ.',
    type: 'FLAT',
    status: 'VERIFIED',
    location: {
      village: 'Kollur',
      mandal: 'Ramachandrapuram',
      district: 'Sangareddy',
      distanceFromOrrKm: 2.5,
      zone: 'Residential R1',
      tier: 'TIER_2',
      landmark: 'Beside ORR Exit 2, Tellapur Extension',
      landmarkTe: 'ORR ఎగ్జిట్ 2 పక్కన, తెల్లాపూర్ ఎక్స్‌టెన్షన్',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.4728,
      longitude: 78.2491,
    },
    pricing: {
      totalPrice: 9200000, // ₹92 Lakhs
      pricePerSqft: 6216,
      isNegotiable: false,
    },
    flat: {
      sqft: 1480,
      bedrooms: 2.5,
      bathrooms: 2,
      floor: 8,
      totalFloors: 14,
      amenities: ['Gym & Badminton', 'Children Play Area', 'EV Charging Bay', 'Covered Parking'],
      possessionStatus: 'UNDER_CONSTRUCTION',
      furnishingStatus: 'UNFURNISHED',
    },
    mainImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    hmdaApproved: true,
    reraApproved: true,
  },
  {
    id: 'PROP-HYD-005',
    title: 'High-Road Commercial Land Parcel near IT Hub',
    titleTe: 'ఐటీ హబ్ సమీపంలో కమర్షియల్ ల్యాండ్ పార్సెల్',
    description: 'Strategically located 3,630 sq.yds (0.75 Acre) commercial parcel on main corridor. Master plan certified for commercial and mixed use with 120ft road frontage.',
    descriptionTe: 'ప్రధాన రహదారిపై 3,630 చదరపు గజాల (0.75 ఎకరాలు) కమర్షియల్ ల్యాండ్. 120 అడుగుల రోడ్డు ఫ్రంటేజ్ మరియు పూర్తి చట్టబద్ధమైన మాస్టర్ ప్లాన్ సర్టిఫికేషన్.',
    type: 'LAND',
    status: 'VERIFIED',
    location: {
      village: 'Nallagandla',
      mandal: 'Serilingampalli',
      district: 'Hyderabad / Rangareddy',
      distanceFromOrrKm: 4.8,
      zone: 'Commercial / Mixed Use',
      tier: 'TIER_1',
      landmark: 'Near Citizens Hospital & Lingampally MMTS',
      landmarkTe: 'సిటిజన్స్ హాస్పిటల్ & లింగంపల్లి ఎంఎంటిఎస్ సమీపంలో',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.4780,
      longitude: 78.3120,
    },
    pricing: {
      totalPrice: 112000000, // ₹11.2 Cr
      pricePerSqYard: 30853,
      isNegotiable: true,
    },
    land: {
      totalAcres: 0.75,
      sqYards: 3630,
      surveyNumbers: ['94/A', '95/1'],
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 120,
      waterAvailable: true,
      electricityAvailable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: true,
    hmdaApproved: true,
  },
  {
    id: 'PROP-HYD-006',
    title: 'DTCP Sanctioned Temple Corridor Plot',
    titleTe: 'టెంపుల్ కారిడార్‌లో DTCP ఆమోదిత ప్లాట్',
    description: '200 sq.yds clear title plot in DTCP approved gated venture on Warangal National Highway. 100% Vasthu compliant, compound wall, spot registration.',
    descriptionTe: 'వరంగల్ జాతీయ రహదారిపై DTCP ఆమోదిత లేఅవుట్‌లో 200 గజాల ప్లాట్. 100% వాస్తు, కాంపౌండ్ వాల్ మరియు స్పాట్ రిజిస్ట్రేషన్ అందుబాటులో ఉన్నాయి.',
    type: 'LAND',
    status: 'VERIFIED',
    location: {
      village: 'Raigir',
      mandal: 'Yadagirigutta',
      district: 'Yadadri Bhuvanagiri',
      distanceFromOrrKm: 38,
      zone: 'Residential R1',
      tier: 'TIER_3',
      landmark: '10 mins to Sri Lakshmi Narasimha Swamy Temple',
      landmarkTe: 'లక్ష్మీ నరసింహ స్వామి ఆలయానికి 10 నిమిషాలు',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.5840,
      longitude: 78.9320,
    },
    pricing: {
      totalPrice: 2200000, // ₹22 Lakhs
      pricePerSqYard: 11000,
      isNegotiable: true,
    },
    land: {
      sqYards: 200,
      surveyNumbers: ['312/AA'],
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 33,
      waterAvailable: true,
      electricityAvailable: true,
    },
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: false,
    dharaniApproved: true,
  },
  {
    id: 'PROP-HYD-007',
    title: 'Architectural 4 BHK Triplex Luxury Villa in Tellapur',
    titleTe: 'తెల్లాపూర్‌లో ఆర్కిటెక్చరల్ 4 BHK ట్రిప్లెక్స్ లగ్జరీ విల్లా',
    description: 'Bespoke 4 BHK luxury triplex villa in an elite gated community adjacent to the financial district growth corridor. 100% HMDA & RERA approved with clear title deed and 30-year encumbrance clearance.',
    descriptionTe: 'ఫైనాన్షియల్ డిస్ట్రిక్ట్ గ్రోత్ కారిడార్ సమీపంలోని గేటెడ్ కమ్యూనిటీలో 4 BHK లగ్జరీ ట్రిప్లెక్స్ విల్లా. 100% HMDA మరియు RERA ఆమోదాలు, 30 ఏళ్ల క్లియర్ ఈసీ ధృవీకరించబడింది.',
    type: 'VILLA',
    status: 'VERIFIED',
    location: {
      village: 'Tellapur',
      mandal: 'Ramachandrapuram',
      district: 'Sangareddy',
      distanceFromOrrKm: 2.8,
      zone: 'Residential R1 Gated Community',
      tier: 'TIER_1',
      landmark: 'Near Financial District & ORR Exit 2',
      landmarkTe: 'ఫైనాన్షియల్ డిస్ట్రిక్ట్ మరియు ORR ఎగ్జిట్ 2 సమీపంలో',
      latitude: 17.4728,
      longitude: 78.2912,
    },
    pricing: {
      totalPrice: 48000000, // ₹4.80 Cr
      pricePerSqft: 11428,
      pricePerSqYard: 137142,
      isNegotiable: false,
    },
    villa: {
      plotAreaSqYards: 350,
      builtUpAreaSqFt: 4200,
      configuration: '4 BHK Luxury Triplex',
      floors: 'G+2 Floors',
      facing: 'EAST',
      communityName: 'Tellapur Boulevard Enclave',
      gatedCommunity: true,
      bedrooms: 4,
      bathrooms: 5,
      amenities: [
        'Private Landscaped Lawn',
        'Clubhouse & Olympic Pool',
        'Home Automation Provision',
        '2 Car Covered Portico',
        '100% DG Power Backup',
      ],
    },
    mainImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    hmdaApproved: true,
    reraApproved: true,
  },
  {
    id: 'PROP-HYD-008',
    title: 'Contemporary 4 BHK Gated Villa in Mokila Corridor (Sold Archive)',
    titleTe: 'మోకిల కారిడార్‌లో సమకాలీన 4 BHK గేటెడ్ విల్లా (విక్రయించబడినది)',
    description: 'Contemporary 4 BHK villa with high ceilings and private courtyard in an exclusive 50-acre gated villa community. Fully completed and handed over.',
    descriptionTe: '50 ఎకరాల గేటెడ్ కమ్యూనిటీలో హై సీలింగ్ మరియు ప్రైవేట్ ప్రాంగణంతో కూడిన 4 BHK విల్లా. పూర్తి ధృవీకరణతో విక్రయించబడింది.',
    type: 'VILLA',
    status: 'SOLD',
    location: {
      village: 'Mokila',
      mandal: 'Shankarpally',
      district: 'Rangareddy',
      distanceFromOrrKm: 8.5,
      zone: 'Residential Villa R1',
      tier: 'TIER_2',
      landmark: 'Mokila Shankarpally Highway Belt',
      landmarkTe: 'మోకిల శంకర్‌పల్లి రహదారి సమీపంలో',
      latitude: 17.4082,
      longitude: 78.1884,
    },
    pricing: {
      totalPrice: 36000000, // ₹3.60 Cr
      pricePerSqft: 10000,
      pricePerSqYard: 120000,
      isNegotiable: false,
    },
    villa: {
      plotAreaSqYards: 300,
      builtUpAreaSqFt: 3600,
      configuration: '4 BHK Gated Villa',
      floors: 'G+1 Floors',
      facing: 'NORTH',
      communityName: 'Subishi / Mokila Greens',
      gatedCommunity: true,
      bedrooms: 4,
      bathrooms: 4,
      amenities: [
        'Clubhouse 25,000 sqft',
        '24/7 Gated Security',
        'Jogging Track & Park',
        '2 Car Parking',
      ],
    },
    mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: true,
    hmdaApproved: true,
    reraApproved: true,
  },
  {
    id: 'PROP-LOTUS-001',
    title: 'Lotus Manapolam Lucky Plots – Narayankhed',
    titleTe: 'లోటస్ మనపొలం లక్కీ ప్లాట్స్ – నారాయణఖేడ్',
    description: 'Lotus Manapolam Lucky Plots in Abendha Village, Narayankhed Mandal, Sangareddy District (Sy No 120/5 part). 121 Sq. Yards plots with 30 feet road layout, fruit plantation, 3 years free maintenance, and monthly lucky draw opportunity.',
    descriptionTe: 'సంగారెడ్డి జిల్లా నారాయణఖేడ్ మండలం అభేంద గ్రామంలో లోటస్ మనపొలం లక్కీ ప్లాట్స్ (సర్వే నెం 120/5 పార్ట్). 121 గజాల ప్లాట్లు, 30 అడుగుల రోడ్లు, పండ్ల తోటలు, 3 సంవత్సరాల ఉచిత నిర్వహణ మరియు నెలవారీ లక్కీ డ్రా అవకాశం.',
    type: 'LAND',
    status: 'SOLD',
    location: {
      village: 'Abendha',
      mandal: 'Narayankhed',
      district: 'Sangareddy',
      zone: 'Residential Layout',
      tier: 'TIER_3',
      landmark: 'Sy No 120/5 part, Abendha Village',
      landmarkTe: 'సర్వే నెం 120/5 పార్ట్, అభేంద గ్రామం',
    },
    pricing: {
      totalPrice: 200000,
      pricePerSqYard: 1653,
      isNegotiable: false,
    },
    land: {
      sqYards: 121,
      surveyNumbers: ['120/5 part'],
      developmentLevel: 'VENTURE_READY',
      roadWidthFt: 30,
    },
    mainImage: '/images/properties/lotus-manapolam/poster.jpeg',
    galleryImages: [
      '/images/properties/lotus-manapolam/layout-plan.png',
    ],
    sitePlanImage: '/images/properties/lotus-manapolam/layout-plan.png',
    monthlyInstallment: 9999,
    tenureMonths: 20,
    specialAttractions: [
      'Lucky draw opportunity',
      'Each group consists of 100 members',
      'Source text states a chance to win 1 free plot every month from the 4th month to the 20th month',
      'Another source note states draw months are from the 4th to the 19th month (discrepancy noted internally for transparency)',
      'Free dinner set on every plot booking',
      'Fruit plantation',
      '3 years free maintenance',
      'Site plan shows 30 feet road and project amenities including site office, swimming pool, park and plantation areas',
    ],
    discrepancyNotes: [
      'Source text states a chance to win 1 free plot every month from the 4th month to the 20th month; another source note states draw months are from the 4th to the 19th month.',
    ],
    paymentTerms: [
      'Total Price: ₹2,00,000',
      'Monthly Installment: ₹9,999',
      'Tenure: 20 Months',
      'Monthly payment by/before the 10th',
      'Monthly draw on the 15th',
      'Terms and conditions apply',
    ],
    projectHighlights: [
      'Plot Area: 121 Sq. Yards',
      'Sy No 120/5 part, Abendha Village, Narayankhed Mandal, Sangareddy District',
      '30 feet road layout',
      'Amenities: site office, swimming pool, park and plantation areas',
    ],
    verifiedDocsCount: 0,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: false,
  },
  {
    id: 'PROP-NIMZ-001',
    title: 'NIMZ Siri Kshetram – Narayankhed',
    titleTe: 'నిమ్జ్ సిరి క్షేత్రం – నారాయణఖేడ్',
    description: 'NIMZ Siri Kshetram, a 99-acre mega venture in Narayankhed promoted by NSK Group LLP. Featuring plot options of 100 Sq. Yards and 1 Gunta, jackfruit plantation, customized capsule houses, and flexible EMI payment options.',
    descriptionTe: 'నారాయణఖేడ్‌లో ఎన్‌ఎస్‌కే గ్రూప్ ఎల్‌ఎల్‌పి వారి 99 ఎకరాల మెగా వెంచర్ నిమ్జ్ సిరి క్షేత్రం. 100 గజాలు మరియు 1 గుంట ప్లాట్ ఆప్షన్లు, పనస తోటలు, కస్టమైజ్డ్ క్యాప్సూల్ హౌస్‌లు మరియు సులభ ఈఎమ్‌ఐ చెల్లింపు అవకాశాలు.',
    type: 'LAND',
    status: 'SOLD',
    promotedBy: 'NSK Group LLP',
    location: {
      village: 'Narayankhed',
      mandal: 'Narayankhed',
      district: 'Sangareddy',
      zone: 'Agro Residential Layout',
      tier: 'TIER_3',
      landmark: 'Narayankhed Mandal, Sangareddy',
      landmarkTe: 'నారాయణఖేడ్ మండలం, సంగారెడ్డి',
    },
    pricing: {
      totalPrice: 0,
      isNegotiable: true,
    },
    land: {
      totalAcres: 99,
      developmentLevel: 'PARTIALLY_DEVELOPED',
      surveyNumbers: [],
    },
    mainImage: '/images/properties/nimz-siri-kshetram/poster.jpeg',
    galleryImages: [
      '/images/properties/nimz-siri-kshetram/photo-1.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-2.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-3.jpeg',
      '/images/properties/nimz-siri-kshetram/photo-4.jpeg',
    ],
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
    paymentTerms: [
      'EMI / payment options mentioned',
    ],
    verifiedDocsCount: 0,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: false,
  },
  {
    id: 'PROP-VSP-001',
    title: 'Vasu Sri Pride – Gandimaisamma, Hyderabad',
    titleTe: 'వాసు శ్రీ ప్రైడ్ – గండిమైసమ్మ, హైదరాబాద్',
    description: 'Vasu Sri Pride in Gandimaisamma, Hyderabad. TS RERA Approved (Registration No.: P02200005287), Ready to Move (RTM) 2 & 3 BHK apartments at ₹4,799 per Sft across 5.5 Acres with 330 flats, 2 commercial & 3 residential blocks, 2-level car parking, and premier bank approvals.',
    descriptionTe: 'హైదరాబాద్ గండిమైసమ్మలో వాసు శ్రీ ప్రైడ్. TS RERA ఆమోదం (రిజిస్ట్రేషన్ నెం: P02200005287), రెడీ టు మూవ్ (RTM) 2 & 3 BHK ఫ్లాట్లు. చ.అ.కు ₹4,799. 5.5 ఎకరాల్లో 330 ఫ్లాట్లు, 2 కమర్షియల్ & 3 రెసిడెన్షియల్ బ్లాకులు, 2 స్థాయిల కార్ పార్కింగ్ మరియు ప్రముఖ బ్యాంకుల ఆమోదం.',
    type: 'FLAT',
    status: 'SOLD',
    reraApproved: true,
    reraNumber: 'P02200005287',
    location: {
      village: 'Gandimaisamma',
      mandal: 'Balanagar',
      district: 'Medchal-Malkajgiri',
      zone: 'Residential',
      tier: 'TIER_2',
      landmark: 'Near IARE, MRIT and HITAM Engineering Colleges, Gandimaisamma',
      landmarkTe: 'IARE, MRIT మరియు HITAM ఇంజనీరింగ్ కాలేజీల సమీపంలో, గండిమైసమ్మ',
    },
    pricing: {
      totalPrice: 5638825, // 1175 sft * ₹4,799/sft base unit
      pricePerSqft: 4799,
      isNegotiable: false,
    },
    flat: {
      sqft: 1175,
      bedrooms: 2,
      bathrooms: 2,
      floor: 1,
      totalFloors: 7, // 2 Cellar + Ground + 5 floors proposal
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
    verifiedDocsCount: 1,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
  },
  {
    id: 'PROP-KA-001',
    title: "Krishna's Arena – Masjid Banda, Kondapur, Hyderabad",
    titleTe: 'కృష్ణాస్ ఎరీనా – మసీద్ బండ, కొండాపూర్, హైదరాబాద్',
    description: "Krishna's Arena in Masjid Banda, Kondapur, Hyderabad. Premium & luxurious green limited-edition 4 BHK apartments on 4000 Square Yards. Single tower with 2 Cellars + Stilt + 17 Floors, 64 corner 4 BHK units (2995 Sft to 3247 Sft), and comprehensive indoor and outdoor lifestyle amenities with G+1 Clubhouse.",
    descriptionTe: 'కొండాపూర్ మసీద్ బండలో కృష్ణాస్ ఎరీనా. 4000 చదరపు గజాలలో ప్రీమియం లిమిటెడ్-ఎడిషన్ 4 BHK అపార్ట్‌మెంట్లు. సింగిల్ టవర్ (2 సెల్లార్లు + స్టిల్ట్ + 17 అంతస్తులు), 64 కార్నర్ 4 BHK యూనిట్లు (2995 Sft నుండి 3247 Sft) మరియు G+1 క్లబ్‌హౌస్.',
    type: 'FLAT',
    status: 'SOLD',
    location: {
      village: 'Masjid Banda',
      mandal: 'Serilingampally',
      district: 'Rangareddy',
      zone: 'Premium Residential',
      tier: 'TIER_1',
      landmark: 'Masjid Banda, Kondapur, Hyderabad',
      landmarkTe: 'మసీద్ బండ, కొండాపూర్, హైదరాబాద్',
    },
    pricing: {
      totalPrice: 0,
      isNegotiable: true,
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
    mainImage: '/images/property-placeholder.svg',
    galleryImages: [],
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
    verifiedDocsCount: 0,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: true,
  },
  {
    id: 'PROP-KGM-001',
    title: 'Kaakatiya Golden Meadows – Indresham, Patancheru',
    titleTe: 'కాకతీయ గోల్డెన్ మెడోస్ – ఇంద్రేశం, పటాన్‌చెరు',
    description: 'Kaakatiya Golden Meadows in Indresham, Patancheru. 1 Acre project with 20 exclusive G+2 3 BHK villas (East & West facing). Plot size 150 Sq. Yards, built-up area 2140–2250 Sft. Ready to Move, ₹1.40 Cr onwards with ₹5 Lakhs booking amount.',
    descriptionTe: 'పటాన్‌చెరు ఇంద్రేశంలో కాకతీయ గోల్డెన్ మెడోస్. 1 ఎకరంలో 20 ప్రత్యేక G+2 3 BHK విల్లాలు (తూర్పు మరియు పడమర ముఖంగా). 150 గజాల ప్లాట్, 2140–2250 Sft బిల్ట్-అప్ ఏరియా. రెడీ టు మూవ్, ₹1.40 కోట్లు నుండి, బుకింగ్ మొత్తం ₹5 లక్షలు.',
    type: 'VILLA',
    status: 'SOLD',
    location: {
      village: 'Indresham',
      mandal: 'Patancheru',
      district: 'Sangareddy',
      distanceFromOrrKm: 3.5,
      zone: 'Gated Villa Community',
      tier: 'TIER_2',
      landmark: 'Near Oakdale School & Ellenki College of Engineering, Indresham',
      landmarkTe: 'ఓక్‌డేల్ స్కూల్ మరియు ఎల్లెంకి ఇంజనీరింగ్ కాలేజీ సమీపంలో, ఇంద్రేశం',
    },
    pricing: {
      totalPrice: 14000000,
      pricePerSqft: 6378,
      pricePerSqYard: 93333,
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
    verifiedDocsCount: 0,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
  },
];
