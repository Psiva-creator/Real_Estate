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

    const existingDoc = await db.findDocument(propertyId, docType);
    if (existingDoc && existingDoc.status === 'VERIFIED') {
      throw new Error(`Cannot re-upload document ${docType}: It is already VERIFIED. Revocation required by legal team before re-upload.`);
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

    try {
      await db.recordMediaUpload({
        propertyId,
        fileUrl: savedFile.fileUrl,
        originalName,
        mimeType,
        sizeBytes: savedFile.sizeBytes,
        uploadType: 'DOCUMENT',
      });
    } catch (err) {
      console.warn('Could not record in media_uploads:', (err as Error).message);
    }

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

    if (existingDoc.status === 'PENDING' && (!existingDoc.fileUrl || !existingDoc.fileUrl.trim())) {
      throw new Error(`Cannot verify or reject document ${docType} with status PENDING. The document must be UPLOADED first.`);
    }

    if (existingDoc.status === 'VERIFIED' && status === 'VERIFIED') {
      throw new Error(`Document ${docType} is already VERIFIED.`);
    }

    const updatedDoc = await db.upsertDocument({
      propertyId,
      documentType: docType,
      fileUrl: existingDoc.fileUrl,
      status,
      verifiedBy: verifiedByAdminId,
      verifiedAt: new Date().toISOString(),
      rejectionReason: status === 'REJECTED' ? rejectionReason?.trim() : undefined,
    });

    // Check if all mandatory documents are now verified
    const allDocs = await db.findDocumentsByPropertyId(propertyId);
    const docMap = new Map<DocumentType, DocumentStatus>(allDocs.map((d) => [d.documentType, d.status]));
    const mandatory = MANDATORY_DOCS[property.type];
    const allMandatoryVerified = mandatory.every((reqType) => docMap.get(reqType) === 'VERIFIED');

    return { document: updatedDoc, property };
  }

  /**
   * Check whether unpublished verification changes exist
   */
  async checkUnpublishedVerificationChanges(propertyId: string): Promise<{
    hasUnpublishedChanges: boolean;
    publishedVerification: any;
    verificationPublishedAt?: string;
    unpublishedCount: number;
  }> {
    const property = await db.findPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const allDocs = await db.findDocumentsByPropertyId(propertyId);
    const pubMap = property.publishedVerification?.documents || {};

    let unpublishedCount = 0;

    for (const doc of allDocs) {
      const pubDoc = pubMap[doc.documentType];
      if (doc.status === 'VERIFIED' || doc.status === 'REJECTED') {
        if (!pubDoc || pubDoc.status !== doc.status || (doc.status === 'REJECTED' && pubDoc.rejectionReason !== doc.rejectionReason)) {
          unpublishedCount++;
        }
      } else if (pubDoc && (pubDoc.status === 'VERIFIED' || pubDoc.status === 'REJECTED')) {
        // Was previously published as verified/rejected, but admin reverted
        unpublishedCount++;
      }
    }

    return {
      hasUnpublishedChanges: unpublishedCount > 0,
      publishedVerification: property.publishedVerification || null,
      verificationPublishedAt: property.verificationPublishedAt,
      unpublishedCount,
    };
  }

  /**
   * Publish current verification state to the seller
   */
  async publishVerification(
    propertyId: string,
    publishedBy: string
  ): Promise<{ property: Property; publishedVerification: any; verificationPublishedAt: string }> {
    const property = await db.findPropertyById(propertyId);
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`);
    }

    const allDocs = await db.findDocumentsByPropertyId(propertyId);
    const docRecord: Record<string, { status: DocumentStatus; rejectionReason?: string; verifiedAt?: string }> = {};

    for (const d of allDocs) {
      docRecord[d.documentType] = {
        status: d.status,
        rejectionReason: d.status === 'REJECTED' ? d.rejectionReason : undefined,
        verifiedAt: d.status === 'VERIFIED' ? d.verifiedAt : undefined,
      };
    }

    const publishedAt = new Date().toISOString();
    const publishedVerification = {
      publishedAt,
      publishedBy,
      documents: docRecord,
    };

    let updatedProperty = await db.updateProperty(propertyId, {
      publishedVerification,
      verificationPublishedAt: publishedAt,
    });

    if (!updatedProperty) {
      throw new Error(`Failed to update property ${propertyId}`);
    }

    // Check if all mandatory documents are verified in the published state
    const mandatory = MANDATORY_DOCS[property.type] || [];
    const allMandatoryVerified =
      mandatory.length > 0 &&
      mandatory.every((reqType) => docRecord[reqType]?.status === 'VERIFIED');

    if (allMandatoryVerified && updatedProperty.status !== 'LIVE' && updatedProperty.status !== 'SOLD') {
      const verifiedProp = await db.updateProperty(propertyId, { status: 'VERIFIED' });
      if (verifiedProp) {
        updatedProperty = verifiedProp;
      }

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
    } else if (!allMandatoryVerified && updatedProperty.status === 'VERIFIED') {
      const reviewProp = await db.updateProperty(propertyId, { status: 'UNDER_REVIEW' });
      if (reviewProp) {
        updatedProperty = reviewProp;
      }
    }

    return {
      property: updatedProperty,
      publishedVerification,
      verificationPublishedAt: publishedAt,
    };
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

  async getDocument(propertyId: string, docType: DocumentType): Promise<PropertyDocument | null> {
    return db.findDocument(propertyId, docType);
  }
}

export const documentsService = new DocumentsService();
