-- Enhanced Database Migration Script
-- This script adds new tables and columns to support the enhanced features

-- Add new columns to existing tables
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE manufacturers 
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS market_presence TEXT[], -- Array of countries
ADD COLUMN IF NOT EXISTS headquarters VARCHAR(255),
ADD COLUMN IF NOT EXISTS support_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS support_phone VARCHAR(255),
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS confidence_score FLOAT,
ADD COLUMN IF NOT EXISTS embedding FLOAT[];

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS max_input_current FLOAT,
ADD COLUMN IF NOT EXISTS communication_method VARCHAR(255),
ADD COLUMN IF NOT EXISTS ip_rating VARCHAR(255),
ADD COLUMN IF NOT EXISTS operating_temperature VARCHAR(255),
ADD COLUMN IF NOT EXISTS grid_certifications TEXT[],
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS embedding FLOAT[],
ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS confidence_score FLOAT,
ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS market_availability TEXT[];

ALTER TABLE product_specifications 
ADD COLUMN IF NOT EXISTS confidence FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS source_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS page_number INTEGER,
ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extraction_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS normalized_value VARCHAR(255);

ALTER TABLE product_certifications 
ADD COLUMN IF NOT EXISTS certificate_url TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(255);

-- Add foreign key for manufacturer_id in product_certifications
ALTER TABLE product_certifications 
ADD CONSTRAINT fk_certifications_manufacturer 
FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id);

-- Create new tables

-- Web Search Cache
CREATE TABLE IF NOT EXISTS web_search_cache (
    id VARCHAR(255) PRIMARY KEY,
    query TEXT NOT NULL,
    results JSONB NOT NULL,
    source VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Market Research
CREATE TABLE IF NOT EXISTS market_research (
    id VARCHAR(255) PRIMARY KEY,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    market_size FLOAT,
    growth_rate FLOAT,
    competitors TEXT[],
    trends JSONB,
    regulations JSONB,
    source_url TEXT,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced AI Extraction tracking
CREATE TABLE IF NOT EXISTS ai_extractions (
    id VARCHAR(255) PRIMARY KEY,
    source_url TEXT NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    extracted_data JSONB,
    model VARCHAR(100),
    confidence FLOAT DEFAULT 0.0,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    summary TEXT,
    categories JSONB,
    product_id VARCHAR(255),
    manufacturer_id VARCHAR(255),
    user_id VARCHAR(255),
    crawl_job_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign keys for ai_extractions
ALTER TABLE ai_extractions 
ADD CONSTRAINT fk_ai_extractions_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE ai_extractions 
ADD CONSTRAINT fk_ai_extractions_manufacturer 
FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE;

ALTER TABLE ai_extractions 
ADD CONSTRAINT fk_ai_extractions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ai_extractions 
ADD CONSTRAINT fk_ai_extractions_crawl_job 
FOREIGN KEY (crawl_job_id) REFERENCES crawl_jobs(id) ON DELETE CASCADE;

-- Enhanced Product Availability
CREATE TABLE IF NOT EXISTS product_availability (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    manufacturer_id VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    distributor VARCHAR(255),
    price_range VARCHAR(255),
    lead_time VARCHAR(255),
    notes TEXT,
    source_url TEXT,
    last_checked TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign keys for product_availability
ALTER TABLE product_availability 
ADD CONSTRAINT fk_availability_product 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_availability 
ADD CONSTRAINT fk_availability_manufacturer 
FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE CASCADE;

-- Enhanced Datasheet management
ALTER TABLE datasheets 
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'application/pdf',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extraction_confidence FLOAT;

-- Update existing datasheet records with default values
UPDATE datasheets 
SET mime_type = 'application/pdf', 
    processed_at = created_at 
WHERE mime_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturers_country ON manufacturers(country);
CREATE INDEX IF NOT EXISTS idx_manufacturers_active ON manufacturers(is_active);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_power ON products(ac_power);
CREATE INDEX IF NOT EXISTS idx_specifications_product ON product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_specifications_confidence ON product_specifications(confidence);
CREATE INDEX IF NOT EXISTS idx_certifications_country ON product_certifications(country);
CREATE INDEX IF NOT EXISTS idx_certifications_standard ON product_certifications(standard);
CREATE INDEX IF NOT EXISTS idx_availability_country ON product_availability(country);
CREATE INDEX IF NOT EXISTS idx_availability_product ON product_availability(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_extractions_source ON ai_extractions(source_url);
CREATE INDEX IF NOT EXISTS idx_ai_extractions_confidence ON ai_extractions(confidence);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_type ON crawl_jobs(crawl_type);
CREATE INDEX IF NOT EXISTS idx_web_cache_query ON web_search_cache(query);
CREATE INDEX IF NOT EXISTS idx_web_cache_expires ON web_search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_market_research_country ON market_research(country);

-- Create vector indexes for embeddings (if using pgvector extension)
-- Note: This requires the pgvector extension to be installed
-- DO $$ BEGIN
--   CREATE EXTENSION IF NOT EXISTS vector;
-- END $$;

-- CREATE INDEX IF NOT EXISTS idx_manufacturers_embedding ON manufacturers USING ivf(embedding vector_cosine_ops);
-- CREATE INDEX IF NOT EXISTS idx_products_embedding ON products USING ivf(embedding vector_cosine_ops);

-- Insert default system configuration
INSERT INTO system_config (id, key, value) VALUES 
('default-search-results', 'default_search_results', '{"pageSize": 20, "maxResults": 100}'),
('ai-extraction', 'ai_extraction', '{"model": "gpt-4-turbo-preview", "temperature": 0.1, "maxTokens": 2000}'),
('web-search', 'web_search', '{"provider": "serpapi", "maxResults": 20, "cacheExpiry": 3600}'),
('pdf-processing', 'pdf_processing', '{"maxFileSize": 10485760, "supportedFormats": ["pdf"], "extractTables": true}'),
('market-research', 'market_research', '{"defaultCountries": ["US", "Germany", "China"], "updateFrequency": "weekly"}')
ON CONFLICT (key) DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables that need updated_at
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specifications_updated_at BEFORE UPDATE ON product_specifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON product_certifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON product_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasheets_updated_at BEFORE UPDATE ON datasheets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_extractions_updated_at BEFORE UPDATE ON ai_extractions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_research_updated_at BEFORE UPDATE ON market_research 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE manufacturers IS 'Enhanced manufacturer information with market presence and AI summary fields';
COMMENT ON TABLE products IS 'Enhanced product model with comprehensive specifications and market availability';
COMMENT ON TABLE product_specifications IS 'Product specifications with AI confidence scores and source tracking';
COMMENT ON TABLE product_certifications IS 'Product certifications with market-specific data and verification tracking';
COMMENT ON TABLE product_availability IS 'Market availability information for products by country/region';
COMMENT ON TABLE datasheets IS 'Enhanced datasheet management with AI processing metadata';
COMMENT ON TABLE ai_extractions IS 'AI extraction tracking with detailed metadata and results';
COMMENT ON TABLE web_search_cache IS 'Cache for web search results to avoid redundant API calls';
COMMENT ON TABLE market_research IS 'Market research data for different countries and regions';
COMMENT ON TABLE system_config IS 'System configuration and settings';

-- Migration completed
SELECT 'Enhanced schema migration completed successfully' as status;
