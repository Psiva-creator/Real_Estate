export interface LatLng {
  lat: number;
  lng: number;
}

export interface OrrExit {
  exitNo: number;
  nameEn: string;
  nameTe: string;
  lat: number;
  lng: number;
  corridor: string;
}

export interface CorridorInfo {
  id: string;
  nameEn: string;
  nameTe: string;
  lat: number;
  lng: number;
  zoom: number;
  tag: string;
  descriptionEn: string;
  descriptionTe: string;
}

// 158km Outer Ring Road (ORR) Full Loop Path
export const ORR_LOOP_COORDINATES: [number, number][] = [
  [17.2403, 78.4294], // Shamshabad (Airport)
  [17.2289, 78.4900], // Thukkuguda / Srisailam Hwy
  [17.2341, 78.5398], // Bongloor / Adibatla (Exit 19)
  [17.2850, 78.6010], // Mangalpalli
  [17.3204, 78.6473], // Pedda Amberpet (Exit 11 / Vijayawada Hwy)
  [17.3850, 78.6720], // Tarigoppula
  [17.4563, 78.6835], // Ghatkesar (Exit 9 / Warangal Hwy)
  [17.5120, 78.6650], // Keesara (Exit 8)
  [17.5912, 78.5831], // Shamirpet (Exit 7 / Rajiv Rahadari)
  [17.6163, 78.4907], // Medchal / Kandlakoya (Exit 6 / Nagpur Hwy)
  [17.5850, 78.3900], // Bowrampet / Dundigal (Exit 5)
  [17.5450, 78.3300], // Sultanpur (Exit 4)
  [17.5312, 78.2612], // Patancheru / Muthangi (Exit 3 / Mumbai Hwy)
  [17.4764, 78.2570], // Kollur (Exit 2)
  [17.4420, 78.2850], // Tellapur
  [17.4042, 78.3308], // Kokapet / Financial District (Exit 1)
  [17.3850, 78.3582], // Narsingi (Exit 18)
  [17.3510, 78.3750], // Appa Junction (Exit 17)
  [17.3195, 78.3972], // Rajendranagar
  [17.2403, 78.4294], // Loop back to Shamshabad
];

// Key Exits along the 158km ORR
export const ORR_EXITS: OrrExit[] = [
  { exitNo: 1, nameEn: 'Kokapet / Neopolis', nameTe: 'కోకాపేట్ / నియోపోలిస్', lat: 17.4042, lng: 78.3308, corridor: 'West' },
  { exitNo: 2, nameEn: 'Kollur / Tellapur', nameTe: 'కొల్లూరు / తెల్లాపూర్', lat: 17.4764, lng: 78.257, corridor: 'North-West' },
  { exitNo: 3, nameEn: 'Patancheru / NH-65', nameTe: 'పటాన్‌చెరు / ముంబై హైవే', lat: 17.5312, lng: 78.2612, corridor: 'West' },
  { exitNo: 5, nameEn: 'Dundigal / ORR', nameTe: 'దుండిగల్', lat: 17.585, lng: 78.39, corridor: 'North' },
  { exitNo: 6, nameEn: 'Medchal / Kandlakoya', nameTe: 'మేడ్చల్ / కండ్లకోయ', lat: 17.6163, lng: 78.4907, corridor: 'North' },
  { exitNo: 7, nameEn: 'Shamirpet', nameTe: 'శామీర్‌పేట్', lat: 17.5912, lng: 78.5831, corridor: 'North-East' },
  { exitNo: 9, nameEn: 'Ghatkesar / NH-163', nameTe: 'ఘట్‌కేసర్ / వరంగల్ హైవే', lat: 17.4563, lng: 78.6835, corridor: 'East' },
  { exitNo: 11, nameEn: 'Pedda Amberpet / NH-65', nameTe: 'పెద్ద అంబర్‌పేట్', lat: 17.3204, lng: 78.6473, corridor: 'South-East' },
  { exitNo: 16, nameEn: 'Shamshabad Airport / NH-44', nameTe: 'శంషాబాద్ ఎయిర్‌పోర్ట్', lat: 17.2403, lng: 78.4294, corridor: 'South' },
  { exitNo: 19, nameEn: 'Adibatla (TCS & Aero)', nameTe: 'ఆదిభట్ల', lat: 17.2341, lng: 78.5398, corridor: 'South' },
];

