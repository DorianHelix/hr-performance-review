const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (admin.html)
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./database.db');

// Create tables if they don't exist
db.serialize(() => {
  // Employees table - for HR management
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      employee_id TEXT,
      division TEXT,
      squad TEXT,
      team TEXT,
      role TEXT,
      seniority TEXT,
      birthday TEXT,
      start_date TEXT,
      exit_date TEXT,
      net_salary REAL,
      gross_salary REAL,
      total_salary REAL,
      manager_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table - for product management
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shopify_id TEXT UNIQUE,
      name TEXT NOT NULL,
      handle TEXT,
      sku TEXT,
      vendor TEXT,
      product_type TEXT,
      category TEXT,
      description TEXT,
      description_html TEXT,
      price REAL,
      compare_at_price REAL,
      cost REAL,
      inventory_quantity INTEGER,
      min_stock INTEGER,
      status TEXT DEFAULT 'active',
      supplier TEXT,
      tags TEXT,
      images TEXT,
      featured_image TEXT,
      seo_title TEXT,
      seo_description TEXT,
      weight REAL,
      weight_unit TEXT,
      requires_shipping BOOLEAN,
      has_variants BOOLEAN,
      variants_count INTEGER,
      total_inventory INTEGER,
      source TEXT,
      shopify_created_at DATETIME,
      shopify_updated_at DATETIME,
      last_synced_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Scores table
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_id TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      score INTEGER NOT NULL,
      performance_report TEXT,
      media_buyer_review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_id, date, category)
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      accent TEXT,
      tag TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Product variants table
  db.run(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      shopify_variant_id TEXT,
      title TEXT,
      sku TEXT,
      barcode TEXT,
      position INTEGER,
      option1 TEXT,
      option2 TEXT,
      option3 TEXT,
      price REAL,
      compare_at_price REAL,
      cost REAL,
      inventory_quantity INTEGER,
      inventory_item_id TEXT,
      weight REAL,
      weight_unit TEXT,
      available BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Product performance table
  db.run(`
    CREATE TABLE IF NOT EXISTS product_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      date TEXT NOT NULL,
      revenue REAL,
      units_sold INTEGER,
      orders_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Product scores table
  db.run(`
    CREATE TABLE IF NOT EXISTS product_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      score_type TEXT,
      score_value REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Shopify sync log table
  db.run(`
    CREATE TABLE IF NOT EXISTS shopify_sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_type TEXT,
      status TEXT,
      records_processed INTEGER,
      records_created INTEGER,
      records_failed INTEGER,
      error_message TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  console.log('✅ Database tables created/verified');
});

// API Routes

// === EMPLOYEE ROUTES ===

// Get all employees
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create employee
app.post('/api/employees', (req, res) => {
  const { id, name, employee_id, division, squad, team, role, seniority, birthday, start_date, exit_date, net_salary, gross_salary, total_salary, manager_id } = req.body;
  
  db.run(
    `INSERT INTO employees (id, name, employee_id, division, squad, team, role, seniority, birthday, start_date, exit_date, net_salary, gross_salary, total_salary, manager_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, employee_id, division, squad, team, role, seniority, birthday, start_date, exit_date, net_salary, gross_salary, total_salary, manager_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, division, squad, team, role });
    }
  );
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, employee_id, division, squad, team, role, seniority, birthday, start_date, exit_date, net_salary, gross_salary, total_salary, manager_id } = req.body;
  
  db.run(
    `UPDATE employees 
     SET name = ?, employee_id = ?, division = ?, squad = ?, team = ?, role = ?, seniority = ?, birthday = ?, start_date = ?, exit_date = ?, net_salary = ?, gross_salary = ?, total_salary = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, employee_id, division, squad, team, role, seniority, birthday, start_date, exit_date, net_salary, gross_salary, total_salary, manager_id, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, division, squad, team, role });
    }
  );
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  
  // Delete scores first
  db.run('DELETE FROM scores WHERE entity_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete employee
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: true });
    });
  });
});

// === PRODUCT ROUTES ===

// Get all products
app.get('/api/products', (req, res) => {
  const { source } = req.query; // Filter by source if provided
  
  let query = `
    SELECT 
      p.*,
      COUNT(v.id) as variant_count,
      SUM(v.inventory_quantity) as total_variant_stock
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
    WHERE 1=1
  `;
  
  const params = [];
  if (source) {
    query += ' AND p.source = ?';
    params.push(source);
  }
  
  query += ' GROUP BY p.id ORDER BY p.name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Transform for frontend compatibility
    const products = rows.map(row => ({
      id: row.id,
      shopifyId: row.shopify_id,
      name: row.name,
      handle: row.handle,
      sku: row.sku,
      vendor: row.vendor,
      type: row.product_type,
      status: row.status,
      price: row.price,
      comparePrice: row.compare_at_price,
      cost: row.cost,
      stock: row.inventory_quantity,
      totalStock: row.total_inventory || row.inventory_quantity,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      images: row.images ? JSON.parse(row.images) : [],
      featuredImage: row.featured_image,
      description: row.description,
      variants: [], // Return empty array for now, will load separately if needed
      variantsCount: row.variants_count || 1,
      hasVariants: row.has_variants,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastSyncedAt: row.last_synced_at
    }));
    
    res.json(products);
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert snake_case to camelCase for frontend
    const product = row ? {
      ...row,
      minStock: row.min_stock
    } : null;
    res.json(product);
  });
});

// Create product
app.post('/api/products', (req, res) => {
  const { id, name, sku, category, description, price, stock, minStock, status, supplier } = req.body;
  const min_stock = minStock; // Convert camelCase to snake_case for database
  
  db.run(
    `INSERT INTO products (id, name, sku, category, description, price, stock, min_stock, status, supplier) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, sku, category, description, price || 0, stock || 0, min_stock || 0, status || 'active', supplier],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, category, sku });
    }
  );
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, sku, category, description, price, stock, minStock, status, supplier } = req.body;
  const min_stock = minStock; // Convert camelCase to snake_case for database
  
  db.run(
    `UPDATE products 
     SET name = ?, sku = ?, category = ?, description = ?, price = ?, stock = ?, min_stock = ?, status = ?, supplier = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, sku, category, description, price, stock, min_stock, status, supplier, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, category, sku });
    }
  );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  // Delete scores first (if product has scores)
  db.run('DELETE FROM scores WHERE entity_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete product
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: true });
    });
  });
});

// Delete all products
app.delete('/api/products', (req, res) => {
  const { source } = req.query; // Optional: delete only products from specific source
  
  let query = 'DELETE FROM products';
  const params = [];
  
  if (source) {
    query += ' WHERE source = ?';
    params.push(source);
  }
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Also delete orphaned variants
    db.run('DELETE FROM product_variants WHERE product_id NOT IN (SELECT id FROM products)', (varErr) => {
      if (varErr) {
        console.error('Error cleaning up variants:', varErr);
      }
    });
    
    res.json({ 
      deleted: true, 
      count: this.changes,
      message: `Deleted ${this.changes} products from database` 
    });
  });
});

// === SCORE ROUTES ===

// Get scores for date range
app.get('/api/scores', (req, res) => {
  const { entity_id, employee_id, start_date, end_date } = req.query;
  
  let query = 'SELECT * FROM scores WHERE 1=1';
  const params = [];
  
  // Support both entity_id and employee_id for backward compatibility
  const id = entity_id || employee_id;
  if (id) {
    query += ' AND entity_id = ?';
    params.push(id);
  }
  
  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date.replace(/-/g, ''));
  }
  
  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date.replace(/-/g, ''));
  }
  
  query += ' ORDER BY date DESC, category';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Save score
app.post('/api/scores', (req, res) => {
  const { entity_id, employee_id, date, category, score, performance_report, media_buyer_review } = req.body;
  
  // Support both entity_id and employee_id for backward compatibility
  const id = entity_id || employee_id;
  
  db.run(
    `INSERT OR REPLACE INTO scores (entity_id, date, category, score, performance_report, media_buyer_review) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, date, category, score, performance_report, media_buyer_review],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        entity_id: id,
        date,
        category,
        score
      });
    }
  );
});

