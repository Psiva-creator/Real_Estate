import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../../middleware/auth.js';
import { storageService } from '../../services/storage/storage.service.js';
import { db } from '../../db/database.js';

// Setup multer memory storage for images and media up to 25MB
const mediaMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, GIF, SVG, and PDF files are allowed'));
    }
  },
});

export const mediaUploadMiddleware = mediaMulter.single('file');
export const imageUploadMiddleware = mediaMulter.single('image');

export class MediaController {
  /**
   * Upload image or file and store record in the database
   * POST /api/upload or POST /api/upload/image
   */
  async upload(req: AuthRequest, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file or image uploaded. Field name must be "file" or "image".' });
      }

      const propertyId = (req.body.propertyId as string) || undefined;
      const uploadType = (req.body.uploadType as string) || (file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT');
      const userId = req.user ? req.user.id : (req.body.userId as string) || undefined;

      // 1. Save file to storage
      const saved = await storageService.saveImageBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        uploadType === 'IMAGE' ? 'images' : 'documents'
      );

      // 2. Persist media upload record in PostgreSQL database
      const mediaRecord = await db.recordMediaUpload({
        userId,
        propertyId,
        fileUrl: saved.fileUrl,
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        uploadType,
      });

      return res.status(201).json({
        success: true,
        message: 'File uploaded and stored in database successfully',
        data: mediaRecord,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * List uploaded media records from the database
   * GET /api/upload/media
   */
  async listMedia(req: AuthRequest, res: Response) {
    try {
      const propertyId = (req.query.propertyId as string) || undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const media = await db.listMediaUploads(propertyId, limit);
      return res.json({ media });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }
}

export const mediaController = new MediaController();
