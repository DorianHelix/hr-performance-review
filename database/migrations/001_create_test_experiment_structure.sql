-- Database Migration for Creative Performance and Experiment Components
-- This migration creates the complete structure for test types, platforms, experiments, and scores
-- Preserves existing Shopify-related tables

-- Drop existing tables (except Shopify-related)
DROP TABLE IF EXISTS creative_scores CASCADE;
DROP TABLE IF EXISTS experiment_results CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS test_type_platforms CASCADE;
DROP TABLE IF EXISTS platforms CASCADE;
DROP TABLE IF EXISTS test_types CASCADE;

-- 1. Test Types Table (shared between Experiment and Creative Performance)
CREATE TABLE test_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    description TEXT,
    color VARCHAR(50), -- Hex color or Tailwind color name
    icon_name VARCHAR(50), -- Icon identifier
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Platforms Table (Meta, Google, TikTok, etc.)
CREATE TABLE platforms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    color VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Test Type-Platform Mapping (which platforms are allowed for each test type)
CREATE TABLE test_type_platforms (
    test_type_id VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (test_type_id, platform_id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- 4. Experiments Table (A/B tests from Experiment component)
CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type_id VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(255), -- References Shopify products
    variant_a_name VARCHAR(255),
    variant_a_description TEXT,
    variant_b_name VARCHAR(255),
    variant_b_description TEXT,
    hypothesis TEXT,
    success_metrics TEXT,
    target_audience TEXT,
    budget DECIMAL(10, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, planning, running, paused, completed, archived
    winner VARCHAR(10), -- 'A', 'B', or NULL
    confidence_level DECIMAL(5, 2), -- Statistical confidence percentage
    sample_size_a INT DEFAULT 0,
    sample_size_b INT DEFAULT 0,
    conversion_rate_a DECIMAL(5, 2),
    conversion_rate_b DECIMAL(5, 2),
    notes TEXT,
    pushed_to_evaluation BOOLEAN DEFAULT false,
    evaluation_date TIMESTAMP,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_type_id) REFERENCES test_types(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

-- 5. Experiment Results Table (KPI metrics for experiments)
CREATE TABLE experiment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    metric_name VARCHAR(255) NOT NULL, -- impressions, clicks, ctr, conversions, cpc, roas, etc.
    variant VARCHAR(10) NOT NULL, -- 'A' or 'B'
    metric_value DECIMAL(15, 4),
    metric_unit VARCHAR(50), -- percentage, currency, count, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
    UNIQUE(experiment_id, metric_date, metric_name, variant)
);

-- 6. Creative Scores Table (Performance evaluations from Creative Performance)
CREATE TABLE creative_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL, -- References Shopify products
    test_type_id VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL,
    evaluation_date DATE NOT NULL,
    score INT CHECK (score >= 1 AND score <= 10),
    performance_report TEXT,
    media_buyer_review TEXT,
    experiment_id UUID, -- Links back to the experiment if pushed from there
    evaluator_id VARCHAR(255), -- User who performed the evaluation
    impressions INT,
    clicks INT,
    conversions INT,
    spend DECIMAL(10, 2),
    revenue DECIMAL(10, 2),
    ctr DECIMAL(5, 2), -- Click-through rate
    cvr DECIMAL(5, 2), -- Conversion rate
    cpc DECIMAL(10, 2), -- Cost per click
    cpa DECIMAL(10, 2), -- Cost per acquisition
    roas DECIMAL(10, 2), -- Return on ad spend
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_type_id) REFERENCES test_types(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id),
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE SET NULL,
    UNIQUE(product_id, test_type_id, platform_id, evaluation_date)
);

-- 7. Create indexes for better query performance
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_dates ON experiments(start_date, end_date);
CREATE INDEX idx_experiments_product ON experiments(product_id);
CREATE INDEX idx_experiment_results_date ON experiment_results(metric_date);
CREATE INDEX idx_creative_scores_product ON creative_scores(product_id);
CREATE INDEX idx_creative_scores_date ON creative_scores(evaluation_date);
CREATE INDEX idx_creative_scores_experiment ON creative_scores(experiment_id);

