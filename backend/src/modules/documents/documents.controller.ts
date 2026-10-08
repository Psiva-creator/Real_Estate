import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../../middleware/auth.js';
import { documentsService } from './documents.service.js';
import { storageService } from '../../services/storage/storage.service.js';
import { DocumentType, DocumentStatus } from '../../types/index.js';
import { db } from '../../db/database.js';
import { ALL_13_DOCS } from '../../middleware/security.js';
import { config } from '../../config/index.js';

// Setup multer memory storage (supports PDF, JPG, PNG up to 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed for verification documents'));
    }
  },
});

export const documentUploadMiddleware = upload.single('file');

export class DocumentsController {
  private async checkPropertyAccess(req: AuthRequest, property: any): Promise<boolean> {
    if (!req.user) return false;
    if (req.user.role === 'ADMIN' || req.user.role === 'AGENT') return true;
    if (req.user.role === 'SELLER') {
      const owner = await db.findOwnerByUserId(req.user.id);
      if (owner && property.sellerId === owner.id) return true;
      if (property.sellerId === req.user.id) return true;
      const propertyOwner = await db.findOwnerById(property.sellerId);
      if (propertyOwner) {
        if (propertyOwner.userId && propertyOwner.userId === req.user.id) return true;
        if (
          propertyOwner.phone &&
          req.user.phone &&
          propertyOwner.phone.replace(/\D/g, '').slice(-10) ===
            req.user.phone.replace(/\D/g, '').slice(-10)
        ) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  /**
   * Direct file upload for verification document
   */
  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const { docType } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to upload property documents' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!docType) {
        return res.status(400).json({ error: 'docType is required' });
      }

      // Check seller ownership or admin access
      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const hasAccess = await this.checkPropertyAccess(req, property);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You can only upload documents for your own property' });
      }

      const doc = await documentsService.handleFileUpload(
        propertyId,
        docType as DocumentType,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return res.status(201).json({
        message: 'Document uploaded successfully and queued for legal verification',
        document: doc,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Request pre-signed URL for S3 or cloud upload
   */
  async getPresignedUploadUrl(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const { docType, fileExtension } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to request upload URLs' });
      }

      if (!docType || !fileExtension) {
        return res.status(400).json({ error: 'docType and fileExtension are required' });
      }

      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const hasAccess = await this.checkPropertyAccess(req, property);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You can only request upload URLs for your own property' });
      }

      const presigned = await storageService.generatePresignedUploadUrl(
        propertyId,
        docType,
        fileExtension
      );

      return res.json(presigned);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Authenticated streaming download endpoint for confidential property documents
   * GET /api/properties/:id/documents/:docType/file
   */
  async streamDocumentFile(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId, docType } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to view property documents' });
      }

      if (!ALL_13_DOCS.includes(docType as any)) {
        return res.status(404).json({ error: `Invalid document type: ${docType}` });
      }

      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const hasAccess = await this.checkPropertyAccess(req, property);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view documents for this property' });
      }

      const doc = await documentsService.getDocument(propertyId, docType as DocumentType);
      if (!doc || !doc.fileUrl) {
        return res.status(404).json({ error: `No uploaded file found for document ${docType}` });
      }

      // If document is in remote S3/R2 storage
      if (doc.fileUrl.startsWith('http://') || doc.fileUrl.startsWith('https://')) {
        const fileKey = `properties/${path.basename(propertyId)}/${path.basename(doc.fileUrl)}`;
        const presignedUrl = await storageService.getPresignedDownloadUrl(fileKey);
        return res.redirect(presignedUrl || doc.fileUrl);
      }

      // If document is stored in local uploads directory
      let relativePath = doc.fileUrl;
      if (relativePath.startsWith('/uploads/')) {
        relativePath = relativePath.slice('/uploads/'.length);
      } else if (relativePath.startsWith('uploads/')) {
        relativePath = relativePath.slice('uploads/'.length);
      }

      const normalizedBaseDir = path.resolve(config.uploadDir);
      const absoluteFilePath = path.resolve(normalizedBaseDir, relativePath);

      // Prevent directory traversal attacks
      if (!absoluteFilePath.startsWith(normalizedBaseDir + path.sep) && absoluteFilePath !== normalizedBaseDir) {
        return res.status(403).json({ error: 'Access denied: Invalid file path' });
      }

      if (!fs.existsSync(absoluteFilePath)) {
        return res.status(404).json({ error: 'Document file not found on server' });
      }

      const ext = path.extname(absoluteFilePath).toLowerCase();
      let contentType = 'application/pdf';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${docType}${ext}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

      return res.sendFile(absoluteFilePath);
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Admin verification endpoint for individual documents
   */
  async verifyDocument(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId, docType } = req.params;
      const { status, rejectionReason } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Only legal administrators can verify or reject verification documents' });
      }

