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
  plotSqYards: number;
  builtUpSqft: number;
  bedrooms: number;
  bathrooms: number;
  floorsConfig: 'G+1' | 'G+2' | 'Triplex';
  privateGarden: boolean;
  coveredParking: number;
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
  verifiedDocsCount: number;
  totalDocsRequired: number;
  isFeatured: boolean;
  isOrrCorridor: boolean;
  dharaniApproved?: boolean;
  hmdaApproved?: boolean;
  reraApproved?: boolean;
  boundaryCoordinates?: Array<{ lat: number; lng: number }> | null;
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
    title: 'Luxury G+2 Villa with Private Garden in Narsingi',
    titleTe: 'నార్సింగిలో ప్రైవేట్ గార్డెన్‌తో G+2 విల్లా',
    description: 'Sprawling G+2 independent villa in HMDA-approved venture. 400 sq.yd plot with 3,200 sq.ft built-up area, manicured private garden, 2 covered car parks, and clear 30-year EC.',
    descriptionTe: 'HMDA ఆమోదిత వెంచర్‌లో 400 గజాల స్థలంపై 3,200 చదరపు అడుగుల G+2 ఇండిపెండెంట్ విల్లా. ప్రైవేట్ తోట, 2 కవర్డ్ కార్ పార్కింగ్ మరియు 30 ఏళ్ల క్లియర్ ఈసీ.',
    type: 'VILLA',
    status: 'VERIFIED',
    location: {
      village: 'Narsingi',
      mandal: 'Gandipet',
      district: 'Rangareddy',
      distanceFromOrrKm: 3.2,
      zone: 'Residential R1',
      tier: 'TIER_2',
      landmark: 'Near Narsingi Police Station, ORR Exit 14',
      landmarkTe: 'నార్సింగి పోలీస్ స్టేషన్ సమీపంలో, ORR ఎగ్జిట్ 14',
      // Development/sample coordinates for local testing — not survey verified
      latitude: 17.3950,
      longitude: 78.3180,
    },
    pricing: {
      totalPrice: 35000000, // ₹3.5 Cr
      pricePerSqft: 10937,
      isNegotiable: true,
    },
    villa: {
      plotSqYards: 400,
      builtUpSqft: 3200,
      bedrooms: 4,
      bathrooms: 4,
      floorsConfig: 'G+2',
      privateGarden: true,
      coveredParking: 2,
    },
    mainImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: true,
    isOrrCorridor: true,
    hmdaApproved: true,
  },
  {
    id: 'PROP-HYD-008',
    title: '2.50 Acre Managed Agro-Farmland in Maheshwaram Growth Belt',
    titleTe: 'మహేశ్వరం గ్రోత్ కారిడార్‌లో 2.50 ఎకరాల సాగు భూమి / వ్యవసాయ క్షేత్రం',
    description: 'Clear-title 2.50 acre fertile agricultural land in Mansanpally Village, Maheshwaram. 350 mature Malabar Neem trees, 40 organic fruit trees, automated micro-drip irrigation, and 2 high-yield borewells. 11.5 km from ORR Exit 14 Tukkuguda.',
    descriptionTe: 'మహేశ్వరం మండలం మాన్సన్‌పల్లిలో 2.50 ఎకరాల సాగు భూమి. 350 మలబార్ వేప చెట్లు, డ్రిప్ ఇరిగేషన్ మరియు 2 బోర్‌వెల్స్ సదుపాయం.',
    type: 'LAND',
    status: 'VERIFIED',
    location: {
      village: 'Mansanpally',
      mandal: 'Maheshwaram',
      district: 'Rangareddy',
      distanceFromOrrKm: 11.5,
      zone: 'Agricultural & Conservation',
      tier: 'TIER_2',
      landmark: 'Near Maheshwaram Electronic SEZ / Hardware Park',
      landmarkTe: 'మహేశ్వరం ఎలక్ట్రానిక్ సెజ్ సమీపంలో',
      latitude: 17.1824,
      longitude: 78.4356,
    },
    pricing: {
      totalPrice: 31250000, // ₹3.125 Cr
      pricePerAcre: 12500000,
      isNegotiable: true,
    },
    land: {
      totalAcres: 2.5,
      sqYards: 12100,
      surveyNumbers: ['184/A', '184/AA'],
      soilType: 'RED',
      developmentLevel: 'FENCED',
      roadWidthFt: 30,
      waterAvailable: true,
      electricityAvailable: true,
    },
    boundaryCoordinates: [
      { lat: 17.1831, lng: 78.4348 },
      { lat: 17.1832, lng: 78.4365 },
      { lat: 17.1818, lng: 78.4364 },
      { lat: 17.1817, lng: 78.4347 },
    ],
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
    ],
    verifiedDocsCount: 13,
    totalDocsRequired: 13,
    isFeatured: false,
    isOrrCorridor: false,
    dharaniApproved: true,
  },
];
