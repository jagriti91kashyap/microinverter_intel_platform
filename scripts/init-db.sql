-- Initialize PostgreSQL database with pgvector extension
-- This script runs when the PostgreSQL container starts for the first time

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance
-- These will be created after Prisma migrations run

-- You can add any custom SQL initialization here
-- For example, default data or custom functions

-- Example: Create a function for text similarity search
CREATE OR REPLACE FUNCTION text_similarity(search_text text, target_text text)
RETURNS float8 AS $$
BEGIN
    -- This is a placeholder for a more sophisticated similarity function
    -- In production, you might use pg_trgm or other extensions
    RETURN CASE 
        WHEN target_text ILIKE '%' || search_text || '%' THEN 1.0
        WHEN target_text ILIKE search_text || '%' THEN 0.8
        WHEN target_text ILIKE '%' || search_text THEN 0.8
        ELSE 0.0
    END;
END;
$$ LANGUAGE plpgsql;

-- Create a function for updating search embeddings
CREATE OR REPLACE FUNCTION update_product_search_embedding()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would be called to update embeddings when products change
    -- The actual embedding generation would happen in the application layer
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Microinverter Platform database initialized successfully';
    RAISE NOTICE 'pgvector extension enabled';
END $$;