// Major Real Estate Investment Corridors
export const TELANGANA_CORRIDORS: CorridorInfo[] = [
  {
    id: 'all',
    nameEn: 'All Telangana Corridors',
    nameTe: 'అన్ని తెలంగాణ కారిడార్లు',
    lat: 17.4200,
    lng: 78.4500,
    zoom: 10,
    tag: 'Telangana State',
    descriptionEn: 'Full metropolitan & regional real-estate network',
    descriptionTe: 'మెట్రోపాలిటన్ మరియు ప్రాంతీయ రియల్ ఎస్టేట్ నెట్‌వర్క్',
  },
  {
    id: 'kokapet',
    nameEn: 'Kokapet & Neopolis (IT Hub)',
    nameTe: 'కోకాపేట్ & నియోపోలిస్',
    lat: 17.4042,
    lng: 78.3308,
    zoom: 13,
    tag: 'High-Rise Commercial & Luxury',
    descriptionEn: 'Commercial skyscrapers, high-end gated communities & ORR Exit 1',
    descriptionTe: 'వాణిజ్య స్కైస్క్రాపర్స్ & గేటెడ్ కమ్యూనిటీలు',
  },
  {
    id: 'shamshabad',
    nameEn: 'Shamshabad & Airport Corridor',
    nameTe: 'శంషాబాద్ & ఎయిర్‌పోర్ట్ కారిడార్',
    lat: 17.2403,
    lng: 78.4294,
    zoom: 12,
    tag: 'Aviation & Plotted Lands',
    descriptionEn: 'RGIA Airport proximity, logistics hub, aero SEZ & farmland belts',
    descriptionTe: 'విమానాశ్రయం, లాజిస్టిక్స్ హబ్ & వ్యవసాయ భూములు',
  },
  {
    id: 'tellapur',
    nameEn: 'Tellapur & Kollur (Growth Zone)',
    nameTe: 'తెల్లాపూర్ & కొల్లూరు',
    lat: 17.4728,
    lng: 78.2491,
    zoom: 13,
    tag: 'Residential Hotspot',
    descriptionEn: 'Fastest growing residential suburb connected directly via ORR Exit 2',
    descriptionTe: 'వేగంగా అభివృద్ధి చెందుతున్న నివాస ప్రాంతం',
  },
  {
    id: 'patancheru',
    nameEn: 'Patancheru & IIT Kandi',
    nameTe: 'పటాన్‌చెరు & ఐఐటీ కంది',
    lat: 17.5512,
    lng: 78.2012,
    zoom: 12,
    tag: 'Industrial & Villa Plots',
    descriptionEn: 'NH-65 Mumbai corridor, IIT Hyderabad, pharmaceutical & layout plots',
    descriptionTe: 'ముంబై హైవే, ఐఐటీ హైదరాబాద్ & ప్లాట్ల లేఅవుట్లు',
  },
  {
    id: 'medchal',
    nameEn: 'Medchal & Kompally',
    nameTe: 'మేడ్చల్ & కొంపల్లి',
    lat: 17.6163,
    lng: 78.4907,
    zoom: 12,
    tag: 'Genome Valley & North ORR',
    descriptionEn: 'North Hyderabad residential villas, healthcare corridor & ORR Exit 6',
    descriptionTe: 'విల్లాలు, హెల్త్‌కేర్ కారిడార్ & ఉత్తర ఓఆర్ఆర్',
  },
  {
    id: 'yadadri',
    nameEn: 'Yadadri & Ghatkesar',
    nameTe: 'యాదాద్రి & ఘట్‌కేసర్',
    lat: 17.4563,
    lng: 78.6835,
    zoom: 11,
    tag: 'Temple City & Plotted Investment',
    descriptionEn: 'Warangal Highway NH-163, temple tourism, DTCP layouts & farmland',
    descriptionTe: 'వరంగల్ హైవే, దేవాలయ పర్యాటకం & డిటిసిపి ప్లాట్లు',
  },
];

export interface LocalityCoord {
  id: string;
  nameEn: string;
  nameTe: string;
  district: string;
  districtTe: string;
  mandal: string;
  mandalTe: string;
  village: string;
  villageTe: string;
  lat: number;
  lng: number;
  zoom?: number;
  aliases?: string[];
}

