import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';

export interface UploadedFileMeta {
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageDriver: 's3' | 'local';
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
  expectedHeaders: Record<string, string>;
  storageDriver: 's3' | 'local';
}

export class StorageService {
  private baseUploadDir: string;
  private s3Client: S3Client | null = null;
  private isS3Configured: boolean = false;

  constructor() {
    this.baseUploadDir = config.uploadDir;

    // Initialize AWS S3 / Cloudflare R2 Client if credentials or driver set
    const hasS3Credentials = !!(config.awsAccessKeyId && config.awsSecretAccessKey);
    if (config.storageDriver === 's3' || hasS3Credentials) {
      try {
        const s3Options: {
          region: string;
          credentials?: { accessKeyId: string; secretAccessKey: string };
          endpoint?: string;
        } = {
          region: config.awsRegion,
        };

        if (hasS3Credentials) {
          s3Options.credentials = {
            accessKeyId: config.awsAccessKeyId,
            secretAccessKey: config.awsSecretAccessKey,
          };
        }

        if (config.s3Endpoint) {
          s3Options.endpoint = config.s3Endpoint;
        }

        this.s3Client = new S3Client(s3Options);
        this.isS3Configured = true;
        console.log(`[Storage] Initialized AWS S3 / Cloudflare R2 driver (Bucket: ${config.awsS3Bucket}, Region: ${config.awsRegion})`);
      } catch (err) {
        console.warn('[Storage] S3 initialization failed, falling back to local storage driver:', (err as Error).message);
        this.isS3Configured = false;
      }
    }

    // Ensure local upload dir exists for fallback
    if (!fs.existsSync(this.baseUploadDir)) {
      try {
        fs.mkdirSync(this.baseUploadDir, { recursive: true });
      } catch (err) {
        console.warn('[Storage] Could not create local upload directory:', err);
      }
    }
  }

  isSupportedFormat(mimeType: string, extension: string): boolean {
    const validMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    return validMimes.includes(mimeType.toLowerCase()) || validExts.includes(extension.toLowerCase());
  }

  /**
   * Generate Presigned PUT URL for direct client-to-bucket upload (0-memory server load)
   */
  async generatePresignedUploadUrl(
    propertyId: string,
    documentType: string,
    fileExtension: string,
    mimeType?: string
  ): Promise<PresignedUrlResponse> {
    const cleanExt = fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`;
    const token = crypto.randomBytes(16).toString('hex');
    const safePropertyId = path.basename(propertyId);
    const fileKey = `properties/${safePropertyId}/${documentType}_${Date.now()}_${token}${cleanExt}`;
    const contentType = mimeType || (cleanExt === '.pdf' ? 'application/pdf' : 'image/jpeg');

    if (this.isS3Configured && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: config.awsS3Bucket,
          Key: fileKey,
          ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

        return {
          uploadUrl,
          fileKey,
          expiresInSeconds: 900,
          expectedHeaders: {
            'Content-Type': contentType,
          },
          storageDriver: 's3',
        };
      } catch (err) {
        console.warn('[Storage] Failed to generate S3 presigned URL, falling back to local upload route:', (err as Error).message);
      }
    }

    // Local signed upload endpoint fallback
    const uploadUrl = `/api/properties/${safePropertyId}/documents/direct-upload?docType=${encodeURIComponent(
      documentType
    )}&token=${token}`;

    return {
      uploadUrl,
      fileKey,
      expiresInSeconds: 900,
      expectedHeaders: {
        'Content-Type': 'multipart/form-data',
      },
      storageDriver: 'local',
    };
  }

  /**
   * Save uploaded file buffer to S3 / Cloudflare R2 or local disk
   */
  async saveBuffer(
    buffer: Buffer,
    propertyId: string,
    docType: string,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileMeta> {
    const ext = path.extname(originalName) || '.pdf';
    const safePropertyId = path.basename(propertyId);
    const token = crypto.randomBytes(6).toString('hex');
    const filename = `${docType}_${Date.now()}_${token}${ext}`;
    const fileKey = `properties/${safePropertyId}/${filename}`;

    // S3 Storage Driver
    if (this.isS3Configured && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: config.awsS3Bucket,
          Key: fileKey,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            propertyId: safePropertyId,
            documentType: docType,
            originalName: encodeURIComponent(originalName),
          },
        });

        await this.s3Client.send(command);

        const fileUrl = config.s3PublicBaseUrl
          ? `${config.s3PublicBaseUrl.replace(/\/$/, '')}/${fileKey}`
          : `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${fileKey}`;

        return {
          fileUrl,
          originalName,
          mimeType,
          sizeBytes: buffer.length,
          storageDriver: 's3',
        };
      } catch (err) {
        console.error('[Storage] S3 buffer upload failed, falling back to local filesystem:', (err as Error).message);
      }
    }

    // Local Disk Storage Fallback
    const propertyDir = path.join(this.baseUploadDir, safePropertyId);
    if (!fs.existsSync(propertyDir)) {
      fs.mkdirSync(propertyDir, { recursive: true });
    }

    const filePath = path.join(propertyDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safePropertyId}/${filename}`;

    return {
      fileUrl,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      storageDriver: 'local',
    };
  }

  /**
   * Generate Presigned GET URL for confidential document viewing (Passbooks, EC, Deeds)
   */
  async getPresignedDownloadUrl(fileKey: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!this.isS3Configured || !this.s3Client) {
      return null;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: config.awsS3Bucket,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      console.warn('[Storage] Presigned download generation failed:', (err as Error).message);
      return null;
    }
  }

  async saveImageBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    subFolder = 'images'
  ): Promise<UploadedFileMeta> {
    const ext = path.extname(originalName) || '.jpg';
    const filename = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const targetDir = path.join(this.baseUploadDir, subFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${subFolder}/${filename}`;

    return {
      fileUrl,
      originalName,
      mimeType,
      sizeBytes: buffer.length,
      storageDriver: 'local',
    };
  }
}

export const storageService = new StorageService();
