/**
 * Core business constants for Telangana / Hyderabad Real-Estate Brokerage Platform
 */

// 1. Property Categories & Status
export enum PropertyType {
  LAND = 'LAND',
  FLAT = 'FLAT',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  LIVE = 'LIVE',
  SOLD = 'SOLD',
  OFF_MARKET = 'OFF_MARKET',
}

// 2. 13 Required Verification Documents Gate
export enum DocumentType {
  SALE_DEED = 'SALE_DEED',
  EC = 'EC', // Encumbrance Certificate
  LINK_DOCUMENTS = 'LINK_DOCUMENTS',
  PAHANI = 'PAHANI',
  FORM_1B = 'FORM_1B',
  FMB = 'FMB', // Field Measurement Book
  PATTADAR_PASSBOOK = 'PATTADAR_PASSBOOK',
  HMDA_DTCP_APPROVAL = 'HMDA_DTCP_APPROVAL',
  MUTATION = 'MUTATION',
  TAX_RECEIPT = 'TAX_RECEIPT',
  MASTER_PLAN = 'MASTER_PLAN',
  GPA = 'GPA', // General Power of Attorney (if applicable)
  SALE_AGREEMENT = 'SALE_AGREEMENT',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface DocumentMeta {
  key: DocumentType;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  requiredFor: PropertyType[];
}

export const REQUIRED_VERIFICATION_DOCUMENTS: DocumentMeta[] = [
  {
    key: DocumentType.SALE_DEED,
    titleEn: 'Sale Deed',
    titleTe: 'సేల్ డీడ్ (రిజిస్ట్రేషన్ పత్రం)',
    descriptionEn: 'Registered sale deed establishing current ownership.',
    descriptionTe: 'ప్రస్తుత యజమాని పేరిట ఉన్న రిజిస్టర్డ్ విక్రయ పత్రం.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
  {
    key: DocumentType.EC,
    titleEn: 'Encumbrance Certificate (EC)',
    titleTe: 'ఈసీ (ఎన్‌కంబరెన్స్ సర్టిఫికేట్)',
    descriptionEn: 'Certificate showing property is free from legal dues/liens (typically 30 years).',
    descriptionTe: 'ఆస్తిపై ఎలాంటి తాకట్టు లేదా చట్టపరమైన బాధ్యతలు లేవని ధృవీకరించే పత్రం.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
  {
    key: DocumentType.LINK_DOCUMENTS,
    titleEn: 'Link Documents',
    titleTe: 'లింక్ డాక్యుమెంట్లు',
    descriptionEn: 'Chain of previous title transfers establishing unbroken ownership chain.',
    descriptionTe: 'గత యాజమాన్య బదిలీలకు సంబంధించిన పూర్తి లింక్ రికార్డులు.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
  {
    key: DocumentType.PAHANI,
    titleEn: 'Pahani / ROR 1B',
    titleTe: 'పహానీ / అడంగల్',
    descriptionEn: 'Telangana revenue record certifying land possession and cultivation history.',
    descriptionTe: 'భూమి ఆధీనం, హక్కుదారు వివరాలను తెలిపే తెలంగాణ రెవెన్యూ రికార్డు.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.FORM_1B,
    titleEn: 'Form 1-B',
    titleTe: 'ఫారమ్ 1-బి',
    descriptionEn: 'ROR extract confirming land ownership and khata number.',
    descriptionTe: 'ఖాతా సంఖ్య మరియు భూ యాజమాన్య ధృవీకరణ పత్రం.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.FMB,
    titleEn: 'FMB (Field Measurement Book)',
    titleTe: 'ఎఫ్.ఎం.బి (ఫీల్డ్ మెజర్‌మెంట్ బుక్ టిప్పన్)',
    descriptionEn: 'Survey sketch depicting precise boundaries and dimensions of the land parcel.',
    descriptionTe: 'భూమి సరిహద్దులు, కొలతలను తెలిపే అధికారిక సర్వే స్కెచ్ మ్యాప్.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.PATTADAR_PASSBOOK,
    titleEn: 'Pattadar Passbook (Dharani)',
    titleTe: 'పట్టాదారు పాస్‌బుక్ (ధరణి)',
    descriptionEn: 'E-passbook issued under Dharani portal confirming title ownership.',
    descriptionTe: 'ధరణి పోర్టల్ ద్వారా జారీ చేసిన డిజిటల్ పట్టాదారు పాస్‌బుక్.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.HMDA_DTCP_APPROVAL,
    titleEn: 'HMDA / DTCP Layout Approval',
    titleTe: 'హెచ్.ఎమ్.డి.ఎ / డి.టి.సి.పి అనుమతి పత్రం',
    descriptionEn: 'Sanctioned layout approval copy from HMDA or DTCP authority.',
    descriptionTe: 'అధికారిక HMDA లేదా DTCP ద్వారా ఆమోదించబడిన లేఅవుట్ కాపీ.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
  {
    key: DocumentType.MUTATION,
    titleEn: 'Mutation / Proceeding Copy',
    titleTe: 'మ్యుటేషన్ ప్రొసీడింగ్స్',
    descriptionEn: 'Revenue authority proceeding copying title mutation to seller name.',
    descriptionTe: 'రెవెన్యూ రికార్డులలో యజమాని పేరు నమోదైన మ్యుటేషన్ పత్రం.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.TAX_RECEIPT,
    titleEn: 'Property Tax Receipt',
    titleTe: 'ఆస్తి పన్ను రసీదు (GHMC / మున్సిపల్)',
    descriptionEn: 'Latest municipal / gram panchayat property tax paid receipt.',
    descriptionTe: 'ఇటీవల చెల్లించిన పురపాలక లేదా గ్రామ పంచాయతీ పన్ను రసీదు.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
  {
    key: DocumentType.MASTER_PLAN,
    titleEn: 'Master Plan / Land Use Certificate',
    titleTe: 'మాస్టర్ ప్లాన్ / ల్యాండ్ యూజ్ జోన్ సర్టిఫికేట్',
    descriptionEn: 'HMDA Master Plan zoning confirmation (Residential/Commercial/R1/Conservation).',
    descriptionTe: 'హెచ్.ఎమ్.డి.ఎ మాస్టర్ ప్లాన్ జోన్ కేటాయింపు సర్టిఫికేట్.',
    requiredFor: [PropertyType.LAND],
  },
  {
    key: DocumentType.GPA,
    titleEn: 'GPA (General Power of Attorney)',
    titleTe: 'జి.పి.ఎ (జనరల్ పవర్ ఆఫ్ అటార్నీ)',
    descriptionEn: 'Registered power of attorney document if listed via an authorized agent/representative.',
    descriptionTe: 'ప్రతినిధి ద్వారా అమ్మకానికి వచ్చినట్లయితే రిజిస్టర్డ్ జీపీఏ పత్రం.',
    requiredFor: [], // Optional depending on ownership arrangement
  },
  {
    key: DocumentType.SALE_AGREEMENT,
    titleEn: 'Sale Agreement',
    titleTe: 'సేల్ అగ్రిమెంట్',
    descriptionEn: 'Executed brokerage mediation agreement authorizing platform to represent listing.',
    descriptionTe: 'బ్రోకరేజ్ మరియు ప్రాపర్టీ ప్రాతినిధ్య ఒప్పంద పత్రం.',
    requiredFor: [PropertyType.LAND, PropertyType.FLAT],
  },
];

// 3. Service Areas (HMDA Metropolitan Development Plan Tiers)
export enum ServiceTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

export const SERVICE_AREAS = {
  [ServiceTier.TIER_1]: {
    name: 'Hyderabad Core & Metropolitan',
    description: 'Hyderabad core, Secunderabad, Kukatpally, Serilingampalli, Qutbullapur',
    regions: ['Hyderabad Core', 'Secunderabad', 'Kukatpally', 'Serilingampalli', 'Qutbullapur'],
  },
  [ServiceTier.TIER_2]: {
    name: 'ORR Growth Corridor (5-10km band)',
    description: 'Growth zones along Outer Ring Road (Gachibowli, Kokapet, Shamshabad, Kollur, Ghatkesar, Medchal)',
    regions: ['Kokapet', 'Narsingi', 'Mokila', 'Kollur', 'Patancheru', 'Shamshabad', 'Adibatla', 'Ghatkesar', 'Medchal', 'Kandlakoya'],
  },
  [ServiceTier.TIER_3]: {
    name: 'Regional Centers & Surrounding Mandals',
    description: 'Warangal, Karimnagar, Nizamabad + connected growth mandals',
    regions: ['Warangal', 'Karimnagar', 'Nizamabad', 'Yadagirigutta', 'Shadnagar'],
  },
};

// 4. Enquiry & Lead Pipeline
export enum EnquiryType {
  CALL = 'CALL',
  SITE_VISIT = 'SITE_VISIT',
  QUESTION = 'QUESTION',
}

export enum EnquiryStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  CONTACTED = 'CONTACTED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  IN_NEGOTIATION = 'IN_NEGOTIATION',
  DEAL_CLOSED = 'DEAL_CLOSED',
  DROPPED = 'DROPPED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  SELLER = 'SELLER',
}
