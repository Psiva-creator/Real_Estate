export interface AdminCustomField {
  id: string;
  label: string;
  value: string;
}

export interface AdminCustomSection {
  id: string;
  title: string;
  content: string;
}

export interface AdminPropertyDetails {
  /** Curated narrative / summary of the property or project written by TRH desk */
  projectDescription?: string;

  /** Key highlights (e.g., 30-year EC cleared, 100ft road facing, immediate registration) */
  highlights?: string[];

  /** Curated buyer-facing amenities */
  amenities?: string[];

  /** Connectivity and location advantages */
  locationAdvantages?: string[];

  /** Nearby landmarks with distance/travel time */
  nearbyLandmarks?: string[];

  /** Flexible key-value specifications (e.g., Facing: East, Water: Manjeera) */
  additionalSpecifications?: AdminCustomField[];

  /** Special features (e.g., Vastu compliant, corner plot, valley view) */
  specialFeatures?: string[];

  /** Pricing breakdown or notes (e.g., registration extra, bank loan pre-approved) */
  pricingNotes?: string;

  /** Instructions for buyers regarding site visits (e.g., 2-hr prior notice, gate pass) */
  siteVisitInstructions?: string;

  /** General buyer-facing notes */
  additionalNotes?: string;

  /** Fully flexible arbitrary custom sections (title + content) */
  customSections?: AdminCustomSection[];

  /**
   * Internal Admin Notes — strictly private!
   * NEVER exposed on public property pages or sent to buyers.
   */
  internalNotes?: string;

  /** Tracking metadata */
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Stripped buyer-facing representation guaranteed to omit internalNotes.
 */
export type BuyerFacingAdminDetails = Omit<AdminPropertyDetails, 'internalNotes'>;
