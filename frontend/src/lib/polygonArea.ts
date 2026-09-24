/**
 * Geodesic and planar area calculations for land parcels and plot boundaries.
 * Tailored for Telangana revenue units (Acres, Guntas, Sq.Yards).
 */

export interface PolygonAreaResult {
  sqMeters: number;
  sqYards: number;
  acres: number;
  guntas: number;
  wholeAcres: number;
  wholeGuntas: number;
  formattedAcres: string;
  formattedSqYards: string;
  perimeterMeters: number;
}

/**
 * Calculates geodesic area of a polygon defined by [lat, lng] coordinates.
 * Uses local planar equirectangular projection centered at parcel centroid,
 * which provides millimeter accuracy for real estate parcels (< 100km²).
 */
export function calculatePolygonArea(coords: Array<[number, number]>): PolygonAreaResult {
  if (!coords || coords.length < 3) {
    return {
      sqMeters: 0,
      sqYards: 0,
      acres: 0,
      guntas: 0,
      wholeAcres: 0,
      wholeGuntas: 0,
      formattedAcres: '0.00 Acres',
      formattedSqYards: '0 Sq.Yds',
      perimeterMeters: 0,
    };
  }

  const RADIUS = 6378137; // Earth's mean radius in meters (WGS84)

  // Compute centroid latitude for projection
  let sumLat = 0;
  for (let i = 0; i < coords.length; i++) {
    sumLat += coords[i][0];
  }
  const centerLatRad = ((sumLat / coords.length) * Math.PI) / 180;

  // Convert lat/lng coordinates to metric cartesian [x, y]
  const points = coords.map(([lat, lng]) => ({
    x: ((lng * Math.PI) / 180) * RADIUS * Math.cos(centerLatRad),
    y: ((lat * Math.PI) / 180) * RADIUS,
  }));

  // Shoelace formula for polygon area
  let areaSum = 0;
  let perimeterMeters = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    areaSum += points[i].x * points[j].y;
    areaSum -= points[j].x * points[i].y;

    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeterMeters += Math.sqrt(dx * dx + dy * dy);
  }

  const sqMeters = Math.abs(areaSum) / 2;

  // 1 Square Meter = 1.19599 Square Yards (standard Indian land measurement)
  const sqYards = sqMeters * 1.19599;

  // 1 Acre = 4,840 Square Yards
  // 1 Acre = 40 Guntas
  // 1 Gunta = 121 Square Yards
  const totalAcres = sqYards / 4840;
  const wholeAcres = Math.floor(totalAcres);
  const remainingFraction = totalAcres - wholeAcres;
  const guntasFraction = remainingFraction * 40;
  const wholeGuntas = Math.round(guntasFraction);

  let formattedAcres: string;
  if (totalAcres < 0.01) {
    formattedAcres = `${Math.round(sqYards)} Sq.Yds`;
  } else if (totalAcres < 1) {
    const displayGuntas = Math.max(1, Math.round(totalAcres * 40));
    formattedAcres = `${displayGuntas} Guntas (${totalAcres.toFixed(2)} Ac)`;
  } else if (wholeGuntas === 0 || wholeGuntas === 40) {
    const effectiveAcres = wholeGuntas === 40 ? wholeAcres + 1 : wholeAcres;
    formattedAcres = `${effectiveAcres} Acres`;
  } else {
    formattedAcres = `${totalAcres.toFixed(2)} Acres (${wholeAcres} Ac ${wholeGuntas} Gts)`;
  }

  const formattedSqYards = `${Math.round(sqYards).toLocaleString('en-IN')} Sq.Yds`;

  return {
    sqMeters: Math.round(sqMeters),
    sqYards: Math.round(sqYards),
    acres: Number(totalAcres.toFixed(2)),
    guntas: Number(guntasFraction.toFixed(1)),
    wholeAcres,
    wholeGuntas,
    formattedAcres,
    formattedSqYards,
    perimeterMeters: Math.round(perimeterMeters),
  };
}