// Delete score by entity_id (new preferred route)
app.delete('/api/scores/:entity_id/:date/:category', (req, res) => {
  const { entity_id, date, category } = req.params;
  
  db.run(
    'DELETE FROM scores WHERE entity_id = ? AND date = ? AND category = ?',
    [entity_id, date, category],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: true });
    }
  );
});

// Backward compatibility route for employee_id
app.delete('/api/scores/employee/:employee_id/:date/:category', (req, res) => {
  const { employee_id, date, category } = req.params;
  
  db.run(
    'DELETE FROM scores WHERE entity_id = ? AND date = ? AND category = ?',
    [employee_id, date, category],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: true });
    }
  );
});

// Get categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Save categories
app.post('/api/categories', (req, res) => {
  const categories = req.body;
  
  // Clear existing categories
  db.run('DELETE FROM categories', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert new categories
    const stmt = db.prepare(
      'INSERT INTO categories (key, label, icon, color, accent, tag) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    categories.forEach(cat => {
      stmt.run(cat.key, cat.label, cat.icon, cat.color, cat.accent, cat.tag);
    });
    
    stmt.finalize();
    res.json({ success: true });
  });
});

// Migrate data from localStorage endpoint
app.post('/api/migrate', (req, res) => {
  const { employees, scores, categories } = req.body;
  
  let migrated = { employees: 0, scores: 0, categories: 0 };
  
  // Migrate employees
  if (employees && employees.length > 0) {
    const empStmt = db.prepare(
      `INSERT OR REPLACE INTO employees (id, name, employee_id, division, squad, team, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    
    employees.forEach(emp => {
      empStmt.run(emp.id, emp.name, emp.employee_id, emp.division, emp.squad, emp.team, emp.role);
      migrated.employees++;
    });
    
    empStmt.finalize();
  }
  
  // Migrate scores
  if (scores && Object.keys(scores).length > 0) {
    const scoreStmt = db.prepare(
      `INSERT OR REPLACE INTO scores (entity_id, date, category, score, performance_report, media_buyer_review) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    
    Object.keys(scores).forEach(empId => {
      const empScores = scores[empId];
      Object.keys(empScores).forEach(date => {
        const dayScores = empScores[date];
        Object.keys(dayScores).forEach(cat => {
          const scoreData = dayScores[cat];
          if (scoreData && scoreData.score) {
            scoreStmt.run(
              empId, 
              date, 
              cat, 
              scoreData.score, 
              scoreData.performanceReport || '', 
              scoreData.mediaBuyerReview || ''
            );
            migrated.scores++;
          }
        });
      });
    });
    
    scoreStmt.finalize();
  }
  
  // Migrate categories
  if (categories && categories.length > 0) {
    db.run('DELETE FROM categories', () => {
      const catStmt = db.prepare(
        'INSERT INTO categories (key, label, icon, color, accent, tag) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      categories.forEach(cat => {
        catStmt.run(cat.key, cat.label, cat.icon, cat.color, cat.accent, cat.tag);
        migrated.categories++;
      });
      
      catStmt.finalize();
    });
  }
  
  res.json({ 
    success: true, 
    migrated 
  });
});