export const TELANGANA_MANDALS_GEO: LocalityCoord[] = [
  // ─── West & IT Growth Corridor (Kokapet / Neopolis / Gachibowli Expansion) ────
  {
    id: 'kokapet',
    nameEn: 'Kokapet & Neopolis',
    nameTe: 'కోకాపేట్ & నియోపోలిస్',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Gandipet',
    mandalTe: 'గండిపేట్',
    village: 'Kokapet',
    villageTe: 'కోకాపేట్',
    lat: 17.4042,
    lng: 78.3308,
    aliases: ['neopolis', 'financial district', 'gandipet', 'kokapet seba', 'golden mile'],
  },
  {
    id: 'narsingi',
    nameEn: 'Narsingi & Puppalaguda',
    nameTe: 'నర్సింగి & పుప్పాలగూడ',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Gandipet',
    mandalTe: 'గండిపేట్',
    village: 'Narsingi',
    villageTe: 'నర్సింగి',
    lat: 17.3850,
    lng: 78.3582,
    aliases: ['puppalaguda', 'manchirevula', 'alijapur', 'neknampur'],
  },
  {
    id: 'tellapur',
    nameEn: 'Tellapur & Osman Nagar',
    nameTe: 'తెల్లాపూర్ & ఉస్మాన్ నగర్',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Ramachandrapuram',
    mandalTe: 'రామచంద్రాపురం',
    village: 'Tellapur',
    villageTe: 'తెల్లాపూర్',
    lat: 17.4728,
    lng: 78.2491,
    aliases: ['osman nagar', 'velimala', 'edulanagulapally', 'kollur road'],
  },
  {
    id: 'kollur',
    nameEn: 'Kollur (ORR Exit 2)',
    nameTe: 'కొల్లూరు',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Ramachandrapuram',
    mandalTe: 'రామచంద్రాపురం',
    village: 'Kollur',
    villageTe: 'కొల్లూరు',
    lat: 17.4764,
    lng: 78.2570,
    aliases: ['kollur exit 2', 'kollur tech zone'],
  },
  {
    id: 'mokila',
    nameEn: 'Mokila & Shankarpally',
    nameTe: 'మోకిల & శంకరపల్లి',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Shankarpally',
    mandalTe: 'శంకరపల్లి',
    village: 'Mokila',
    villageTe: 'మోకిల',
    lat: 17.4526,
    lng: 78.1342,
    aliases: ['shankarpally', 'singapur', 'proddatur', 'maharajpet', 'dontanpally'],
  },
  {
    id: 'chevella',
    nameEn: 'Chevella & Aloor',
    nameTe: 'చేవెళ్ల & ఆలూర్',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Chevella',
    mandalTe: 'చేవెళ్ల',
    village: 'Chevella',
    villageTe: 'చేవెళ్ల',
    lat: 17.3073,
    lng: 78.1352,
    aliases: ['aloor', 'damargidda', 'kandwada', 'shabad road'],
  },
  {
    id: 'moinabad',
    nameEn: 'Moinabad & Chilkur',
    nameTe: 'మొయినాబాద్ & చిల్కూరు',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Moinabad',
    mandalTe: 'మొయినాబాద్',
    village: 'Moinabad',
    villageTe: 'మొయినాబాద్',
    lat: 17.3274,
    lng: 78.2751,
    aliases: ['chilkur', 'aziznagar', 'kanakamamidi', 'himayathsagar', 'amangal'],
  },
  {
    id: 'shabad',
    nameEn: 'Shabad & Chandanvelly (Industrial Hub)',
    nameTe: 'షాబాద్ & చందన్‌వెల్లి',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Shabad',
    mandalTe: 'షాబాద్',
    village: 'Shabad',
    villageTe: 'షాబాద్',
    lat: 17.2085,
    lng: 78.1406,
    aliases: ['chandanvelly', 'chandanvelly sez', 'kakloor'],
  },

  // ─── South / Airport / Pharma & Logistics Corridor ──────────────────────────
  {
    id: 'shamshabad',
    nameEn: 'Shamshabad & Airport (Exit 16)',
    nameTe: 'శంషాబాద్ & విమానాశ్రయం',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Shamshabad',
    mandalTe: 'శంషాబాద్',
    village: 'Shamshabad',
    villageTe: 'శంషాబాద్',
    lat: 17.2403,
    lng: 78.4294,
    aliases: ['shamshabad airport', 'rgia', 'mamidipally', 'gollapally', 'kotwalguda'],
  },
  {
    id: 'thukkuguda',
    nameEn: 'Thukkuguda & Srisailam Highway',
    nameTe: 'తుక్కుగూడ & శ్రీశైలం హైవే',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Maheshwaram',
    mandalTe: 'మహేశ్వరం',
    village: 'Thukkuguda',
    villageTe: 'తుక్కుగూడ',
    lat: 17.2289,
    lng: 78.4900,
    aliases: ['fab city', 'mankhal', 'srisailam highway exit'],
  },
  {
    id: 'maheshwaram',
    nameEn: 'Maheshwaram & Mansanpally',
    nameTe: 'మహేశ్వరం & మన్సన్‌పల్లి',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Maheshwaram',
    mandalTe: 'మహేశ్వరం',
    village: 'Maheshwaram',
    villageTe: 'మహేశ్వరం',
    lat: 17.1350,
    lng: 78.4320,
    aliases: ['mansanpally', 'nandpally', 'nagaram', 'wipro sez', 'electronic city'],
  },
  {
    id: 'kandukur',
    nameEn: 'Kandukur & Pharma City Hub',
    nameTe: 'కందుకూరు & ఫార్మా సిటీ',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Kandukur',
    mandalTe: 'కందుకూరు',
    village: 'Kandukur',
    villageTe: 'కందుకూరు',
    lat: 17.0673,
    lng: 78.4952,
    aliases: ['pharma city', 'mucherla', 'meerkhanpet', 'nedunoor'],
  },
  {
    id: 'adibatla',
    nameEn: 'Adibatla (Aero SEZ & Exit 19)',
    nameTe: 'ఆదిభట్ల (ఏరో సెజ్)',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Ibrahimpatnam',
    mandalTe: 'ఇబ్రహీంపట్నం',
    village: 'Adibatla',
    villageTe: 'ఆదిభట్ల',
    lat: 17.2341,
    lng: 78.5398,
    aliases: ['tcs adibatla', 'bongloor', 'tata aerospace', 'kongara kalan'],
  },
  {
    id: 'ibrahimpatnam',
    nameEn: 'Ibrahimpatnam & Sagar Highway',
    nameTe: 'ఇబ్రహీంపట్నం & సాగర్ హైవే',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Ibrahimpatnam',
    mandalTe: 'ఇబ్రహీంపట్నం',
    village: 'Ibrahimpatnam',
    villageTe: 'ఇబ్రహీంపట్నం',
    lat: 17.1866,
    lng: 78.6471,
    aliases: ['mangalpally', 'cherlapally', 'turkayamjal', 'gurramguda'],
  },
  {
    id: 'shadnagar',
    nameEn: 'Shadnagar & Farooqnagar (NH-44)',
    nameTe: 'షాద్‌నగర్ & ఫరూఖ్‌నగర్',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Farooqnagar',
    mandalTe: 'ఫరూఖ్‌నగర్',
    village: 'Shadnagar',
    villageTe: 'షాద్‌నగర్',
    lat: 17.0722,
    lng: 78.2089,
    aliases: ['farooqnagar', 'kishannagar', 'chowlapally', 'solipur', 'bangalore highway'],
  },
  {
    id: 'kothur',
    nameEn: 'Kothur & Nandigama',
    nameTe: 'కొత్తూరు & నందిగామ',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Kothur',
    mandalTe: 'కొత్తూరు',
    village: 'Kothur',
    villageTe: 'కొత్తూరు',
    lat: 17.1459,
    lng: 78.2878,
    aliases: ['nandigama', 'timmapur', 'penjerla', 'thimmapur'],
  },
  {
    id: 'rajendranagar',
    nameEn: 'Rajendranagar & Appa Junction (Exit 17)',
    nameTe: 'రాజేంద్రనగర్ & అప్పా జంక్షన్',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Rajendranagar',
    mandalTe: 'రాజేంద్రనగర్',
    village: 'Rajendranagar',
    villageTe: 'రాజేంద్రనగర్',
    lat: 17.3195,
    lng: 78.3972,
    aliases: ['appa junction', 'kismathpur', 'bandlaguda jagir', 'sun city', 'hyderguda'],
  },

  // ─── North & Industrial Growth (Patancheru / Medchal / Kompally) ────────────
  {
    id: 'patancheru',
    nameEn: 'Patancheru & Muthangi (Exit 3)',
    nameTe: 'పటాన్‌చెరు & ముత్తంగి',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Patancheru',
    mandalTe: 'పటాన్‌చెరు',
    village: 'Patancheru',
    villageTe: 'పటాన్‌చెరు',
    lat: 17.5312,
    lng: 78.2612,
    aliases: ['muthangi', 'isnapur', 'rudraram', 'pashamylaram', 'indresham', 'nh-65'],
  },
  {
    id: 'ameenpur',
    nameEn: 'Ameenpur & Beeramguda',
    nameTe: 'అమీన్‌పూర్ & బీరంగూడ',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Ameenpur',
    mandalTe: 'అమీన్‌పూర్',
    village: 'Ameenpur',
    villageTe: 'అమీన్‌పూర్',
    lat: 17.5186,
    lng: 78.3242,
    aliases: ['beeramguda', 'ilapur', 'ameenpur lake', 'patelguda'],
  },
  {
    id: 'sangareddy',
    nameEn: 'Sangareddy & IIT Kandi',
    nameTe: 'సంగారెడ్డి & ఐఐటీ కంది',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Sangareddy',
    mandalTe: 'సంగారెడ్డి',
    village: 'Sangareddy',
    villageTe: 'సంగారెడ్డి',
    lat: 17.6200,
    lng: 78.0833,
    aliases: ['iit kandi', 'kandi', 'cheriyal', 'kalabgoor', 'fashad'],
  },
  {
    id: 'sadasivpet',
    nameEn: 'Sadasivpet (NIMZ Corridor)',
    nameTe: 'సదాశివపేట',
    district: 'Sangareddy',
    districtTe: 'సంగారెడ్డి',
    mandal: 'Sadasivpet',
    mandalTe: 'సదాశివపేట',
    village: 'Sadasivpet',
    villageTe: 'సదాశివపేట',
    lat: 17.6186,
    lng: 77.9493,
    aliases: ['nimz', 'zaheerabad', 'kohir', 'malkapur'],
  },
  {
    id: 'dundigal',
    nameEn: 'Dundigal & Bowrampet (Exit 5)',
    nameTe: 'దుండిగల్ & బౌరంపేట్',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Dundigal Gandimaisamma',
    mandalTe: 'దుండిగల్ గండిమైసమ్మ',
    village: 'Dundigal',
    villageTe: 'దుండిగల్',
    lat: 17.5850,
    lng: 78.3900,
    aliases: ['bowrampet', 'mallampet', 'sultanpur', 'kazipally', 'gandimaisamma'],
  },
  {
    id: 'medchal',
    nameEn: 'Medchal & Kandlakoya (Exit 6)',
    nameTe: 'మేడ్చల్ & కండ్లకోయ',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Medchal',
    mandalTe: 'మేడ్చల్',
    village: 'Medchal',
    villageTe: 'మేడ్చల్',
    lat: 17.6163,
    lng: 78.4907,
    aliases: ['kandlakoya', 'dabilpur', 'gundlapochampally', 'athvelly', 'nh-44 north'],
  },
  {
    id: 'kompally',
    nameEn: 'Kompally & Dulapally',
    nameTe: 'కొంపల్లి & దూలపల్లి',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Dundigal Gandimaisamma',
    mandalTe: 'దుండిగల్ గండిమైసమ్మ',
    village: 'Kompally',
    villageTe: 'కొంపల్లి',
    lat: 17.5385,
    lng: 78.4855,
    aliases: ['dulapally', 'bahadurpally', 'jeedimetla', 'quthbullapur'],
  },
  {
    id: 'shamirpet',
    nameEn: 'Shamirpet & Genome Valley (Exit 7)',
    nameTe: 'శామీర్‌పేట్ & జీనోమ్ వ్యాలీ',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Shamirpet',
    mandalTe: 'శామీర్‌పేట్',
    village: 'Shamirpet',
    villageTe: 'శామీర్‌పేట్',
    lat: 17.5912,
    lng: 78.5831,
    aliases: ['genome valley', 'aliabad', 'thumkunta', 'rajiv rahadari'],
  },
  {
    id: 'keesara',
    nameEn: 'Keesara & Bogaram (Exit 8)',
    nameTe: 'కీసర & బోగారం',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Keesara',
    mandalTe: 'కీసర',
    village: 'Keesara',
    villageTe: 'కీసర',
    lat: 17.5120,
    lng: 78.6650,
    aliases: ['bogaram', 'cheeryal', 'rampally', 'nagaram'],
  },

  // ─── East / Warangal Highway & Yadadri Corridor ─────────────────────────────
  {
    id: 'ghatkesar',
    nameEn: 'Ghatkesar & Pocharam (Exit 9)',
    nameTe: 'ఘట్‌కేసర్ & పోచారం',
    district: 'Medchal-Malkajgiri',
    districtTe: 'మేడ్చల్-మల్కాజ్‌గిరి',
    mandal: 'Ghatkesar',
    mandalTe: 'ఘట్‌కేసర్',
    village: 'Ghatkesar',
    villageTe: 'ఘట్‌కేసర్',
    lat: 17.4563,
    lng: 78.6835,
    aliases: ['pocharam', 'infosys ghatkesar', 'korremula', 'annojiguda', 'warangal highway'],
  },
  {
    id: 'pedda-amberpet',
    nameEn: 'Pedda Amberpet & Hayathnagar (Exit 11)',
    nameTe: 'పెద్ద అంబర్‌పేట్ & హయత్‌నగర్',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Abdullapurmet',
    mandalTe: 'అబ్దుల్లాపూర్‌మెట్',
    village: 'Pedda Amberpet',
    villageTe: 'పెద్ద అంబర్‌పేట్',
    lat: 17.3204,
    lng: 78.6473,
    aliases: ['hayathnagar', 'abdullapurmet', 'batasingaram', 'vijayawada highway exit'],
  },
  {
    id: 'bhuvanagiri',
    nameEn: 'Bhuvanagiri & Bhongir',
    nameTe: 'భువనగిరి',
    district: 'Yadadri Bhuvanagiri',
    districtTe: 'యాదాద్రి భువనగిరి',
    mandal: 'Bhuvanagiri',
    mandalTe: 'భువనగిరి',
    village: 'Bhuvanagiri',
    villageTe: 'భువనగిరి',
    lat: 17.5117,
    lng: 78.8890,
    aliases: ['bhongir', 'bibinagar', 'pagidipally', 'aiims bibinagar'],
  },
  {
    id: 'yadagirigutta',
    nameEn: 'Yadagirigutta & Raigir',
    nameTe: 'యాదగిరిగుట్ట & రాయగిరి',
    district: 'Yadadri Bhuvanagiri',
    districtTe: 'యాదాద్రి భువనగిరి',
    mandal: 'Yadagirigutta',
    mandalTe: 'యాదగిరిగుట్ట',
    village: 'Yadagirigutta',
    villageTe: 'యాదగిరిగుట్ట',
    lat: 17.5872,
    lng: 78.9482,
    aliases: ['raigir', 'alair', 'temple city'],
  },
  {
    id: 'choutuppal',
    nameEn: 'Choutuppal & Dandumalkapur',
    nameTe: 'చౌటుప్పల్ & దండుమల్కాపూర్',
    district: 'Yadadri Bhuvanagiri',
    districtTe: 'యాదాద్రి భువనగిరి',
    mandal: 'Choutuppal',
    mandalTe: 'చౌటుప్పల్',
    village: 'Choutuppal',
    villageTe: 'చౌటుప్పల్',
    lat: 17.2514,
    lng: 78.9048,
    aliases: ['dandumalkapur', 'msme green park', 'panthangi', 'pochampally'],
  },

  // ─── Major Regional Telangana Corridors ─────────────────────────────────────
  {
    id: 'gajwel',
    nameEn: 'Gajwel & Pragnapur',
    nameTe: 'గజ్వేల్ & ప్రజ్ఞాపూర్',
    district: 'Siddipet',
    districtTe: 'సిద్దిపేట',
    mandal: 'Gajwel',
    mandalTe: 'గజ్వేల్',
    village: 'Gajwel',
    villageTe: 'గజ్వేల్',
    lat: 17.8504,
    lng: 78.6834,
    aliases: ['pragnapur', 'mulugu', 'markook', 'wargal'],
  },
  {
    id: 'siddipet',
    nameEn: 'Siddipet City',
    nameTe: 'సిద్దిపేట నగరం',
    district: 'Siddipet',
    districtTe: 'సిద్దిపేట',
    mandal: 'Siddipet',
    mandalTe: 'సిద్దిపేట',
    village: 'Siddipet',
    villageTe: 'సిద్దిపేట',
    lat: 18.1018,
    lng: 78.8520,
    aliases: ['duddeda', 'siddipet rural', 'ranganaiksagar'],
  },
  {
    id: 'vikarabad',
    nameEn: 'Vikarabad & Ananthagiri',
    nameTe: 'వికారాబాద్ & అనంతగిరి',
    district: 'Vikarabad',
    districtTe: 'వికారాబాద్',
    mandal: 'Vikarabad',
    mandalTe: 'వికారాబాద్',
    village: 'Vikarabad',
    villageTe: 'వికారాబాద్',
    lat: 17.3370,
    lng: 77.9048,
    aliases: ['ananthagiri', 'nawabpet', 'parigi', 'tandur'],
  },
  {
    id: 'narsapur',
    nameEn: 'Narsapur & Forest Belt',
    nameTe: 'నర్సాపూర్',
    district: 'Medak',
    districtTe: 'మెదక్',
    mandal: 'Narsapur',
    mandalTe: 'నర్సాపూర్',
    village: 'Narsapur',
    villageTe: 'నర్సాపూర్',
    lat: 17.7423,
    lng: 78.2758,
    aliases: ['shivampet', 'tupran', 'medak highway'],
  },
  {
    id: 'jadcherla',
    nameEn: 'Jadcherla & Mahabubnagar',
    nameTe: 'జడ్చర్ల & మహబూబ్‌నగర్',
    district: 'Mahabubnagar',
    districtTe: 'మహబూబ్‌నగర్',
    mandal: 'Jadcherla',
    mandalTe: 'జడ్చర్ల',
    village: 'Jadcherla',
    villageTe: 'జడ్చర్ల',
    lat: 16.7644,
    lng: 78.1367,
    aliases: ['polepally sez', 'mahabubnagar', 'balanagar', 'bhoothpur'],
  },

  // ─── Key Telangana District Centers ─────────────────────────────────────────
  {
    id: 'rangareddy',
    nameEn: 'Rangareddy District',
    nameTe: 'రంగారెడ్డి జిల్లా',
    district: 'Rangareddy',
    districtTe: 'రంగారెడ్డి',
    mandal: 'Rajendranagar',
    mandalTe: 'రాజేంద్రనగర్',
    village: 'Shamshabad',
    villageTe: 'శంషాబాద్',
    lat: 17.3000,
    lng: 78.4000,
    zoom: 12,
    aliases: ['ranga reddy', 'rangareddy dt'],
  },
  {
    id: 'hyderabad',
    nameEn: 'Hyderabad Central',
    nameTe: 'హైదరాబాద్ సెంట్రల్',
    district: 'Hyderabad',
    districtTe: 'హైదరాబాద్',
    mandal: 'Shaikpet',
    mandalTe: 'షేక్‌పేట్',
    village: 'Banjara Hills',
    villageTe: 'బంజారా హిల్స్',
    lat: 17.4065,
    lng: 78.4772,
    zoom: 12,
    aliases: ['hyderabad dt', 'secunderabad', 'hitec city', 'gachibowli', 'jubilee hills'],
  },
  {
    id: 'warangal',
    nameEn: 'Warangal & Hanamkonda',
    nameTe: 'వరంగల్ & హనుమకొండ',
    district: 'Hanamkonda',
    districtTe: 'హనుమకొండ',
    mandal: 'Hanamkonda',
    mandalTe: 'హనుమకొండ',
    village: 'Kazipet',
    villageTe: 'కాజీపేట్',
    lat: 17.9784,
    lng: 79.5941,
    zoom: 13,
    aliases: ['warangal urban', 'hanamkonda', 'kazipet'],
  },
  {
    id: 'karimnagar',
    nameEn: 'Karimnagar City',
    nameTe: 'కరీంనగర్ నగరం',
    district: 'Karimnagar',
    districtTe: 'కరీంనగర్',
    mandal: 'Karimnagar',
    mandalTe: 'కరీంనగర్',
    village: 'Karimnagar',
    villageTe: 'కరీంనగర్',
    lat: 18.4386,
    lng: 79.1288,
    zoom: 13,
    aliases: ['karimnagar dt', 'manair'],
  },
  {
    id: 'khammam',
    nameEn: 'Khammam City',
    nameTe: 'ఖమ్మం నగరం',
    district: 'Khammam',
    districtTe: 'ఖమ్మం',
    mandal: 'Khammam Urban',
    mandalTe: 'ఖమ్మం అర్బన్',
    village: 'Khammam',
    villageTe: 'ఖమ్మం',
    lat: 17.2473,
    lng: 80.1514,
    zoom: 13,
    aliases: ['khammam dt', 'wyra road'],
  },
  {
    id: 'nizamabad',
    nameEn: 'Nizamabad City',
    nameTe: 'నిజామాబాద్ నగరం',
    district: 'Nizamabad',
    districtTe: 'నిజామాబాద్',
    mandal: 'Nizamabad North',
    mandalTe: 'నిజామాబాద్ నార్త్',
    village: 'Nizamabad',
    villageTe: 'నిజామాబాద్',
    lat: 18.6725,
    lng: 78.0941,
    zoom: 13,
    aliases: ['nizamabad dt', 'bodhan road'],
  },
  {
    id: 'nalgonda',
    nameEn: 'Nalgonda City',
    nameTe: 'నల్గొండ నగరం',
    district: 'Nalgonda',
    districtTe: 'నల్గొండ',
    mandal: 'Nalgonda',
    mandalTe: 'నల్గొండ',
    village: 'Nalgonda',
    villageTe: 'నల్గొండ',
    lat: 17.0544,
    lng: 79.2671,
    zoom: 13,
    aliases: ['nalgonda dt', 'miryalaguda road'],
  },
];