-- 8. Create update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_types_updated_at BEFORE UPDATE ON test_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_scores_updated_at BEFORE UPDATE ON creative_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert default test types
INSERT INTO test_types (id, name, short_name, description, color, icon_name, display_order) VALUES
('vct', 'Video Creative Test', 'VCT', 'Testing video creative performance', '#A78BFA', 'Video', 1),
('sct', 'Static Creative Test', 'SCT', 'Testing static image creative performance', '#60A5FA', 'Image', 2),
('act', 'Ad Copy Test', 'ACT', 'Testing ad copy effectiveness', '#34D399', 'FileText', 3),
('lpt', 'Landing Page Test', 'LPT', 'Testing landing page variations', '#F59E0B', 'Globe', 4),
('aut', 'Audience Test', 'AUT', 'Testing different audience segments', '#EF4444', 'Users', 5),
('prt', 'Price Test', 'PRT', 'Testing price points and offers', '#10B981', 'DollarSign', 6),
('fmt', 'Format Test', 'FMT', 'Testing different ad formats', '#8B5CF6', 'Layout', 7);

-- 10. Insert default platforms
INSERT INTO platforms (id, name, description, icon_name, color, display_order) VALUES
('meta', 'Meta', 'Facebook and Instagram Ads', 'Facebook', 'blue', 1),
('google', 'Google', 'Google Ads and YouTube', 'Chrome', 'yellow', 2),
('tiktok', 'TikTok', 'TikTok Ads', 'Music', 'pink', 3),
('snapchat', 'Snapchat', 'Snapchat Ads', 'Camera', 'yellow', 4),
('pinterest', 'Pinterest', 'Pinterest Ads', 'Image', 'red', 5),
('amazon', 'Amazon', 'Amazon Advertising', 'ShoppingCart', 'orange', 6),
('linkedin', 'LinkedIn', 'LinkedIn Ads', 'Linkedin', 'blue', 7);

-- 11. Set up default platform allowances for test types
-- Video Creative Test - All major platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('vct', 'meta', true),
('vct', 'google', true),
('vct', 'tiktok', true),
('vct', 'snapchat', false),
('vct', 'pinterest', false);

-- Static Creative Test - All platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('sct', 'meta', true),
('sct', 'google', true),
('sct', 'tiktok', false),
('sct', 'pinterest', true),
('sct', 'amazon', false),
('sct', 'linkedin', false);

-- Ad Copy Test - Text-heavy platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('act', 'meta', true),
('act', 'google', true),
('act', 'linkedin', false),
('act', 'amazon', false);

-- Landing Page Test - All platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('lpt', 'meta', true),
('lpt', 'google', true),
('lpt', 'tiktok', false),
('lpt', 'pinterest', false),
('lpt', 'linkedin', false);

-- Audience Test - Major platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('aut', 'meta', true),
('aut', 'google', true),
('aut', 'tiktok', false),
('aut', 'linkedin', false);

-- Price Test - E-commerce focused
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('prt', 'meta', true),
('prt', 'google', true),
('prt', 'amazon', true);

-- Format Test - Multi-format platforms
INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES
('fmt', 'meta', true),
('fmt', 'google', true),
('fmt', 'tiktok', false),
('fmt', 'snapchat', false);

-- Add comments for documentation
COMMENT ON TABLE test_types IS 'Defines all test types available for experiments and creative evaluation';
COMMENT ON TABLE platforms IS 'Advertising platforms where tests can be run';
COMMENT ON TABLE test_type_platforms IS 'Mapping of which platforms are available for each test type';
COMMENT ON TABLE experiments IS 'A/B test experiments created in the Experiment component';
COMMENT ON TABLE experiment_results IS 'Daily KPI metrics tracked for each experiment';
COMMENT ON TABLE creative_scores IS 'Performance scores and metrics from Creative Performance evaluations';