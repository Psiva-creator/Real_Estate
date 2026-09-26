import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/index.js';
import { authController } from './modules/auth/auth.controller.js';
import { propertiesController } from './modules/properties/properties.controller.js';
import { documentsController, documentUploadMiddleware } from './modules/documents/documents.controller.js';
import { enquiriesController } from './modules/enquiries/enquiries.controller.js';
import { ownersController } from './modules/owners/owners.controller.js';
import { mapsController } from './modules/maps/maps.controller.js';
import { adminController } from './modules/admin/admin.controller.js';
import { requireAuth, requireRole, optionalAuth } from './middleware/auth.js';

import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs/openapi.js';

import { getCorsOptions } from './config/cors.js';

export const app = express();
app.disable('x-powered-by');

// Global Middlewares
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving (for local file driver)
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// --- ROOT & SERVICE DISCOVERY ---
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Telangana & Hyderabad Real-Estate Brokerage Backend API',
    status: 'healthy',
    version: '1.0.0',
    documentation: '/api/docs/',
    health: '/api/health',
    endpoints: {
      properties: '/api/properties',
      search: '/api/properties/search',
      enquiries: '/api/enquiries',
      maps: '/api/maps',
      auth: '/api/auth',
    },
  });
});

// --- API DOCUMENTATION (SWAGGER UI) ---
app.get('/docs.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.json(openApiSpec);
});
app.use('/docs', (_req: Request, res: Response) => res.redirect(301, '/api/docs/'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'Telangana Real-Estate Brokerage API Docs',
}));

// --- HEALTH CHECK ---
const handleHealthCheck = (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Telangana Real-Estate Brokerage Backend',
    version: '1.0.0',
  });
};
app.get('/api/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// --- AUTH ROUTES ---
const authRouter = express.Router();
authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/login', authController.login.bind(authController));
authRouter.get('/me', requireAuth, authController.me.bind(authController));
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// --- PROPERTIES ROUTES (PUBLIC & SELLER) ---
const propertiesRouter = express.Router();
propertiesRouter.get('/', propertiesController.listPublic.bind(propertiesController));
propertiesRouter.get('/search', propertiesController.search.bind(propertiesController));
propertiesRouter.get('/:id', propertiesController.getDetail.bind(propertiesController));
propertiesRouter.post('/', optionalAuth, propertiesController.createListing.bind(propertiesController));
propertiesRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  propertiesController.updateStatus.bind(propertiesController)
);
propertiesRouter.patch(
  '/:id',
  requireAuth,
  propertiesController.updateProperty.bind(propertiesController)
);
propertiesRouter.delete(
  '/:id',
  requireAuth,
  propertiesController.deleteProperty.bind(propertiesController)
);
app.use('/api/properties', propertiesRouter);
app.use('/properties', propertiesRouter);

// --- DOCUMENTS & 13-VERIFICATION GATE ROUTES ---
const documentsRouter = express.Router();
documentsRouter.post(
  '/properties/:id/documents/upload',
  optionalAuth,
  documentUploadMiddleware,
  documentsController.uploadDocument.bind(documentsController)
);
documentsRouter.post(
  '/properties/:id/documents/upload-url',
  optionalAuth,
  documentsController.getPresignedUploadUrl.bind(documentsController)
);
documentsRouter.get(
  '/properties/:id/documents/go-live-check',
  optionalAuth,
  documentsController.checkGoLiveEligibility.bind(documentsController)
);
documentsRouter.get(
  '/properties/:id/documents',
  requireAuth,
  documentsController.listDocuments.bind(documentsController)
);
documentsRouter.get(
  '/properties/:id/documents/:docType',
  requireAuth,
  documentsController.getDocument.bind(documentsController)
);
documentsRouter.patch(
  '/properties/:id/documents/:docType/verify',
  requireAuth,
  requireRole(['ADMIN']),
  documentsController.verifyDocument.bind(documentsController)
);
app.use('/api', documentsRouter);

// --- ENQUIRIES & LEAD PIPELINE ROUTES ---
const enquiriesRouter = express.Router();
enquiriesRouter.post('/', enquiriesController.submitEnquiry.bind(enquiriesController));
enquiriesRouter.get(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  enquiriesController.listEnquiries.bind(enquiriesController)
);
enquiriesRouter.get(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  enquiriesController.getEnquiry.bind(enquiriesController)
);
enquiriesRouter.patch(
  '/:id/assign',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  enquiriesController.assignEnquiry.bind(enquiriesController)
);
enquiriesRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  enquiriesController.updateStatus.bind(enquiriesController)
);
enquiriesRouter.patch(
  '/:id/schedule-visit',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  enquiriesController.scheduleSiteVisit.bind(enquiriesController)
);
app.use('/api/enquiries', enquiriesRouter);
app.use('/enquiries', enquiriesRouter);

// --- OWNERS / SELLERS ROUTES ---
const ownersRouter = express.Router();
ownersRouter.get('/me', requireAuth, ownersController.getMyProfile.bind(ownersController));
ownersRouter.get('/', requireAuth, requireRole(['ADMIN']), ownersController.listAll.bind(ownersController));
ownersRouter.get('/:id', requireAuth, requireRole(['ADMIN']), ownersController.getDetail.bind(ownersController));
app.use('/api/owners', ownersRouter);

// --- MAPS & ORR DISTANCE ROUTES ---
const mapsRouter = express.Router();
mapsRouter.get('/distance', mapsController.calculateOrrDistance.bind(mapsController));
app.use('/api/maps', mapsRouter);
app.use('/maps', mapsRouter);

// --- ADMIN / TEAM BACK-OFFICE ROUTES ---
const adminRouter = express.Router();
adminRouter.get(
  '/dashboard',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  adminController.getDashboardStats.bind(adminController)
);
adminRouter.get(
  '/properties',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  adminController.listAllProperties.bind(adminController)
);
adminRouter.get(
  '/properties/:id',
  requireAuth,
  requireRole(['ADMIN', 'AGENT']),
  propertiesController.getInternalDetail.bind(propertiesController)
);
adminRouter.post(
  '/sync-seeds',
  requireAuth,
  requireRole(['ADMIN']),
  adminController.syncSeeds.bind(adminController)
);
app.use('/api/admin', adminRouter);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  const isProduction = config.nodeEnv === 'production';
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'An unexpected internal error occurred' : err.message,
  });
});
