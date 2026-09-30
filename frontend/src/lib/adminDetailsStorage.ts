import { AdminPropertyDetails, BuyerFacingAdminDetails } from '@/types/adminDetails';

const STORAGE_PREFIX = 'trh_admin_details_';

export function getAdminDetailsStorageKey(propertyId: string): string {
  return `${STORAGE_PREFIX}${propertyId}`;
}

/**
 * Strips internalNotes completely to ensure zero data leakage on public-facing pages.
 */
export function stripInternalNotes(
  details?: AdminPropertyDetails | null
): BuyerFacingAdminDetails | null {
  if (!details) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { internalNotes, ...buyerFacing } = details;
  return buyerFacing;
}

/**
 * Checks whether any buyer-facing curated details exist and have content.
 */
export function hasBuyerFacingDetails(
  details?: BuyerFacingAdminDetails | AdminPropertyDetails | null
): boolean {
  if (!details) return false;

  if (details.projectDescription?.trim()) return true;
  if (details.highlights && details.highlights.some((h) => h.trim().length > 0)) return true;
  if (details.amenities && details.amenities.some((a) => a.trim().length > 0)) return true;
  if (details.locationAdvantages && details.locationAdvantages.some((l) => l.trim().length > 0))
    return true;
  if (details.nearbyLandmarks && details.nearbyLandmarks.some((n) => n.trim().length > 0))
    return true;
  if (
    details.additionalSpecifications &&
    details.additionalSpecifications.some((s) => s.label.trim() && s.value.trim())
  )
    return true;
  if (details.specialFeatures && details.specialFeatures.some((f) => f.trim().length > 0))
    return true;
  if (details.pricingNotes?.trim()) return true;
  if (details.siteVisitInstructions?.trim()) return true;
  if (details.additionalNotes?.trim()) return true;
  if (
    details.customSections &&
    details.customSections.some((c) => c.title.trim() && c.content.trim())
  )
    return true;

  return false;
}

/**
 * Loads admin details from localStorage (browser) falling back to property-provided details.
 */
export function loadAdminDetails(
  propertyId: string,
  fallback?: AdminPropertyDetails | null
): AdminPropertyDetails | null {
  if (typeof window === 'undefined') {
    return fallback ?? null;
  }

  try {
    const raw = localStorage.getItem(getAdminDetailsStorageKey(propertyId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (fallback && typeof fallback === 'object' && Object.keys(fallback).length > 0) {
          const fallbackTime = fallback.updatedAt ? new Date(fallback.updatedAt).getTime() : 0;
          const localTime = parsed.updatedAt ? new Date(parsed.updatedAt).getTime() : 0;
          if (fallbackTime >= localTime) {
            return {
              ...parsed,
              ...fallback,
            };
          }
        }
        return {
          ...(fallback ?? {}),
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.warn('[adminDetailsStorage] Failed to read from localStorage:', err);
  }

  return fallback ?? null;
}

/**
 * Saves admin details to localStorage and dispatches window event for reactive updates.
 */
export function persistAdminDetailsLocally(
  propertyId: string,
  details: AdminPropertyDetails
): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getAdminDetailsStorageKey(propertyId), JSON.stringify(details));

    // Dispatch custom event so any other listening components in the session update immediately
    window.dispatchEvent(
      new CustomEvent('trh-admin-details-changed', {
        detail: { propertyId, details },
      })
    );
  } catch (err) {
    console.error('[adminDetailsStorage] Failed to write to localStorage:', err);
  }
}
