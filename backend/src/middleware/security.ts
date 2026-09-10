import { Property, PublicProperty, DocumentType, DocumentStatus } from '../types/index.js';
import { db } from '../db/database.js';

// Mandatory document requirements per property type according to Architecture §4
export const MANDATORY_DOCS: Record<'LAND' | 'FLAT', DocumentType[]> = {
  LAND: [
    'SALE_DEED',
    'EC',
    'LINK_DOCUMENTS',
    'PAHANI',
    'FORM_1B',
    'FMB',
    'PATTADAR_PASSBOOK',
    'HMDA_DTCP_APPROVAL',
    'MUTATION',
    'TAX_RECEIPT',
    'MASTER_PLAN',
    'SALE_AGREEMENT',
  ],
  FLAT: [
    'SALE_DEED',
    'EC',
    'LINK_DOCUMENTS',
    'HMDA_DTCP_APPROVAL',
    'TAX_RECEIPT',
    'SALE_AGREEMENT',
  ],
};

export const ALL_13_DOCS: DocumentType[] = [
  'SALE_DEED',
  'EC',
  'LINK_DOCUMENTS',
  'PAHANI',
  'FORM_1B',
  'FMB',
  'PATTADAR_PASSBOOK',
  'HMDA_DTCP_APPROVAL',
  'MUTATION',
  'TAX_RECEIPT',
  'MASTER_PLAN',
  'GPA',
  'SALE_AGREEMENT',
];

/**
 * Strips confidential seller and owner contact info from properties before public delivery.
 * Complies with QA Pre-Launch Security Checklist Rule #1:
 * "Direct seller contact information is completely stripped from public responses and HTML markup."
 */
export async function sanitizePropertyForPublic(property: Property): Promise<PublicProperty> {
  const docs = await db.findDocumentsByPropertyId(property.id);
  const docStatusMap = new Map<DocumentType, DocumentStatus>();

  for (const d of docs) {
    docStatusMap.set(d.documentType, d.status);
  }

  const mandatory = MANDATORY_DOCS[property.type] || [];
  let verifiedCount = 0;

  const documentsChecklist = ALL_13_DOCS.map((docType) => {
    const status = docStatusMap.get(docType) || 'PENDING';
    const isVerified = status === 'VERIFIED';
    if (isVerified) verifiedCount++;
    return {
      documentType: docType,
      status,
      isVerified,
    };
  });

  const isFullyVerified = mandatory.every((reqDoc) => docStatusMap.get(reqDoc) === 'VERIFIED');

  // Strip sellerId & confidential metadata
  const { sellerId, ...cleanProperty } = property;

  return {
    ...cleanProperty,
    brokerageContact: {
      name: 'Telangana Realty Hub - Dedicated Deal Desk',
      phone: '+91-9876543210',
      whatsapp: '+91-9876543210',
      office: 'Financial District, Nanakramguda, Hyderabad, Telangana 500032',
    },
    verificationStatus: {
      totalDocuments: 13,
      verifiedDocuments: verifiedCount,
      isFullyVerified,
      documentsChecklist,
    },
  };
}
