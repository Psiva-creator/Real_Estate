export type DocumentKey =
  | 'SALE_DEED'
  | 'EC'
  | 'LINK_DOCUMENTS'
  | 'PAHANI'
  | 'FORM_1B'
  | 'FMB'
  | 'PATTADAR_PASSBOOK'
  | 'HMDA_DTCP_APPROVAL'
  | 'MUTATION'
  | 'TAX_RECEIPT'
  | 'MASTER_PLAN'
  | 'GPA'
  | 'SALE_AGREEMENT';

export type DocumentStatus =
  | 'NOT_UPLOADED'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'VERIFIED'
  | 'REJECTED';

export interface VerificationDoc {
  id: number;
  key: DocumentKey;
  nameEn: string;
  nameTe: string;
  descEn: string;
  descTe: string;
  appliesTo: 'LAND' | 'FLAT' | 'BOTH';
  isMandatory: boolean;
  isGpa?: boolean;
}

export const VERIFIED_13_DOCS: VerificationDoc[] = [
  {
    id: 1,
    key: 'SALE_DEED',
    nameEn: 'Sale Deed',
    nameTe: 'సేల్ డీడ్ (విక్రయ పత్రం)',
    descEn: 'Registered sale deed proving current title & registered ownership.',
    descTe: 'ప్రస్తుత యజమాని పేరిట ఉన్న రిజిస్టర్డ్ విక్రయ పత్రం.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 2,
    key: 'EC',
    nameEn: '30-Year Encumbrance Certificate (EC)',
    nameTe: '30-సంవత్సరాల ఈసీ (నిరభ్యంతర పత్రం)',
    descEn: 'Ensures property is free from encumbrances, loans, and legal dues.',
    descTe: 'ఆస్తిపై ఎలాంటి తాకట్టు లేదా కోర్టు వివాదాలు లేవని ధృవీకరించే పత్రం.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 3,
    key: 'LINK_DOCUMENTS',
    nameEn: 'Link Documents',
    nameTe: 'లింక్ డాక్యుమెంట్లు',
    descEn: 'Complete unbroken chain of prior title deeds connecting to current title.',
    descTe: 'గత యాజమాన్య బదిలీలకు సంబంధించిన పూర్తి లింక్ రికార్డులు.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 4,
    key: 'PAHANI',
    nameEn: 'Pahani / Adangal',
    nameTe: 'పహానీ / అడంగల్',
    descEn: 'Telangana revenue record certifying land possession and cultivation history.',
    descTe: 'భూమి ఆధీనం, హక్కుదారు వివరాలను తెలిపే తెలంగాణ రెవెన్యూ రికార్డు.',
    appliesTo: 'LAND',
    isMandatory: true,
  },
  {
    id: 5,
    key: 'FORM_1B',
    nameEn: 'Form 1-B (ROR)',
    nameTe: 'ఫారమ్ 1-బి (ROR)',
    descEn: 'Record of Rights extract confirming khata number and ownership.',
    descTe: 'ఖాతా సంఖ్య మరియు భూ యాజమాన్య ధృవీకరణ పత్రం.',
    appliesTo: 'LAND',
    isMandatory: true,
  },
  {
    id: 6,
    key: 'FMB',
    nameEn: 'FMB (Field Measurement Book)',
    nameTe: 'ఎఫ్.ఎం.బి (ఫీల్డ్ మెజర్‌మెంట్ బుక్ టిప్పన్)',
    descEn: 'Cadastral survey sketch showing precise boundaries, sub-divisions, and dimensions.',
    descTe: 'భూమి సరిహద్దులు, కొలతలను తెలిపే అధికారిక సర్వే స్కెచ్ మ్యాప్.',
    appliesTo: 'LAND',
    isMandatory: true,
  },
  {
    id: 7,
    key: 'PATTADAR_PASSBOOK',
    nameEn: 'Pattadar Passbook (Dharani)',
    nameTe: 'పట్టాదారు పాస్‌బుక్ (ధరణి)',
    descEn: 'Digital title passbook issued under Telangana Dharani portal.',
    descTe: 'ధరణి పోర్టల్ ద్వారా జారీ చేసిన డిజిటల్ పట్టాదారు పాస్‌బుక్.',
    appliesTo: 'LAND',
    isMandatory: true,
  },
  {
    id: 8,
    key: 'HMDA_DTCP_APPROVAL',
    nameEn: 'HMDA / DTCP / GHMC Layout Approval',
    nameTe: 'హెచ్.ఎమ్.డి.ఎ / డి.టి.సి.పి అనుమతి పత్రం',
    descEn: 'Sanctioned layout approval copy from statutory authority.',
    descTe: 'అధికారిక HMDA, DTCP లేదా GHMC ద్వారా ఆమోదించబడిన లేఅవుట్ కాపీ.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 9,
    key: 'MUTATION',
    nameEn: 'Revenue Mutation Proceeding',
    nameTe: 'మ్యుటేషన్ ప్రొసీడింగ్స్',
    descEn: 'Revenue department proceeding copy mutating title to current owner.',
    descTe: 'రెవెన్యూ రికార్డులలో యజమాని పేరు నమోదైన మ్యుటేషన్ ప్రొసీడింగ్స్.',
    appliesTo: 'LAND',
    isMandatory: true,
  },
  {
    id: 10,
    key: 'TAX_RECEIPT',
    nameEn: 'Property Tax Paid Receipt',
    nameTe: 'ఆస్తి పన్ను రసీదు (GHMC / మున్సిపల్ / పంచాయతీ)',
    descEn: 'Latest municipal / gram panchayat property tax paid receipt with zero arrears.',
    descTe: 'ఇటీవల చెల్లించిన పురపాలక లేదా గ్రామ పంచాయతీ ఆస్తి పన్ను రసీదు.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 11,
    key: 'MASTER_PLAN',
    nameEn: 'Master Plan / Zoning Certificate',
    nameTe: 'మాస్టర్ ప్లాన్ జోనింగ్ సర్టిఫికేట్',
    descEn: 'HMDA master plan zoning confirmation (Residential, Commercial, R1, Conservation).',
    descTe: 'హెచ్.ఎమ్.డి.ఎ మాస్టర్ ప్లాన్ జోన్ కేటాయింపు సర్టిఫికేట్.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
  {
    id: 12,
    key: 'GPA',
    nameEn: 'GPA (General Power of Attorney)',
    nameTe: 'రిజిస్టర్డ్ జి.పి.ఎ (వర్తిస్తే)',
    descEn: 'Registered power of attorney deed (required ONLY if listed via representative/agent).',
    descTe: 'ప్రతినిధి ద్వారా అమ్మకానికి వచ్చినట్లయితే మాత్రమే రిజిస్టర్డ్ జీపీఏ పత్రం.',
    appliesTo: 'BOTH',
    isMandatory: false,
    isGpa: true,
  },
  {
    id: 13,
    key: 'SALE_AGREEMENT',
    nameEn: 'Brokerage Representation Agreement',
    nameTe: 'బ్రోకరేజ్ మరియు ప్రాతినిధ్య ఒప్పందం',
    descEn: 'Executed brokerage mediation agreement authorizing platform to represent listing.',
    descTe: 'బ్రోకరేజ్ మరియు ప్రాపర్టీ ప్రాతినిధ్య ఒప్పంద పత్రం.',
    appliesTo: 'BOTH',
    isMandatory: true,
  },
];