// Curated Top 12 Telangana High-Velocity Investment Hubs for Quick Selection
export const TOP_TELANGANA_GROWTH_HUBS = [
  { id: 'kokapet', labelEn: 'Kokapet (Exit 1)', labelTe: 'కోకాపేట్', village: 'Kokapet', mandal: 'Gandipet', district: 'Rangareddy', lat: 17.4042, lng: 78.3308 },
  { id: 'tellapur', labelEn: 'Tellapur (Exit 2)', labelTe: 'తెల్లాపూర్', village: 'Tellapur', mandal: 'Ramachandrapuram', district: 'Sangareddy', lat: 17.4728, lng: 78.2491 },
  { id: 'mokila', labelEn: 'Mokila', labelTe: 'మోకిల', village: 'Mokila', mandal: 'Shankarpally', district: 'Rangareddy', lat: 17.4526, lng: 78.1342 },
  { id: 'shamshabad', labelEn: 'Shamshabad (Exit 16)', labelTe: 'శంషాబాద్', village: 'Shamshabad', mandal: 'Shamshabad', district: 'Rangareddy', lat: 17.2403, lng: 78.4294 },
  { id: 'maheshwaram', labelEn: 'Maheshwaram', labelTe: 'మహేశ్వరం', village: 'Maheshwaram', mandal: 'Maheshwaram', district: 'Rangareddy', lat: 17.1350, lng: 78.4320 },
  { id: 'patancheru', labelEn: 'Patancheru (Exit 3)', labelTe: 'పటాన్‌చెరు', village: 'Patancheru', mandal: 'Patancheru', district: 'Sangareddy', lat: 17.5312, lng: 78.2612 },
  { id: 'adibatla', labelEn: 'Adibatla (Exit 19)', labelTe: 'ఆదిభట్ల', village: 'Adibatla', mandal: 'Ibrahimpatnam', district: 'Rangareddy', lat: 17.2341, lng: 78.5398 },
  { id: 'ghatkesar', labelEn: 'Ghatkesar (Exit 9)', labelTe: 'ఘట్‌కేసర్', village: 'Ghatkesar', mandal: 'Ghatkesar', district: 'Medchal-Malkajgiri', lat: 17.4563, lng: 78.6835 },
  { id: 'medchal', labelEn: 'Medchal (Exit 6)', labelTe: 'మేడ్చల్', village: 'Medchal', mandal: 'Medchal', district: 'Medchal-Malkajgiri', lat: 17.6163, lng: 78.4907 },
  { id: 'shadnagar', labelEn: 'Shadnagar (NH-44)', labelTe: 'షాద్‌నగర్', village: 'Shadnagar', mandal: 'Farooqnagar', district: 'Rangareddy', lat: 17.0722, lng: 78.2089 },
  { id: 'kothur', labelEn: 'Kothur', labelTe: 'కొత్తూరు', village: 'Kothur', mandal: 'Kothur', district: 'Rangareddy', lat: 17.1459, lng: 78.2878 },
  { id: 'rajendranagar', labelEn: 'Rajendranagar (Exit 17)', labelTe: 'రాజేంద్రనగర్', village: 'Rajendranagar', mandal: 'Rajendranagar', district: 'Rangareddy', lat: 17.3195, lng: 78.3972 },
];

