import { db } from '../../db/database.js';
import { storageService } from '../../services/storage/storage.service.js';
import { notificationService } from '../../services/notification/whatsapp.service.js';
import { DocumentType, DocumentStatus, PropertyDocument, Property } from '../../types/index.js';
import { MANDATORY_DOCS, ALL_13_DOCS } from '../../middleware/security.js';

export class DocumentsService {
  /**
   * Save uploaded document and update verification record
   */
  async handleFileUpload(
    propertyId: string,
    docType: DocumentType,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<PropertyDocument> {
    const property = await db.findPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`);
    }

    if (!ALL_13_DOCS.includes(docType)) {
      throw new Error(`Invalid document type: ${docType}`);
    }

    if (!storageService.isSupportedFormat(mimeType, originalName)) {
      throw new Error('Unsupported file format. Only PDF, JPG, JPEG, and PNG files are allowed.');
    }

    const savedFile = await storageService.saveBuffer(
      fileBuffer,
      propertyId,
      docType,
      originalName,
      mimeType
    );

    const doc = await db.upsertDocument({
      propertyId,
      documentType: docType,
      fileUrl: savedFile.fileUrl,
      status: 'UPLOADED',
    });

    // If property was in DRAFT, move to UNDER_REVIEW once documents start coming in
    if (property.status === 'DRAFT') {
      await db.updateProperty(propertyId, { status: 'UNDER_REVIEW' });
    }

    return doc;
  }

  /**
   * Admin verification / rejection of a specific document
   */
  async verifyDocument(
    propertyId: string,
    docType: DocumentType,
    verifiedByAdminId: string,
    status: DocumentStatus,
    rejectionReason?: string
  ): Promise<{ document: PropertyDocument; property: Property }> {
    const property = await db.findPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`);
    }

    const existingDoc = await db.findDocument(propertyId, docType);
    if (!existingDoc) {
      throw new Error(`Document of type ${docType} has not been uploaded yet for this property`);
    }

    const updatedDoc = await db.upsertDocument({
      propertyId,
      documentType: docType,
      fileUrl: existingDoc.fileUrl,
      status,
      verifiedBy: verifiedByAdminId,
      verifiedAt: new Date().toISOString(),
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
    });

    // Check if all mandatory documents are now verified
    const allDocs = await db.findDocumentsByPropertyId(propertyId);
    const docMap = new Map<DocumentType, DocumentStatus>(allDocs.map((d) => [d.documentType, d.status]));
    const mandatory = MANDATORY_DOCS[property.type];
    const allMandatoryVerified = mandatory.every((reqType) => docMap.get(reqType) === 'VERIFIED');

    let updatedProperty = property;
    if (allMandatoryVerified && property.status !== 'LIVE' && property.status !== 'SOLD') {
      updatedProperty = (await db.updateProperty(propertyId, { status: 'VERIFIED' })) || property;

      // Dispatch alert to seller that property is verified
      const seller = await db.findOwnerById(property.sellerId);
      if (seller) {
        await notificationService.sendWhatsApp({
          to: seller.whatsapp || seller.phone,
          template: 'seller_listing_verified',
          variables: {
            seller_name: seller.name,
            property_title: property.titleEn,
            seller_portal_url: `/dashboard/seller/properties/${property.id}`,
          },
        });
      }
    }

    return { document: updatedDoc, property: updatedProperty };
  }

  /**
   * Verify all mandatory documents are satisfied before allowing transition to LIVE
   */
  async validateForGoLive(propertyId: string): Promise<{ canGoLive: boolean; missingDocs: DocumentType[] }> {
    const property = await db.findPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const docs = await db.findDocumentsByPropertyId(propertyId);
    const verifiedTypes = new Set(docs.filter((d) => d.status === 'VERIFIED').map((d) => d.documentType));

    const mandatory = MANDATORY_DOCS[property.type];
    const missingDocs = mandatory.filter((m) => !verifiedTypes.has(m));

    return {
      canGoLive: missingDocs.length === 0,
      missingDocs,
    };
  }

  async getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]> {
    return db.findDocumentsByPropertyId(propertyId);
  }
}

export const documentsService = new DocumentsService();