// Get test categories from frontend (hardcoded for now)
app.get('/api/test-categories', (req, res) => {
  const testCategories = [
    { 
      id: "test-1",
      key: "VCT", 
      label: "Video Creative Test", 
      short: "VCT", 
      description: "Video creative performance testing"
    },
    { 
      id: "test-2",
      key: "SCT", 
      label: "Static Creative Test", 
      short: "SCT", 
      description: "Static creative performance testing"
    },
    { 
      id: "test-3",
      key: "ACT", 
      label: "Ad Copy Test", 
      short: "ACT", 
      description: "Ad copy effectiveness testing"
    }
  ];
  res.json(testCategories);
});

// === SHOPIFY API ROUTES ===

// Test Shopify connection
app.post('/api/shopify/test', async (req, res) => {
  const { storeDomain, accessToken } = req.body;
  
  if (!storeDomain || !accessToken) {
    return res.status(400).json({ error: 'Store domain and access token are required' });
  }
  
  try {
    const shopifyUrl = `https://${storeDomain}.myshopify.com/admin/api/2024-01/shop.json`;
    const response = await fetch(shopifyUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ 
        error: 'Failed to connect to Shopify', 
        details: error,
        status: response.status 
      });
    }
    
    const data = await response.json();
    res.json({ 
      success: true, 
      shop: {
        name: data.shop.name,
        domain: data.shop.domain,
        email: data.shop.email,
        currency: data.shop.currency,
        timezone: data.shop.timezone
      }
    });
  } catch (error) {
    console.error('Shopify connection test error:', error);
    res.status(500).json({ error: 'Failed to connect to Shopify', details: error.message });
  }
});

