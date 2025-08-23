// API endpoints for Experiment and Creative Performance database operations
import pool from '../database/db.js';

// Test Types API
export const testTypesApi = {
  // Get all test types
  async getAll() {
    const query = `
      SELECT t.*, 
        array_agg(
          json_build_object(
            'platform_id', tp.platform_id,
            'is_default', tp.is_default
          ) ORDER BY p.display_order
        ) FILTER (WHERE tp.platform_id IS NOT NULL) as allowed_platforms
      FROM test_types t
      LEFT JOIN test_type_platforms tp ON t.id = tp.test_type_id
      LEFT JOIN platforms p ON tp.platform_id = p.id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.display_order`;
    
    const result = await pool.query(query);
    return result.rows;
  },

  // Get single test type
  async getById(id) {
    const query = `
      SELECT t.*, 
        array_agg(
          json_build_object(
            'platform_id', tp.platform_id,
            'is_default', tp.is_default
          )
        ) FILTER (WHERE tp.platform_id IS NOT NULL) as allowed_platforms
      FROM test_types t
      LEFT JOIN test_type_platforms tp ON t.id = tp.test_type_id
      WHERE t.id = $1
      GROUP BY t.id`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Create test type
  async create(testType) {
    const { id, name, short_name, description, color, icon_name, display_order, allowed_platforms } = testType;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert test type
      const insertQuery = `
        INSERT INTO test_types (id, name, short_name, description, color, icon_name, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;
      
      const result = await client.query(insertQuery, [
        id, name, short_name, description, color, icon_name, display_order || 0
      ]);
      
      // Insert platform mappings
      if (allowed_platforms && allowed_platforms.length > 0) {
        for (const platform of allowed_platforms) {
          await client.query(
            'INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES ($1, $2, $3)',
            [id, platform.platform_id, platform.is_default || false]
          );
        }
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Update test type
  async update(id, updates) {
    const { name, short_name, description, color, icon_name, display_order, is_active, allowed_platforms } = updates;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update test type
      const updateQuery = `
        UPDATE test_types 
        SET name = COALESCE($2, name),
            short_name = COALESCE($3, short_name),
            description = COALESCE($4, description),
            color = COALESCE($5, color),
            icon_name = COALESCE($6, icon_name),
            display_order = COALESCE($7, display_order),
            is_active = COALESCE($8, is_active)
        WHERE id = $1
        RETURNING *`;
      
      const result = await client.query(updateQuery, [
        id, name, short_name, description, color, icon_name, display_order, is_active
      ]);
      
      // Update platform mappings if provided
      if (allowed_platforms !== undefined) {
        // Delete existing mappings
        await client.query('DELETE FROM test_type_platforms WHERE test_type_id = $1', [id]);
        
        // Insert new mappings
        for (const platform of allowed_platforms) {
          await client.query(
            'INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES ($1, $2, $3)',
            [id, platform.platform_id, platform.is_default || false]
          );
        }
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete test type (soft delete)
  async delete(id) {
    const query = 'UPDATE test_types SET is_active = false WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

// Platforms API
export const platformsApi = {
  // Get all platforms
  async getAll() {
    const query = `
      SELECT * FROM platforms 
      WHERE is_active = true 
      ORDER BY display_order`;
    
    const result = await pool.query(query);
    return result.rows;
  },

  // Get single platform
  async getById(id) {
    const query = `
      SELECT * FROM platforms 
      WHERE id = $1`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get platforms for a test type
  async getForTestType(testTypeId) {
    const query = `
      SELECT p.*, tp.is_default
      FROM platforms p
      JOIN test_type_platforms tp ON p.id = tp.platform_id
      WHERE tp.test_type_id = $1 AND p.is_active = true
      ORDER BY p.display_order`;
    
    const result = await pool.query(query, [testTypeId]);
    return result.rows;
  },

  // Create platform
  async create(platform) {
    const { id, name, description, icon_name, color, display_order } = platform;
    
    const query = `
      INSERT INTO platforms (id, name, description, icon_name, color, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    
    const result = await pool.query(query, [
      id, name, description, icon_name, color, display_order || 0
    ]);
    return result.rows[0];
  },

  // Update platform
  async update(id, updates) {
    const { name, description, icon_name, color, display_order, is_active } = updates;
    
    const query = `
      UPDATE platforms 
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          icon_name = COALESCE($4, icon_name),
          color = COALESCE($5, color),
          display_order = COALESCE($6, display_order),
          is_active = COALESCE($7, is_active)
      WHERE id = $1
      RETURNING *`;
    
    const result = await pool.query(query, [
      id, name, description, icon_name, color, display_order, is_active
    ]);
    return result.rows[0];
  },

  // Delete platform (soft delete)
  async delete(id) {
    const query = 'UPDATE platforms SET is_active = false WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

// Experiments API
export const experimentsApi = {
  // Get all experiments
  async getAll(filters = {}) {
    let query = `
      SELECT e.*, 
        t.name as test_type_name,
        t.short_name as test_type_short,
        p.name as platform_name,
        p.icon_name as platform_icon
      FROM experiments e
      JOIN test_types t ON e.test_type_id = t.id
      JOIN platforms p ON e.platform_id = p.id
      WHERE 1=1`;
    
    const params = [];
    let paramCount = 0;
    
    if (filters.status) {
      params.push(filters.status);
      query += ` AND e.status = $${++paramCount}`;
    }
    
    if (filters.product_id) {
      params.push(filters.product_id);
      query += ` AND e.product_id = $${++paramCount}`;
    }
    
    if (filters.start_date) {
      params.push(filters.start_date);
      query += ` AND e.start_date >= $${++paramCount}`;
    }
    
    if (filters.end_date) {
      params.push(filters.end_date);
      query += ` AND e.end_date <= $${++paramCount}`;
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get single experiment with full details
  async getById(id) {
    const experimentQuery = `
      SELECT e.*, 
        t.name as test_type_name,
        t.short_name as test_type_short,
        p.name as platform_name,
        p.icon_name as platform_icon
      FROM experiments e
      JOIN test_types t ON e.test_type_id = t.id
      JOIN platforms p ON e.platform_id = p.id
      WHERE e.id = $1`;
    
    const resultsQuery = `
      SELECT * FROM experiment_results
      WHERE experiment_id = $1
      ORDER BY metric_date, variant, metric_name`;
    
    const [experimentResult, resultsResult] = await Promise.all([
      pool.query(experimentQuery, [id]),
      pool.query(resultsQuery, [id])
    ]);
    
    if (experimentResult.rows.length === 0) {
      return null;
    }
    
    return {
      ...experimentResult.rows[0],
      results: resultsResult.rows
    };
  },

  // Create experiment
  async create(experiment) {
    const {
      name, description, test_type_id, platform_id, product_id,
      variant_a_name, variant_a_description, variant_b_name, variant_b_description,
      hypothesis, success_metrics, target_audience, budget,
      start_date, end_date, status, created_by
    } = experiment;
    
    const query = `
      INSERT INTO experiments (
        name, description, test_type_id, platform_id, product_id,
        variant_a_name, variant_a_description, variant_b_name, variant_b_description,
        hypothesis, success_metrics, target_audience, budget,
        start_date, end_date, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`;
    
    const result = await pool.query(query, [
      name, description, test_type_id, platform_id, product_id,
      variant_a_name, variant_a_description, variant_b_name, variant_b_description,
      hypothesis, success_metrics, target_audience, budget,
      start_date, end_date, status || 'draft', created_by
    ]);
    
    return result.rows[0];
  },

  // Update experiment
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(id);
    const query = `
      UPDATE experiments 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete experiment
  async delete(id) {
    const query = 'DELETE FROM experiments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Push experiment to evaluation
  async pushToEvaluation(id) {
    const query = `
      UPDATE experiments 
      SET pushed_to_evaluation = true, 
          evaluation_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

// Experiment Results API
export const experimentResultsApi = {
  // Save result metric
  async saveMetric(experimentId, metric) {
    const { metric_date, metric_name, variant, metric_value, metric_unit } = metric;
    
    const query = `
      INSERT INTO experiment_results (
        experiment_id, metric_date, metric_name, variant, metric_value, metric_unit
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (experiment_id, metric_date, metric_name, variant)
      DO UPDATE SET 
        metric_value = EXCLUDED.metric_value,
        metric_unit = EXCLUDED.metric_unit
      RETURNING *`;
    
    const result = await pool.query(query, [
      experimentId, metric_date, metric_name, variant, metric_value, metric_unit
    ]);
    
    return result.rows[0];
  },

  // Get results for date range
  async getForDateRange(experimentId, startDate, endDate) {
    const query = `
      SELECT * FROM experiment_results
      WHERE experiment_id = $1 
        AND metric_date >= $2 
        AND metric_date <= $3
      ORDER BY metric_date, variant, metric_name`;
    
    const result = await pool.query(query, [experimentId, startDate, endDate]);
    return result.rows;
  },

  // Delete result
  async deleteMetric(id) {
    const query = 'DELETE FROM experiment_results WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

// Creative Scores API
export const creativeScoresApi = {
  // Get all scores with filters
  async getAll(filters = {}) {
    let query = `
      SELECT cs.*, 
        t.name as test_type_name,
        t.short_name as test_type_short,
        p.name as platform_name,
        p.icon_name as platform_icon,
        e.name as experiment_name
      FROM creative_scores cs
      JOIN test_types t ON cs.test_type_id = t.id
      JOIN platforms p ON cs.platform_id = p.id
      LEFT JOIN experiments e ON cs.experiment_id = e.id
      WHERE 1=1`;
    
    const params = [];
    let paramCount = 0;
    
    if (filters.product_id) {
      params.push(filters.product_id);
      query += ` AND cs.product_id = $${++paramCount}`;
    }
    
    if (filters.test_type_id) {
      params.push(filters.test_type_id);
      query += ` AND cs.test_type_id = $${++paramCount}`;
    }
    
    if (filters.platform_id) {
      params.push(filters.platform_id);
      query += ` AND cs.platform_id = $${++paramCount}`;
    }
    
    if (filters.start_date) {
      params.push(filters.start_date);
      query += ` AND cs.evaluation_date >= $${++paramCount}`;
    }
    
    if (filters.end_date) {
      params.push(filters.end_date);
      query += ` AND cs.evaluation_date <= $${++paramCount}`;
    }
    
    query += ' ORDER BY cs.evaluation_date DESC, cs.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get score by unique key
  async getScore(productId, testTypeId, platformId, evaluationDate) {
    const query = `
      SELECT cs.*, 
        t.name as test_type_name,
        p.name as platform_name
      FROM creative_scores cs
      JOIN test_types t ON cs.test_type_id = t.id
      JOIN platforms p ON cs.platform_id = p.id
      WHERE cs.product_id = $1 
        AND cs.test_type_id = $2 
        AND cs.platform_id = $3 
        AND cs.evaluation_date = $4`;
    
    const result = await pool.query(query, [productId, testTypeId, platformId, evaluationDate]);
    return result.rows[0];
  },

  // Save or update score
  async saveScore(score) {
    const {
      product_id, test_type_id, platform_id, evaluation_date,
      score: scoreValue, performance_report, media_buyer_review,
      experiment_id, evaluator_id,
      impressions, clicks, conversions, spend, revenue,
      ctr, cvr, cpc, cpa, roas
    } = score;
    
    const query = `
      INSERT INTO creative_scores (
        product_id, test_type_id, platform_id, evaluation_date,
        score, performance_report, media_buyer_review,
        experiment_id, evaluator_id,
        impressions, clicks, conversions, spend, revenue,
        ctr, cvr, cpc, cpa, roas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (product_id, test_type_id, platform_id, evaluation_date)
      DO UPDATE SET 
        score = EXCLUDED.score,
        performance_report = EXCLUDED.performance_report,
        media_buyer_review = EXCLUDED.media_buyer_review,
        experiment_id = COALESCE(EXCLUDED.experiment_id, creative_scores.experiment_id),
        evaluator_id = EXCLUDED.evaluator_id,
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        spend = EXCLUDED.spend,
        revenue = EXCLUDED.revenue,
        ctr = EXCLUDED.ctr,
        cvr = EXCLUDED.cvr,
        cpc = EXCLUDED.cpc,
        cpa = EXCLUDED.cpa,
        roas = EXCLUDED.roas,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`;
    
    const result = await pool.query(query, [
      product_id, test_type_id, platform_id, evaluation_date,
      scoreValue, performance_report, media_buyer_review,
      experiment_id, evaluator_id,
      impressions, clicks, conversions, spend, revenue,
      ctr, cvr, cpc, cpa, roas
    ]);
    
    return result.rows[0];
  },

  // Delete score
  async deleteScore(id) {
    const query = 'DELETE FROM creative_scores WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Get performance metrics for a product
  async getProductMetrics(productId, startDate, endDate) {
    const query = `
      SELECT 
        test_type_id,
        platform_id,
        COUNT(*) as evaluation_count,
        AVG(score) as avg_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(spend) as total_spend,
        SUM(revenue) as total_revenue,
        AVG(ctr) as avg_ctr,
        AVG(cvr) as avg_cvr,
        AVG(cpc) as avg_cpc,
        AVG(cpa) as avg_cpa,
        AVG(roas) as avg_roas
      FROM creative_scores
      WHERE product_id = $1
        AND evaluation_date >= $2
        AND evaluation_date <= $3
      GROUP BY test_type_id, platform_id`;
    
    const result = await pool.query(query, [productId, startDate, endDate]);
    return result.rows;
  }
};

// Export all APIs
export default {
  testTypes: testTypesApi,
  platforms: platformsApi,
  experiments: experimentsApi,
  experimentResults: experimentResultsApi,
  creativeScores: creativeScoresApi
};