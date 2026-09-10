export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Telangana Real-Estate Brokerage & Mediator API',
    version: '1.0.0',
    description: `Backend API powering the mediator/brokerage platform for Land & Flat transactions across Telangana & Hyderabad Metropolitan Region.
    
### Core Business Capabilities:
- **Strict Seller Privacy:** Strips seller contact details from public listings (QA Pre-Launch Gate #1).
- **13 Document Verification Gate:** Enforces verification before a listing can go LIVE.
- **Hyderabad ORR Distance Matrix:** Calculates distance to Hyderabad Nehru Outer Ring Road and classifies HMDA Service Tiers (Tier 1, 2, 3).
- **Enquiry & Lead Scoring Pipeline:** Scores buyer urgency and auto-dispatches bilingual WhatsApp alerts in English and Telugu.`,
    contact: {
      name: 'Telangana Realty Hub Deal Desk',
      email: 'deal-desk@telanganarealty.in',
      phone: '+91-9876543210',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.telanganarealty.in',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'AGENT', 'SELLER'] },
          whatsapp: { type: 'string' },
        },
      },
      PublicProperty: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['LAND', 'FLAT'] },
          status: { type: 'string', enum: ['LIVE'] },
          titleEn: { type: 'string' },
          titleTe: { type: 'string' },
          descriptionEn: { type: 'string' },
          descriptionTe: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              village: { type: 'string' },
              mandal: { type: 'string' },
              district: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              distanceFromOrrKm: { type: 'number' },
              zone: { type: 'string' },
              tier: { type: 'string', enum: ['TIER_1', 'TIER_2', 'TIER_3'] },
            },
          },
          land: {
            type: 'object',
            properties: {
              totalAcres: { type: 'number' },
              surveyNumbers: { type: 'array', items: { type: 'string' } },
              soilType: { type: 'string' },
              developmentLevel: { type: 'string' },
              roadWidthFt: { type: 'integer' },
            },
          },
          flat: {
            type: 'object',
            properties: {
              sqft: { type: 'integer' },
              bedrooms: { type: 'integer' },
              bathrooms: { type: 'integer' },
              floor: { type: 'integer' },
              amenities: { type: 'array', items: { type: 'string' } },
              possessionStatus: { type: 'string' },
            },
          },
          pricing: {
            type: 'object',
            properties: {
              pricePerAcre: { type: 'number' },
              pricePerSqft: { type: 'number' },
              totalPrice: { type: 'number' },
              isNegotiable: { type: 'boolean' },
            },
          },
          mainImage: { type: 'string' },
          galleryImages: { type: 'array', items: { type: 'string' } },
          brokerageContact: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              whatsapp: { type: 'string' },
              office: { type: 'string' },
            },
          },
          verificationStatus: {
            type: 'object',
            properties: {
              totalDocuments: { type: 'integer', example: 13 },
              verifiedDocuments: { type: 'integer' },
              isFullyVerified: { type: 'boolean' },
              documentsChecklist: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    documentType: { type: 'string' },
                    status: { type: 'string' },
                    isVerified: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      Enquiry: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          buyerName: { type: 'string' },
          phone: { type: 'string' },
          whatsapp: { type: 'string' },
          enquiryType: { type: 'string', enum: ['CALL', 'SITE_VISIT', 'QUESTION'] },
          status: {
            type: 'string',
            enum: [
              'NEW',
              'ASSIGNED',
              'CONTACTED',
              'SITE_VISIT_SCHEDULED',
              'IN_NEGOTIATION',
              'DEAL_CLOSED',
              'DROPPED',
            ],
          },
          assignedTo: { type: 'string' },
          leadScore: { type: 'integer', example: 85 },
          notes: { type: 'string' },
          preferredLanguage: { type: 'string', enum: ['en', 'te'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PropertyDocument: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          documentType: {
            type: 'string',
            enum: [
              'SALE_DEED',
              'EC',
              'LINK_DOCUMENTS',
              'PAHANI',
              'FORM_1B',
              'FMB',
              'PATTADAR_PASSBOOK',
              'HMDA_DTCP_APPROVAL',
              'MUTATION',
              'TAX_RECEIPT',
              'MASTER_PLAN',
              'GPA',
              'SALE_AGREEMENT',
            ],
          },
          fileUrl: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED'] },
          verifiedBy: { type: 'string' },
          verifiedAt: { type: 'string', format: 'date-time' },
          rejectionReason: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health Check',
        description: 'Returns server operational status, version, and timestamp',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string' },
                    service: { type: 'string' },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register User / Seller',
        description: 'Creates a new user account. If role is SELLER, creates owner profile.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'phone'],
                properties: {
                  name: { type: 'string', example: 'B. Satish Goud' },
                  phone: { type: 'string', example: '+919848011223' },
                  email: { type: 'string', example: 'satish.goud@gmail.com' },
                  password: { type: 'string', example: 'SecurePass123!' },
                  whatsapp: { type: 'string', example: '+919848011223' },
                  role: { type: 'string', enum: ['ADMIN', 'AGENT', 'SELLER'], default: 'SELLER' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticate with phone or email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier'],
                properties: {
                  identifier: { type: 'string', example: 'admin@telanganarealty.in' },
                  password: { type: 'string', example: 'Admin@1234' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Current User Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Properties (Public)'],
        summary: 'List Public Verified Listings',
        description: 'Returns only LIVE verified listings with seller contact details stripped',
        responses: {
          200: {
            description: 'List of live properties',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    properties: { type: 'array', items: { $ref: '#/components/schemas/PublicProperty' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Properties (Seller)'],
        summary: 'Submit New Property Listing Draft',
        description: 'Multi-step seller listing onboarding form. Initializes 13 document checklist in PENDING state.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'titleEn', 'descriptionEn', 'location', 'pricing', 'mainImage'],
                properties: {
                  type: { type: 'string', enum: ['LAND', 'FLAT'] },
                  titleEn: { type: 'string', example: '10 Acres Land near Kollur ORR Exit' },
                  titleTe: { type: 'string', example: 'కొల్లూరు ORR వద్ద 10 ఎకరాల భూమి' },
                  descriptionEn: { type: 'string' },
                  descriptionTe: { type: 'string' },
                  location: {
                    type: 'object',
                    required: ['district', 'mandal', 'village'],
                    properties: {
                      district: { type: 'string', example: 'Sangareddy' },
                      mandal: { type: 'string', example: 'Kollur' },
                      village: { type: 'string', example: 'Kollur' },
                      latitude: { type: 'number', example: 17.4728 },
                      longitude: { type: 'number', example: 78.2491 },
                    },
                  },
                  land: {
                    type: 'object',
                    properties: {
                      totalAcres: { type: 'number', example: 10 },
                      surveyNumbers: { type: 'array', items: { type: 'string' }, example: ['142/A'] },
                      soilType: { type: 'string', example: 'RED' },
                    },
                  },
                  flat: {
                    type: 'object',
                    properties: {
                      sqft: { type: 'integer', example: 1850 },
                      bedrooms: { type: 'integer', example: 3 },
                      bathrooms: { type: 'integer', example: 3 },
                    },
                  },
                  pricing: {
                    type: 'object',
                    required: ['totalPrice'],
                    properties: {
                      totalPrice: { type: 'number', example: 80000000 },
                      isNegotiable: { type: 'boolean', example: true },
                    },
                  },
                  mainImage: { type: 'string', example: 'https://example.com/img.jpg' },
                  seller: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Suresh Kumar' },
                      phone: { type: 'string', example: '+919876543210' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Listing draft created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/properties/search': {
      get: {
        tags: ['Properties (Public)'],
        summary: 'Advanced Search & Filter',
        description: 'Filter verified properties by Type, HMDA Tier, Price, ORR Distance, Acres, and Bedrooms',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['LAND', 'FLAT'] } },
          { name: 'tier', in: 'query', schema: { type: 'string', enum: ['TIER_1', 'TIER_2', 'TIER_3'] } },
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'mandal', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'minAcres', in: 'query', schema: { type: 'number' } },
          { name: 'maxAcres', in: 'query', schema: { type: 'number' } },
          { name: 'minBedrooms', in: 'query', schema: { type: 'integer' } },
          { name: 'maxDistanceOrr', in: 'query', schema: { type: 'number' }, description: 'Max distance from ORR in km' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['price_asc', 'price_desc', 'newest', 'orr_distance', 'views'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Filtered results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    properties: { type: 'array', items: { $ref: '#/components/schemas/PublicProperty' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/properties/{id}': {
      get: {
        tags: ['Properties (Public)'],
        summary: 'Public Property Detail',
        description: 'Returns property detail with 13-doc verification summary and brokerage contact. Seller phone & aadhar are strictly stripped.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Sanitized property detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    property: { $ref: '#/components/schemas/PublicProperty' },
                  },
                },
              },
            },
          },
          404: { description: 'Property not found' },
        },
      },
    },
    '/api/properties/{id}/status': {
      patch: {
        tags: ['Properties (Admin)'],
        summary: 'Update Property Status',
        description: 'Transitions property status (DRAFT -> UNDER_REVIEW -> VERIFIED -> LIVE -> SOLD). Guardrail: Cannot transition to LIVE unless all mandatory documents are verified.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'LIVE', 'SOLD', 'OFF_MARKET'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
          400: { description: 'Invalid transition or missing mandatory documents for LIVE status' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/properties/{id}/documents/upload': {
      post: {
        tags: ['13 Document Verification Gate'],
        summary: 'Direct Document Upload',
        description: 'Upload one of the 13 verification documents (PDF, JPG, PNG up to 15MB)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['docType', 'file'],
                properties: {
                  docType: {
                    type: 'string',
                    enum: [
                      'SALE_DEED',
                      'EC',
                      'LINK_DOCUMENTS',
                      'PAHANI',
                      'FORM_1B',
                      'FMB',
                      'PATTADAR_PASSBOOK',
                      'HMDA_DTCP_APPROVAL',
                      'MUTATION',
                      'TAX_RECEIPT',
                      'MASTER_PLAN',
                      'GPA',
                      'SALE_AGREEMENT',
                    ],
                  },
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Document uploaded and queued for review' },
          400: { description: 'Invalid document type or format' },
        },
      },
    },
    '/api/properties/{id}/documents/upload-url': {
      post: {
        tags: ['13 Document Verification Gate'],
        summary: 'Request Pre-signed S3 / Cloud Upload URL',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['docType', 'fileExtension'],
                properties: {
                  docType: { type: 'string' },
                  fileExtension: { type: 'string', example: '.pdf' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Presigned upload URL generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    uploadUrl: { type: 'string' },
                    fileKey: { type: 'string' },
                    expiresInSeconds: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/properties/{id}/documents/go-live-check': {
      get: {
        tags: ['13 Document Verification Gate'],
        summary: 'Check Go-Live Eligibility',
        description: 'Validates whether all mandatory verification documents have been approved by legal team',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Eligibility report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    canGoLive: { type: 'boolean' },
                    missingDocs: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/properties/{id}/documents/{docType}/verify': {
      patch: {
        tags: ['13 Document Verification Gate'],
        summary: 'Admin Document Verification',
        description: 'Legal back-office approval or rejection of an uploaded verification document',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'docType', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['VERIFIED', 'REJECTED'] },
                  rejectionReason: { type: 'string', example: 'Pahani copy is blurred or older than 1 year' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Document verified/rejected' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/enquiries': {
      post: {
        tags: ['Enquiries & Lead Pipeline'],
        summary: 'Submit Buyer Enquiry',
        description: 'Creates lead, calculates dynamic lead score, auto-assigns agent, and dispatches bilingual WhatsApp notifications',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId', 'buyerName', 'phone'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  buyerName: { type: 'string', example: 'Karthik Varma' },
                  phone: { type: 'string', example: '+919888877777' },
                  whatsapp: { type: 'string', example: '+919888877777' },
                  enquiryType: { type: 'string', enum: ['CALL', 'SITE_VISIT', 'QUESTION'], default: 'CALL' },
                  notes: { type: 'string', example: 'Interested in booking site visit for this weekend.' },
                  preferredLanguage: { type: 'string', enum: ['en', 'te'], default: 'en' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Enquiry received and dispatched',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    enquiry: { $ref: '#/components/schemas/Enquiry' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
      get: {
        tags: ['Enquiries & Lead Pipeline'],
        summary: 'List Enquiries (Team Back-Office)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'assignedTo', in: 'query', schema: { type: 'string' } },
          { name: 'propertyId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Enquiry list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enquiries: { type: 'array', items: { $ref: '#/components/schemas/Enquiry' } },
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/enquiries/{id}/assign': {
      patch: {
        tags: ['Enquiries & Lead Pipeline'],
        summary: 'Assign Enquiry to Agent',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['agentId'],
                properties: {
                  agentId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Agent assigned' },
        },
      },
    },
    '/api/enquiries/{id}/schedule-visit': {
      patch: {
        tags: ['Enquiries & Lead Pipeline'],
        summary: 'Schedule Site Visit & Fire WhatsApp Confirmation',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['visitDateTime'],
                properties: {
                  visitDateTime: { type: 'string', example: 'Saturday 11:00 AM IST' },
                  meetingPoint: { type: 'string', example: 'Near Kollur Toll Plaza Exit' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Site visit scheduled and alert sent' },
        },
      },
    },
    '/api/maps/distance': {
      get: {
        tags: ['Maps & ORR Corridor'],
        summary: 'Calculate Distance to Hyderabad Outer Ring Road (ORR)',
        description: 'Computes geodesic distance to Nehru ORR and assigns HMDA Service Tier (Tier 1, 2, 3)',
        parameters: [
          { name: 'lat', in: 'query', schema: { type: 'number' }, example: 17.3986 },
          { name: 'lng', in: 'query', schema: { type: 'number' }, example: 78.3245 },
          { name: 'location', in: 'query', schema: { type: 'string' }, example: 'Kokapet' },
        ],
        responses: {
          200: {
            description: 'Distance and Tier classification',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    distanceFromOrrKm: { type: 'number', example: 2.8 },
                    tier: { type: 'string', example: 'TIER_2' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin & Deal Desk'],
        summary: 'Executive Dashboard Stats',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Platform metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalProperties: { type: 'integer' },
                    propertiesByStatus: { type: 'object' },
                    totalEnquiries: { type: 'integer' },
                    enquiriesByStatus: { type: 'object' },
                    totalSellers: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