// Fetch products from Shopify with all available fields
app.post('/api/shopify/products', async (req, res) => {
  const { storeDomain, accessToken, saveToDb = false } = req.body;
  
  if (!storeDomain || !accessToken) {
    return res.status(400).json({ error: 'Store domain and access token are required' });
  }
  
  try {
    // First, save the settings to database if saveToDb is true
    if (saveToDb) {
      // Save store domain
      db.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        ['shopify_store_domain', storeDomain],
        (err) => {
          if (err) console.error('Error saving store domain:', err);
        }
      );
      
      // Save access token (encrypted in production)
      db.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
        ['shopify_access_token', accessToken],
        (err) => {
          if (err) console.error('Error saving access token:', err);
        }
      );
    }
    
    let allProducts = [];
    let hasNextPage = true;
    let pageInfo = null;
    const pageSize = 250; // Maximum allowed by Shopify
    
    console.log('Starting to fetch all products from Shopify...');
    
    // Fetch all products using pagination
    while (hasNextPage) {
      let url;
      if (pageInfo) {
        // Use cursor-based pagination for subsequent pages
        url = `https://${storeDomain}.myshopify.com/admin/api/2024-01/products.json?limit=${pageSize}&page_info=${pageInfo}`;
      } else {
        // First page
        url = `https://${storeDomain}.myshopify.com/admin/api/2024-01/products.json?limit=${pageSize}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ 
          error: 'Failed to fetch products from Shopify', 
          details: error,
          status: response.status 
        });
      }
      
      const data = await response.json();
      allProducts = allProducts.concat(data.products);
      
      // Check for next page in Link header
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        // Extract page_info from the next link
        const matches = linkHeader.match(/page_info=([^&>]+)/g);
        if (matches && matches.length > 0) {
          // Find the page_info for the "next" relation
          const nextMatch = linkHeader.split(',').find(link => link.includes('rel="next"'));
          if (nextMatch) {
            const pageInfoMatch = nextMatch.match(/page_info=([^&>]+)/);;
            if (pageInfoMatch) {
              pageInfo = pageInfoMatch[1];
            } else {
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
      
      console.log(`Fetched ${data.products.length} products, total so far: ${allProducts.length}`);
    }
    
    console.log(`Total products fetched: ${allProducts.length}`);
    const products = allProducts;
    
    // Fetch inventory item costs for all variants
    // Collect all inventory item IDs
    const inventoryItemIds = [];
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.inventory_item_id) {
            inventoryItemIds.push(variant.inventory_item_id);
          }
        });
      }
    });
    
    // Fetch inventory items in batches (Shopify allows up to 100 at a time)
    const inventoryCosts = {};
    for (let i = 0; i < inventoryItemIds.length; i += 100) {
      const batch = inventoryItemIds.slice(i, i + 100);
      const inventoryUrl = `https://${storeDomain}.myshopify.com/admin/api/2024-01/inventory_items.json?ids=${batch.join(',')}`;
      
      try {
        const invResponse = await fetch(inventoryUrl, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          }
        });
        
        if (invResponse.ok) {
          const invData = await invResponse.json();
          invData.inventory_items.forEach(item => {
            inventoryCosts[item.id] = item.cost || 0;
          });
        }
      } catch (invError) {
        console.error('Error fetching inventory costs:', invError);
        // Continue without costs if this fails
      }
    }
    
    // Add costs to variants
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.inventory_item_id && inventoryCosts[variant.inventory_item_id]) {
            variant.cost = inventoryCosts[variant.inventory_item_id];
          }
        });
      }
    });
    
    // Save products to database if requested
    if (saveToDb) {
      console.log('Saving products to database...');
      let savedCount = 0;
      let errorCount = 0;
      
      // Log sync operation
      db.run(
        `INSERT INTO shopify_sync_log (sync_type, status, records_processed) VALUES (?, ?, ?)`,
        ['products', 'started', products.length]
      );
      
      for (const product of products) {
        try {
          // Calculate aggregate values
          const totalInventory = product.variants ? 
            product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) : 0;
          const minPrice = product.variants ? 
            Math.min(...product.variants.map(v => v.price || 0)) : product.price;
          const primaryVariant = product.variants?.[0] || {};
          
          // Insert or update product
          db.run(
            `INSERT OR REPLACE INTO products (
              shopify_id, name, handle, vendor, product_type, status,
              price, compare_at_price, cost,
              inventory_quantity, category, tags, 
              images, featured_image, description, description_html,
              seo_title, seo_description,
              weight, weight_unit, requires_shipping,
              has_variants, variants_count, total_inventory,
              source, shopify_created_at, shopify_updated_at, last_synced_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
              product.id,
              product.title,
              product.handle,
              product.vendor,
              product.product_type,
              product.status || 'active',
              minPrice,
              primaryVariant.compare_at_price,
              primaryVariant.cost || 0,
              totalInventory,
              product.product_type, // Using product_type as category for now
              JSON.stringify(product.tags || []),
              JSON.stringify(product.images?.map(img => img.src) || []),
              product.image?.src || product.images?.[0]?.src,
              product.body_html,
              product.body_html,
              product.title, // SEO title fallback
              product.body_html?.substring(0, 160), // SEO description fallback
              primaryVariant.weight,
              primaryVariant.weight_unit || 'kg',
              primaryVariant.requires_shipping !== false,
              product.variants?.length > 1,
              product.variants?.length || 1,
              totalInventory,
              'shopify',
              product.created_at,
              product.updated_at
            ],
            function(err) {
              if (err) {
                console.error('Error saving product:', err);
                errorCount++;
              } else {
                const productId = this.lastID;
                
                // Save variants if any
                if (product.variants && product.variants.length > 1) {
                  product.variants.forEach(variant => {
                    db.run(
                      `INSERT OR REPLACE INTO product_variants (
                        product_id, shopify_variant_id, title, sku, barcode, position,
                        option1, option2, option3,
                        price, compare_at_price, cost,
                        inventory_quantity, inventory_item_id,
                        weight, weight_unit, available
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                      [
                        productId,
                        variant.id,
                        variant.title,
                        variant.sku,
                        variant.barcode,
                        variant.position,
                        variant.option1,
                        variant.option2,
                        variant.option3,
                        variant.price,
                        variant.compare_at_price,
                        variant.cost || 0,
                        variant.inventory_quantity || 0,
                        variant.inventory_item_id,
                        variant.weight,
                        variant.weight_unit,
                        variant.available !== false
                      ]
                    );
                  });
                }
                savedCount++;
              }
            }
          );
        } catch (error) {
          console.error('Error processing product:', error);
          errorCount++;
        }
      }
      
      // Update sync log
      setTimeout(() => {
        db.run(
          `UPDATE shopify_sync_log 
           SET status = ?, records_created = ?, records_failed = ?, completed_at = CURRENT_TIMESTAMP 
           WHERE id = (SELECT MAX(id) FROM shopify_sync_log WHERE sync_type = 'products')`,
          ['completed', savedCount, errorCount]
        );
        console.log(`Saved ${savedCount} products to database, ${errorCount} errors`);
      }, 1000);
    }
    
    res.json({ 
      success: true, 
      products: products,
      count: products.length,
      saved: saveToDb
    });
  } catch (error) {
    console.error('Shopify products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Fetch inventory levels from Shopify
app.post('/api/shopify/inventory', async (req, res) => {
  const { storeDomain, accessToken, location_ids = [], inventory_item_ids = [] } = req.body;
  
  if (!storeDomain || !accessToken) {
    return res.status(400).json({ error: 'Store domain and access token are required' });
  }
  
  try {
    let url = `https://${storeDomain}.myshopify.com/admin/api/2024-01/inventory_levels.json?limit=250`;
    
    if (location_ids.length > 0) {
      url += `&location_ids=${location_ids.join(',')}`;
    }
    
    if (inventory_item_ids.length > 0) {
      url += `&inventory_item_ids=${inventory_item_ids.join(',')}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ 
        error: 'Failed to fetch inventory from Shopify', 
        details: error,
        status: response.status 
      });
    }
    
    const data = await response.json();
    res.json({ 
      success: true, 
      inventory_levels: data.inventory_levels,
      count: data.inventory_levels.length
    });
  } catch (error) {
    console.error('Shopify inventory fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory', details: error.message });
  }
});

// === SETTINGS ROUTES ===

// Get all settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert array to object for easier access
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  });
});

// Get single setting
app.get('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  db.get('SELECT * FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.json({ key, value: null });
      return;
    }
    try {
      res.json({ key, value: JSON.parse(row.value) });
    } catch {
      res.json({ key, value: row.value });
    }
  });
});

// Save/update setting
app.post('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  
  db.run(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) 
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [key, valueStr],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ key, value, success: true });
    }
  );
});

// Save multiple settings at once
app.post('/api/settings', (req, res) => {
  const settings = req.body;
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) 
     VALUES (?, ?, CURRENT_TIMESTAMP)`
  );
  
  try {
    Object.keys(settings).forEach(key => {
      const value = typeof settings[key] === 'string' 
        ? settings[key] 
        : JSON.stringify(settings[key]);
      stmt.run(key, value);
    });
    stmt.finalize();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete setting
app.delete('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  
  db.run('DELETE FROM settings WHERE key = ?', [key], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Helix Finance Backend API',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      settings: '/api/settings',
      shopify: '/api/shopify/*',
      admin: '/admin.html'
    }
  });
});

// Admin endpoint - get any table data
app.get('/api/admin/table/:table', (req, res) => {
  const { table } = req.params;
  
  // Whitelist of allowed tables
  const allowedTables = [
    'products', 'product_variants', 'product_performance', 
    'product_scores', 'settings', 'shopify_sync_log', 
    'employees', 'scores', 'categories'
  ];
  
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }
  
  // Special handling for settings which might not be an array
  if (table === 'settings') {
    db.all(`SELECT * FROM settings`, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    });
  } else {
    db.all(`SELECT * FROM ${table} LIMIT 1000`, (err, rows) => {
      if (err) {
        console.error(`Error fetching ${table}:`, err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    });
  }
});

// Clear Shopify credentials only
app.delete('/api/shopify/clear', (req, res) => {
  console.log('Clearing Shopify credentials...');
  
  // Only clear Shopify credentials from settings, keep products and other data
  db.run(`DELETE FROM settings WHERE key IN ('shopify_store_domain', 'shopify_access_token', 'shopify')`, (err) => {
    if (err) {
      console.error('Error clearing Shopify settings:', err);
      return res.status(500).json({ error: 'Failed to clear settings' });
    }
    
    console.log('✅ Shopify credentials cleared successfully');
    res.json({ success: true, message: 'Shopify credentials cleared successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 SQLite database: ./database.db');
  console.log('✨ Ready to handle requests!');
});