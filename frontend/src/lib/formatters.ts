/**
 * Currency & Measurement formatters tailored for Telangana & Indian Real Estate
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatAcreage(acres: number): string {
  if (acres < 1) {
    // 1 Acre = 40 Guntas
    const guntas = Math.round(acres * 40);
    return `${guntas} Guntas (${acres} Acre)`;
  }
  return `${acres.toFixed(2).replace(/\.00$/, '')} Acres`;
}

export function formatOrrDistance(km?: number): string {
  if (km === undefined || km === null) return 'HMDA Zone';
  if (km === 0) return 'Direct ORR Touch';
  return `${km} km from ORR`;
}
