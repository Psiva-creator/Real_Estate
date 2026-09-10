import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../../middleware/auth.js';
import { documentsService } from './documents.service.js';
import { storageService } from '../../services/storage/storage.service.js';
import { DocumentType, DocumentStatus } from '../../types/index.js';
import { db } from '../../db/database.js';
import { ALL_13_DOCS } from '../../middleware/security.js';

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
      const ownerId = owner?.id || req.user.id;
      return property.sellerId === ownerId || property.sellerId === req.user.id;
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

      if (req.user) {
        const hasAccess = await this.checkPropertyAccess(req, property);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Forbidden: You can only upload documents for your own property' });
        }
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

      if (!docType || !fileExtension) {
        return res.status(400).json({ error: 'docType and fileExtension are required' });
      }

      const property = await db.findPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      if (req.user) {
        const hasAccess = await this.checkPropertyAccess(req, property);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Forbidden: You can only request upload URLs for your own property' });
        }
      }

      const presigned = storageService.generatePresignedUploadUrl(
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

      return res.json({ document: doc });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}

export const documentsController = new DocumentsController();
