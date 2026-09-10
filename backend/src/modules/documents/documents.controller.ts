import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../../middleware/auth.js';
import { documentsService } from './documents.service.js';
import { storageService } from '../../services/storage/storage.service.js';
import { DocumentType, DocumentStatus } from '../../types/index.js';
import { db } from '../../db/database.js';

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

      if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be either VERIFIED or REJECTED' });
      }

      if (status === 'REJECTED' && !rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required when rejecting a document' });
      }

      const adminId = req.user?.id || 'admin-system';
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
      const eligibility = await documentsService.validateForGoLive(propertyId);
      return res.json(eligibility);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * List all documents for a property
   */
  async listDocuments(req: AuthRequest, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const docs = await documentsService.getPropertyDocuments(propertyId);
      return res.json({ documents: docs });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}

export const documentsController = new DocumentsController();
