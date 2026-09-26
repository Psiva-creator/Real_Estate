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
