import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../../config/index.js';

export interface UploadedFileMeta {
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
  expectedHeaders: Record<string, string>;
}

export class StorageService {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = config.uploadDir;
    if (!fs.existsSync(this.baseUploadDir)) {
      try {
        fs.mkdirSync(this.baseUploadDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create upload directory:', err);
      }
    }
  }

  isSupportedFormat(mimeType: string, extension: string): boolean {
    const validMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    return validMimes.includes(mimeType.toLowerCase()) || validExts.includes(extension.toLowerCase());
  }

  generatePresignedUploadUrl(
    propertyId: string,
    documentType: string,
    fileExtension: string
  ): PresignedUrlResponse {
    const cleanExt = fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`;
    const token = crypto.randomBytes(16).toString('hex');
    const fileKey = `docs/${propertyId}/${documentType}_${token}${cleanExt}`;

    if (config.storageDriver === 's3') {
      // S3 presigned PUT URL stub (or AWS SDK integration)
      const uploadUrl = `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${fileKey}?signature=${token}`;
      return {
        uploadUrl,
        fileKey,
        expiresInSeconds: 900,
        expectedHeaders: {
          'Content-Type': cleanExt === '.pdf' ? 'application/pdf' : 'image/jpeg',
        },
      };
    } else {
      // Local signed upload endpoint
      const uploadUrl = `/api/properties/${propertyId}/documents/direct-upload?docType=${documentType}&token=${token}`;
      return {
        uploadUrl,
        fileKey,
        expiresInSeconds: 900,
        expectedHeaders: {
          'Content-Type': 'multipart/form-data',
        },
      };
    }
  }

  async saveBuffer(
    buffer: Buffer,
    propertyId: string,
    docType: string,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileMeta> {
    const ext = path.extname(originalName) || '.pdf';
    const filename = `${docType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const propertyDir = path.join(this.baseUploadDir, propertyId);

    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true });
    }

    const filePath = path.join(propertyDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${propertyId}/${filename}`;

    return {
      fileUrl,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
    };
  }
}

export const storageService = new StorageService();