      if (!ALL_13_DOCS.includes(docType as any)) {
        return res.status(400).json({ error: `Invalid document type: ${docType}` });
      }

      if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be either VERIFIED or REJECTED' });
      }

      if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
        return res.status(400).json({ error: 'Rejection reason is required when rejecting a document' });
      }

      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const adminId = req.user.id;
      const result = await documentsService.verifyDocument(
        propertyId,
        docType as DocumentType,
        adminId,
        status as DocumentStatus,
        rejectionReason
      );

      return res.json({
        message: `Document ${docType} successfully marked as ${status}`,
        document: result.document,
        propertyStatus: result.property.status,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Check Go-Live eligibility based on mandatory documents
   */
  async checkGoLiveEligibility(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (req.user) {
        const hasAccess = await this.checkPropertyAccess(req, property);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Forbidden: You can only check eligibility for your own property' });
        }
      }

      const eligibility = await documentsService.validateForGoLive(propertyId);
      return res.json(eligibility);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * List all documents for a property (authenticated and authorized users only)
   */
  async listDocuments(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to view private property documents' });
      }

      const hasAccess = await this.checkPropertyAccess(req, property);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You can only view documents for your own property' });
      }

      const docs = await documentsService.getPropertyDocuments(propertyId);
      if (req.user.role === 'SELLER') {
        const pubMap = property.publishedVerification?.documents || {};
        const sellerSafeDocs = docs.map(({ verifiedBy: _verifiedBy, ...rest }) => {
          const published = pubMap[rest.documentType];
          let status = rest.status;
          let rejectionReason = rest.rejectionReason;
          let verifiedAt = rest.verifiedAt;

          if (published) {
            status = published.status;
            rejectionReason = published.status === 'REJECTED' ? published.rejectionReason : undefined;
            verifiedAt = published.status === 'VERIFIED' ? published.verifiedAt : undefined;
          } else {
            // Not yet published to seller
            status = rest.fileUrl ? 'UPLOADED' : 'PENDING';
            rejectionReason = undefined;
            verifiedAt = undefined;
          }

          return {
            ...rest,
            status,
            rejectionReason,
            verifiedAt,
          };
        });
        return res.json({ documents: sellerSafeDocs });
      }
      return res.json({ documents: docs });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Get single document for a property (authenticated and authorized users only)
   */
  async getDocument(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId, docType } = req.params;
      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required to view private property documents' });
      }

      const hasAccess = await this.checkPropertyAccess(req, property);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden: You can only view documents for your own property' });
      }

      if (!ALL_13_DOCS.includes(docType as any)) {
        return res.status(404).json({ error: `Document of type ${docType} not found for this property` });
      }

      const doc = await documentsService.getDocument(propertyId, docType as DocumentType);
      if (!doc) {
        return res.status(404).json({ error: `Document of type ${docType} not found for this property` });
      }

      if (req.user.role === 'SELLER') {
        const { verifiedBy: _verifiedBy, ...sellerSafeDoc } = doc;
        const pubMap = property.publishedVerification?.documents || {};
        const published = pubMap[doc.documentType];
        if (published) {
          sellerSafeDoc.status = published.status;
          sellerSafeDoc.rejectionReason = published.status === 'REJECTED' ? published.rejectionReason : undefined;
          sellerSafeDoc.verifiedAt = published.status === 'VERIFIED' ? published.verifiedAt : undefined;
        } else {
          sellerSafeDoc.status = doc.fileUrl ? 'UPLOADED' : 'PENDING';
          sellerSafeDoc.rejectionReason = undefined;
          sellerSafeDoc.verifiedAt = undefined;
        }
        return res.json({ document: sellerSafeDoc });
      }

      return res.json({ document: doc });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Publish verification updates to the seller
   * POST /api/properties/:id/verification/publish
   */
  async publishVerification(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'AGENT') {
        return res.status(403).json({ error: 'Forbidden: Only administrators can publish verification updates to the seller' });
      }

      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const result = await documentsService.publishVerification(
        propertyId,
        req.user.name || req.user.id
      );

      return res.json({
        message: 'Verification update sent to seller successfully',
        publishedVerification: result.publishedVerification,
        verificationPublishedAt: result.verificationPublishedAt,
        propertyStatus: result.property.status,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Check verification publishing status
   * GET /api/properties/:id/verification/publish-status
   */
  async getPublishStatus(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'AGENT') {
        return res.status(403).json({ error: 'Forbidden: Only staff can view verification publish status' });
      }

      const status = await documentsService.checkUnpublishedVerificationChanges(propertyId);
      return res.json(status);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}

export const documentsController = new DocumentsController();
