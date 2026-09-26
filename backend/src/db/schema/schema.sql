-- Real-Estate Brokerage Platform Database Schema (PostgreSQL)
-- Focused on Telangana / Hyderabad Metropolitan Brokerage & Mediator Model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS (Created idempotently)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type_enum') THEN
        CREATE TYPE property_type_enum AS ENUM ('LAND', 'FLAT', 'VILLA');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status_enum') THEN
        CREATE TYPE property_status_enum AS ENUM ('DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'LIVE', 'SOLD', 'OFF_MARKET');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_type_enum') THEN
        CREATE TYPE doc_type_enum AS ENUM (
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
            'SALE_AGREEMENT'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_status_enum') THEN
        CREATE TYPE doc_status_enum AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enquiry_type_enum') THEN
        CREATE TYPE enquiry_type_enum AS ENUM ('CALL', 'SITE_VISIT', 'QUESTION');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enquiry_status_enum') THEN
        CREATE TYPE enquiry_status_enum AS ENUM ('NEW', 'ASSIGNED', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'IN_NEGOTIATION', 'DEAL_CLOSED', 'DROPPED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'AGENT', 'SELLER');
    END IF;
END $$;

-- Migration Alteration for Existing Databases
ALTER TYPE property_type_enum ADD VALUE IF NOT EXISTS 'VILLA';

-- 2. USERS TABLE (Internal team & sellers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    whatsapp VARCHAR(20),
    role user_role_enum NOT NULL DEFAULT 'AGENT',
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. OWNERS / SELLERS TABLE
CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    aadhar_number VARCHAR(12),
    properties_count INT DEFAULT 0,
    deals_completed INT DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    type property_type_enum NOT NULL,
    status property_status_enum NOT NULL DEFAULT 'DRAFT',
    
    -- Content & Localization
    title_en VARCHAR(255) NOT NULL,
    title_te VARCHAR(255),
    description_en TEXT NOT NULL,
    description_te TEXT,
    
    -- Location & Zoning (HMDA Focus)
    village VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_from_orr_km DECIMAL(6, 2),
    zone VARCHAR(100), -- e.g. R1, Residential, Commercial
    tier VARCHAR(50) NOT NULL, -- TIER_1, TIER_2, TIER_3
    
    -- Land Specifics
    total_acres DECIMAL(10, 4),
    survey_numbers TEXT[], -- Array of survey numbers
    soil_type VARCHAR(50),
    development_level VARCHAR(50),
    road_width_ft INT,
    water_available BOOLEAN DEFAULT FALSE,
    electricity_available BOOLEAN DEFAULT FALSE,
    
    -- Flat Specifics
    sqft INT,
    bedrooms INT,
    bathrooms INT,
    floor INT,
    total_floors INT,
    amenities TEXT[],
    possession_status VARCHAR(50),
    
    -- Pricing
    price_per_acre DECIMAL(15, 2),
    price_per_sqft DECIMAL(15, 2),
    total_price DECIMAL(15, 2) NOT NULL,
    outrate DECIMAL(15, 2),
    half_development_value DECIMAL(15, 2),
    is_negotiable BOOLEAN DEFAULT FALSE,
    
    -- Media
    main_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    site_plan_image TEXT,
    
    -- Stats
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    boundary_coordinates JSONB DEFAULT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migration Alteration for Existing Properties Table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS boundary_coordinates JSONB DEFAULT NULL;

-- 5. PROPERTY DOCUMENTS TABLE (13 Required Verification Gates)
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type doc_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    status doc_status_enum NOT NULL DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_property_doc UNIQUE (property_id, document_type)
);

-- 6. ENQUIRIES & LEAD PIPELINE TABLE (Mediated deal pipeline)
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    enquiry_type enquiry_type_enum NOT NULL DEFAULT 'CALL',
    status enquiry_status_enum NOT NULL DEFAULT 'NEW',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    lead_score INT DEFAULT 50, -- 0-100 based on urgency/budget match
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(district, mandal, village);
CREATE INDEX IF NOT EXISTS idx_properties_orr_distance ON properties(distance_from_orr_km);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON enquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_property_documents_status ON property_documents(status);