/**
 * Calculates geodesic Haversine distance in kilometers between two lat/lng coordinates.
 */
export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the exact shortest distance in km from any coordinate to the 158km Outer Ring Road (ORR).
 */
export function calculateDistanceToOrrKm(lat: number, lng: number): number {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return 0;
  let minDistance = Infinity;

  for (let i = 0; i < ORR_LOOP_COORDINATES.length - 1; i++) {
    const [latA, lngA] = ORR_LOOP_COORDINATES[i];
    const [latB, lngB] = ORR_LOOP_COORDINATES[i + 1];

    const dx = lngB - lngA;
    const dy = latB - latA;
    const lenSq = dx * dx + dy * dy;

    let t = 0;
    if (lenSq > 0) {
      t = ((lng - lngA) * dx + (lat - latA) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }

    const projLat = latA + t * dy;
    const projLng = lngA + t * dx;

    const dist = haversineDistanceKm(lat, lng, projLat, projLng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return Number(minDistance.toFixed(1));
}

export interface NearestLocalityResult {
  locality: LocalityCoord;
  distanceKm: number;
  distanceToOrrKm: number;
}

/**
 * Finds the nearest known Telangana locality/mandal/district from coordinates.
 */
export function findNearestTelanganaLocality(lat: number, lng: number): NearestLocalityResult {
  let closest: LocalityCoord = TELANGANA_MANDALS_GEO[0];
  let minDistance = Infinity;

  for (const item of TELANGANA_MANDALS_GEO) {
    const dist = haversineDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  const distanceToOrr = calculateDistanceToOrrKm(lat, lng);

  return {
    locality: closest,
    distanceKm: Number(minDistance.toFixed(2)),
    distanceToOrrKm: distanceToOrr,
  };
}

/**
 * Searches the Telangana geocoding lookup by name, alias, or district.
 */
export function lookupTelanganaLocation(query: string): LocalityCoord | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // 1. Exact match on ID or Name
  const direct = TELANGANA_MANDALS_GEO.find(
    (item) =>
      item.id === clean ||
      item.nameEn.toLowerCase() === clean ||
      item.village.toLowerCase() === clean ||
      item.mandal.toLowerCase() === clean ||
      clean.includes(item.id) ||
      item.nameEn.toLowerCase().includes(clean) ||
      clean.includes(item.village.toLowerCase())
  );
  if (direct) return direct;

  // 2. District match
  const districtMatch = TELANGANA_MANDALS_GEO.find(
    (item) =>
      item.district.toLowerCase() === clean ||
      clean.includes(item.district.toLowerCase())
  );
  if (districtMatch) return districtMatch;

  // 3. Alias match
  const aliasMatch = TELANGANA_MANDALS_GEO.find(
    (item) =>
      item.aliases &&
      item.aliases.some((alias) => clean.includes(alias) || alias.includes(clean))
  );
  if (aliasMatch) return aliasMatch;

  return null;
}


