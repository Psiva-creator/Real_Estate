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
  lat: number;
  lng: number;
  zoom?: number;
  aliases?: string[];
}

export const TELANGANA_MANDALS_GEO: LocalityCoord[] = [
  // West & IT Growth Corridor
  { id: 'kokapet', nameEn: 'Kokapet & Neopolis', nameTe: 'కోకాపేట్ & నియోపోలిస్', lat: 17.4042, lng: 78.3308, aliases: ['neopolis', 'financial district', 'gandipet'] },
  { id: 'narsingi', nameEn: 'Narsingi & Puppalaguda', nameTe: 'నర్సింగి & పుప్పాలగూడ', lat: 17.3850, lng: 78.3582, aliases: ['manchirevula', 'puppalaguda'] },
  { id: 'tellapur', nameEn: 'Tellapur & Kollur', nameTe: 'తెల్లాపూర్ & కొల్లూరు', lat: 17.4728, lng: 78.2491, aliases: ['velimala', 'osman nagar', 'edulanagulapally'] },
  { id: 'mokila', nameEn: 'Mokila & Shankarpally', nameTe: 'మోకిల & శంకరపల్లి', lat: 17.4526, lng: 78.1342, aliases: ['shankarpally', 'singapur', 'proddatur', 'maharajpet'] },
  { id: 'chevella', nameEn: 'Chevella & Aloor', nameTe: 'చేవెళ్ల & ఆలూర్', lat: 17.3073, lng: 78.1352, aliases: ['chevella', 'aloor', 'damargidda', 'kandwada'] },
  { id: 'moinabad', nameEn: 'Moinabad & Chilkur', nameTe: 'మొయినాబాద్ & చిల్కూరు', lat: 17.3274, lng: 78.2751, aliases: ['moinabad', 'chilkur', 'aziznagar', 'kanakamamidi', 'himayathsagar'] },
  { id: 'shabad', nameEn: 'Shabad & Chandanvelly', nameTe: 'షాబాద్ & చందన్‌వెల్లి', lat: 17.2085, lng: 78.1406, aliases: ['shabad', 'chandanvelly', 'kakloor'] },

  // South / Airport / Pharma Corridor
  { id: 'shamshabad', nameEn: 'Shamshabad & Airport', nameTe: 'శంషాబాద్ & విమానాశ్రయం', lat: 17.2403, lng: 78.4294, aliases: ['shamshabad', 'mamidipally', 'gollapally', 'kotwalguda'] },
  { id: 'thukkuguda', nameEn: 'Thukkuguda & Srisailam Highway', nameTe: 'తుక్కుగూడ & శ్రీశైలం హైవే', lat: 17.2289, lng: 78.4900, aliases: ['thukkuguda', 'fab city', 'mankhal'] },
  { id: 'maheshwaram', nameEn: 'Maheshwaram & Mansanpally', nameTe: 'మహేశ్వరం & మన్సన్‌పల్లి', lat: 17.1350, lng: 78.4320, aliases: ['maheshwaram', 'mansanpally', 'nandpally', 'nagaram'] },
  { id: 'kandukur', nameEn: 'Kandukur & Pharma City', nameTe: 'కందుకూరు & ఫార్మా సిటీ', lat: 17.0673, lng: 78.4952, aliases: ['kandukur', 'mucherla', 'meerkhanpet', 'nedunoor'] },
  { id: 'adibatla', nameEn: 'Adibatla & Bongloor', nameTe: 'ఆదిభట్ల & బొంగుళూరు', lat: 17.2341, lng: 78.5398, aliases: ['adibatla', 'bongloor', 'tcs', 'kongara kalan'] },
  { id: 'ibrahimpatnam', nameEn: 'Ibrahimpatnam & Sagar Highway', nameTe: 'ఇబ్రహీంపట్నం & సాగర్ హైవే', lat: 17.1866, lng: 78.6471, aliases: ['ibrahimpatnam', 'mangalpally', 'cherlapally', 'turkayamjal'] },
  { id: 'yacharam', nameEn: 'Yacharam & Green Pharma', nameTe: 'యాచారం', lat: 17.0428, lng: 78.6738, aliases: ['yacharam', 'manchal', 'nandiwanaparthy'] },
  { id: 'shadnagar', nameEn: 'Shadnagar & Farooqnagar', nameTe: 'షాద్‌నగర్ & ఫరూఖ్‌నగర్', lat: 17.0722, lng: 78.2089, aliases: ['shadnagar', 'farooqnagar', 'kishannagar', 'chowlapally'] },
  { id: 'kothur', nameEn: 'Kothur & Nandigama', nameTe: 'కొత్తూరు & నందిగామ', lat: 17.1459, lng: 78.2878, aliases: ['kothur', 'nandigama', 'timmapur', 'penjerla'] },
  { id: 'rajendranagar', nameEn: 'Rajendranagar & Appa Junction', nameTe: 'రాజేంద్రనగర్ & అప్పా జంక్షన్', lat: 17.3195, lng: 78.3972, aliases: ['rajendranagar', 'kismathpur', 'bandlaguda', 'sun city', 'hyderguda'] },

  // North & Industrial Growth
  { id: 'patancheru', nameEn: 'Patancheru & Muthangi', nameTe: 'పటాన్‌చెరు & ముత్తంగి', lat: 17.5312, lng: 78.2612, aliases: ['patancheru', 'muthangi', 'isnapur', 'rudraram', 'pashamylaram', 'indresham'] },
  { id: 'ameenpur', nameEn: 'Ameenpur & Beeramguda', nameTe: 'అమీన్‌పూర్ & బీరంగూడ', lat: 17.5186, lng: 78.3242, aliases: ['ameenpur', 'beeramguda', 'ilapur'] },
  { id: 'sangareddy', nameEn: 'Sangareddy & IIT Kandi', nameTe: 'సంగారెడ్డి & ఐఐటీ కంది', lat: 17.6200, lng: 78.0833, aliases: ['sangareddy', 'kandi', 'cheriyal', 'kalabgoor'] },
  { id: 'sadasivpet', nameEn: 'Sadasivpet (NIMZ Corridor)', nameTe: 'సదాశివపేట', lat: 17.6186, lng: 77.9493, aliases: ['sadasivpet', 'nimz', 'zaheerabad', 'kohir'] },
  { id: 'dundigal', nameEn: 'Dundigal & Bowrampet', nameTe: 'దుండిగల్ & బౌరంపేట్', lat: 17.5850, lng: 78.3900, aliases: ['dundigal', 'bowrampet', 'mallampet', 'sultanpur', 'kazipally'] },
  { id: 'medchal', nameEn: 'Medchal & Kandlakoya', nameTe: 'మేడ్చల్ & కండ్లకోయ', lat: 17.6163, lng: 78.4907, aliases: ['medchal', 'kandlakoya', 'dabilpur', 'gundlapochampally', 'athvelly'] },
  { id: 'kompally', nameEn: 'Kompally & Dulapally', nameTe: 'కొంపల్లి & దూలపల్లి', lat: 17.5385, lng: 78.4855, aliases: ['kompally', 'dulapally', 'bahadurpally'] },
  { id: 'shamirpet', nameEn: 'Shamirpet & Genome Valley', nameTe: 'శామీర్‌పేట్ & జీనోమ్ వ్యాలీ', lat: 17.5912, lng: 78.5831, aliases: ['shamirpet', 'genome valley', 'aliabad', 'thumkunta'] },
  { id: 'keesara', nameEn: 'Keesara & Bogaram', nameTe: 'కీసర & బోగారం', lat: 17.5120, lng: 78.6650, aliases: ['keesara', 'bogaram', 'cheeryal', 'rampally'] },

  // East / Warangal & Vijayawada Highway Corridors
  { id: 'ghatkesar', nameEn: 'Ghatkesar & Pocharam', nameTe: 'ఘట్‌కేసర్ & పోచారం', lat: 17.4563, lng: 78.6835, aliases: ['ghatkesar', 'pocharam', 'infosys', 'korremula', 'annojiguda'] },
  { id: 'pedda-amberpet', nameEn: 'Pedda Amberpet & Hayathnagar', nameTe: 'పెద్ద అంబర్‌పేట్ & హయత్‌నగర్', lat: 17.3204, lng: 78.6473, aliases: ['pedda amberpet', 'hayathnagar', 'abdullapurmet', 'batasingaram'] },
  { id: 'bhuvanagiri', nameEn: 'Bhuvanagiri & Bhongir', nameTe: 'భువనగిరి', lat: 17.5117, lng: 78.8890, aliases: ['bhuvanagiri', 'bhongir', 'bibinagar', 'pagidipally'] },
  { id: 'yadagirigutta', nameEn: 'Yadagirigutta & Raigir', nameTe: 'యాదగిరిగుట్ట & రాయగిరి', lat: 17.5872, lng: 78.9482, aliases: ['yadagirigutta', 'raigir', 'alair'] },
  { id: 'choutuppal', nameEn: 'Choutuppal & Dandumalkapur', nameTe: 'చౌటుప్పల్ & దండుమల్కాపూర్', lat: 17.2514, lng: 78.9048, aliases: ['choutuppal', 'dandumalkapur', 'panthangi', 'pochampally'] },

  // Northern & Western Regional Corridors
  { id: 'gajwel', nameEn: 'Gajwel & Pragnapur', nameTe: 'గజ్వేల్ & ప్రజ్ఞాపూర్', lat: 17.8504, lng: 78.6834, aliases: ['gajwel', 'pragnapur', 'mulugu', 'markook', 'wargal'] },
  { id: 'siddipet', nameEn: 'Siddipet Town', nameTe: 'సిద్దిపేట', lat: 18.1018, lng: 78.8520, aliases: ['siddipet', 'duddeda'] },
  { id: 'vikarabad', nameEn: 'Vikarabad & Ananthagiri', nameTe: 'వికారాబాద్ & అనంతగిరి', lat: 17.3370, lng: 77.9048, aliases: ['vikarabad', 'ananthagiri', 'nawabpet', 'parigi', 'tandur'] },
  { id: 'narsapur', nameEn: 'Narsapur & Forest Belt', nameTe: 'నర్సాపూర్', lat: 17.7423, lng: 78.2758, aliases: ['narsapur', 'shivampet', 'tupran'] },
  { id: 'jadcherla', nameEn: 'Jadcherla & Mahabubnagar', nameTe: 'జడ్చర్ల & మహబూబ్‌నగర్', lat: 16.7644, lng: 78.1367, aliases: ['jadcherla', 'polepally', 'mahabubnagar', 'balanagar'] },
];

/**
 * Searches the Telangana geocoding lookup by name or alias.
 */
export function lookupTelanganaLocation(query: string): LocalityCoord | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // 1. Exact match on ID or Name
  const direct = TELANGANA_MANDALS_GEO.find(
    (item) =>
      item.id === clean ||
      item.nameEn.toLowerCase() === clean ||
      clean.includes(item.id) ||
      item.nameEn.toLowerCase().includes(clean)
  );
  if (direct) return direct;

  // 2. Alias match
  const aliasMatch = TELANGANA_MANDALS_GEO.find(
    (item) => item.aliases && item.aliases.some((alias) => clean.includes(alias) || alias.includes(clean))
  );
  if (aliasMatch) return aliasMatch;

  return null;
}

