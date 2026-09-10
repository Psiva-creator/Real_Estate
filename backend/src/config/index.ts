import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/telangana_realty',
  dbSsl: process.env.DB_SSL === 'true',

  // JWT Auth
  jwtSecret: process.env.JWT_SECRET || 'telangana-realty-jwt-secret-key-2026-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Storage
  storageDriver: (process.env.STORAGE_DRIVER || 'local') as 'local' | 's3',
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || 'telangana-realty-documents',
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),

  // Messaging & WhatsApp Gateway
  notificationProvider: (process.env.NOTIFICATION_PROVIDER || 'mock') as 'mock' | 'twilio' | 'wati',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  watiApiEndpoint: process.env.WATI_API_ENDPOINT || '',
  watiAccessToken: process.env.WATI_ACCESS_TOKEN || '',

  // Team & Alerts
  adminAlertPhone: process.env.ADMIN_ALERT_PHONE || '+919876543210',
  adminAlertWhatsApp: process.env.ADMIN_ALERT_WHATSAPP || '+919876543210',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
};
