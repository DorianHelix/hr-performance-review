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
    const shopifyUrl = `https://${storeDomain}.myshopify.com/admin/api/2024-10/shop.json`;
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
        url = `https://${storeDomain}.myshopify.com/admin/api/2024-10/products.json?limit=${pageSize}&page_info=${pageInfo}`;
      } else {
        // First page
        url = `https://${storeDomain}.myshopify.com/admin/api/2024-10/products.json?limit=${pageSize}`;
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
    'employees', 'scores', 'categories',
    'orders', 'order_items'
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

// === ORDERS API ROUTES ===

// Get all orders with pagination
app.get('/api/orders', (req, res) => {
  // Parse query parameters for pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50; // Default 50 items per page
  const offset = (page - 1) * limit;
  
  // Get search and filter parameters
  const search = req.query.search || '';
  const fulfillmentStatus = req.query.fulfillment_status || '';
  const financialStatus = req.query.financial_status || '';
  const startDate = req.query.start_date || '';
  const endDate = req.query.end_date || '';
  
  // Build WHERE clause for filters
  let whereConditions = [];
  let params = [];
  
  if (search) {
    // Search in orders and line items (case-insensitive)
    whereConditions.push(`(
      LOWER(o.order_number) LIKE LOWER(?) OR 
      LOWER(o.customer_name) LIKE LOWER(?) OR 
      LOWER(o.customer_email) LIKE LOWER(?) OR
      EXISTS (
        SELECT 1 FROM order_items oi 
        WHERE oi.order_id = o.id 
        AND (
          LOWER(oi.name) LIKE LOWER(?) OR 
          LOWER(oi.sku) LIKE LOWER(?) OR 
          LOWER(oi.variant_title) LIKE LOWER(?)
        )
      )
    )`);
    const searchPattern = `%${search}%`;
    // 6 parameters for the search: 3 for orders, 3 for line items
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  if (fulfillmentStatus) {
    whereConditions.push('o.fulfillment_status = ?');
    params.push(fulfillmentStatus);
  }
  
  if (financialStatus) {
    whereConditions.push('o.financial_status = ?');
    params.push(financialStatus);
  }
  
  if (startDate) {
    whereConditions.push('DATE(o.created_at) >= ?');
    params.push(startDate);
  }
  
  if (endDate) {
    whereConditions.push('DATE(o.created_at) <= ?');
    params.push(endDate);
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';
  
  // First, get the total count
  db.get(`
    SELECT COUNT(*) as total 
    FROM orders o 
    ${whereClause}
  `, params, (err, countResult) => {
    if (err) {
      console.error('Error counting orders:', err);
      return res.status(500).json({ error: 'Failed to count orders' });
    }
    
    const totalCount = countResult.total;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Then get paginated orders
    const queryParams = [...params, limit, offset];
    
    db.all(`
      SELECT o.*
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, queryParams, (err, rows) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
      
      // Get order IDs for fetching line items
      const orderIds = rows.map(row => row.id);
      
      // Fetch line items for these orders
      const lineItemsQuery = orderIds.length > 0 ? `
        SELECT * FROM order_items 
        WHERE order_id IN (${orderIds.map(() => '?').join(',')})
      ` : null;
      
      const fetchLineItems = new Promise((resolve) => {
        if (!lineItemsQuery) {
          resolve([]);
          return;
        }
        
        db.all(lineItemsQuery, orderIds, (err, items) => {
          if (err) {
            console.error('Error fetching line items:', err);
            resolve([]);
          } else {
            resolve(items);
          }
        });
      });
      
      fetchLineItems.then(lineItems => {
        // Group line items by order_id
        const lineItemsByOrder = {};
        lineItems.forEach(item => {
          if (!lineItemsByOrder[item.order_id]) {
            lineItemsByOrder[item.order_id] = [];
          }
          lineItemsByOrder[item.order_id].push(item);
        });
        
        // Parse and format orders
        const orders = rows.map(row => {
          const order = { ...row };
          
          // Add line items
          order.lineItems = lineItemsByOrder[order.id] || [];
          
          // Parse JSON fields
          if (order.tags) order.tags = JSON.parse(order.tags || '[]');
          if (order.shipping_address) order.shippingAddress = JSON.parse(order.shipping_address || '{}');
          if (order.billing_address) order.billingAddress = JSON.parse(order.billing_address || '{}');
          
          // Convert snake_case to camelCase for frontend
          order.orderNumber = order.order_number;
          order.customerName = order.customer_name;
          order.customerEmail = order.customer_email;
          order.customerPhone = order.customer_phone;
          order.financialStatus = order.financial_status;
          order.fulfillmentStatus = order.fulfillment_status;
          order.totalPrice = order.total_price;
          order.subtotalPrice = order.subtotal_price;
          order.totalTax = order.total_tax;
          order.totalDiscounts = order.total_discounts;
          order.totalShipping = order.total_shipping;
          order.totalRefunded = order.total_refunded;
          order.customerNote = order.customer_note;
          order.shippingMethod = order.shipping_method;
          order.trackingNumber = order.tracking_number;
          order.createdAt = order.created_at;
          order.processedAt = order.processed_at;
          order.fulfilledAt = order.fulfilled_at;
          order.cancelledAt = order.cancelled_at;
          order.shopifyId = order.shopify_id;
          
          return order;
        });
        
        // Return paginated response with metadata
        res.json({
          orders: orders,
          pagination: {
            page: page,
            limit: limit,
            total: totalCount,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        });
      });
    });
  });
});

// Get order count for a date range
app.get('/api/orders/count', (req, res) => {
  const startDate = req.query.start_date || '';
  const endDate = req.query.end_date || '';
  
  let whereConditions = [];
  let params = [];
  
  if (startDate) {
    whereConditions.push('DATE(created_at) >= ?');
    params.push(startDate);
  }
  
  if (endDate) {
    whereConditions.push('DATE(created_at) <= ?');
    params.push(endDate);
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';
  
  db.get(`
    SELECT COUNT(*) as count 
    FROM orders 
    ${whereClause}
  `, params, (err, result) => {
    if (err) {
      console.error('Error counting orders:', err);
      return res.status(500).json({ error: 'Failed to count orders' });
    }
    
    res.json({ count: result.count || 0 });
  });
});

// Track sync progress (in-memory for simplicity)
let syncProgress = {
  status: 'idle',
  processed: 0,
  total: 0,
  currentBatch: 0,
  totalBatches: 0,
  recentProducts: []
};

// Get sync progress
app.get('/api/orders/sync-progress', (req, res) => {
  res.json(syncProgress);
});

// Sync orders from Shopify
app.post('/api/orders/sync', async (req, res) => {
  const { fullSync = false, start_date, end_date } = req.body; // Accept parameters from request
  
  // Reset sync progress
  syncProgress = {
    status: 'syncing',
    processed: 0,
    total: 0,
    currentBatch: 0,
    totalBatches: 0,
    recentProducts: []
  };
  
  // Get Shopify credentials from settings
  db.all(`SELECT key, value FROM settings WHERE key IN ('shopify_store_domain', 'shopify_access_token')`, async (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get settings' });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    if (!settings.shopify_store_domain || !settings.shopify_access_token) {
      return res.status(400).json({ error: 'Shopify credentials not configured' });
    }
    
    try {
      // Determine sync start date based on sync mode
      let lastOrderDate;
      
      if (start_date) {
        // Use provided start date
        lastOrderDate = new Date(start_date).toISOString();
        console.log(`📅 CUSTOM DATE SYNC - Syncing orders from: ${lastOrderDate}`);
      } else if (fullSync) {
        console.log('🔄 FULL SYNC MODE - Fetching all historical orders');
        // For full sync, don't set a date filter (will get all orders)
        lastOrderDate = null;
      } else {
        // Get the most recent order date to sync incrementally
        lastOrderDate = await new Promise((resolve) => {
          db.get('SELECT MAX(created_at) as last_date FROM orders', (err, row) => {
            if (err || !row || !row.last_date) {
              // If no orders exist, sync last 30 days only
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              resolve(thirtyDaysAgo.toISOString());
            } else {
              // Sync from the last order date (subtract 1 day for overlap)
              const lastDate = new Date(row.last_date);
              lastDate.setDate(lastDate.getDate() - 1);
              resolve(lastDate.toISOString());
            }
          });
        });
        console.log(`📈 INCREMENTAL SYNC MODE - Syncing orders created after: ${lastOrderDate}`);
      }
      
      let allOrders = [];
      let hasNextPage = true;
      let pageInfo = null;
      const pageSize = 50; // Reduced from 250 to avoid rate limits
      let savedCount = 0;
      let skippedCount = 0;
      let pageCount = 0;
      const maxPages = fullSync ? 100 : 20; // More pages for full sync
      let consecutiveDuplicates = 0; // Track consecutive duplicates
      
      console.log('Starting to fetch orders from Shopify...');
      
      // Helper function to wait
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Helper function to save order to database
      const saveOrderToDatabase = (order) => {
        return new Promise((resolve, reject) => {
          // First check if order already exists
          db.get('SELECT id FROM orders WHERE shopify_id = ?', [order.id], (err, existingOrder) => {
            if (err) {
              console.error('Error checking existing order:', err);
              resolve(false); // Return false for error
              return;
            }
            
            if (existingOrder) {
              // Order already exists, skip
              skippedCount++;
              resolve(false); // Return false for duplicate
              return;
            }
            
            // Use INSERT to add new order
            db.run(`
              INSERT INTO orders (
                shopify_id, order_number, customer_name, customer_email, customer_phone,
                financial_status, fulfillment_status, total_price, subtotal_price,
                total_tax, total_discounts, total_shipping, total_refunded,
                currency, note, customer_note, tags, source, channel,
                shipping_address, billing_address, shipping_method,
                tracking_number, carrier, created_at, processed_at,
                fulfilled_at, cancelled_at, synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `, [
            order.id,
            order.order_number || order.name,
            order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : null,
            order.customer ? order.customer.email : order.email,
            order.customer ? order.customer.phone : order.phone,
            order.financial_status,
            order.fulfillment_status,
            parseFloat(order.total_price || 0),
            parseFloat(order.subtotal_price || 0),
            parseFloat(order.total_tax || 0),
            parseFloat(order.total_discounts || 0),
            parseFloat(order.total_shipping_price_set ? order.total_shipping_price_set.shop_money.amount : 0),
            order.refunds ? order.refunds.reduce((sum, r) => sum + parseFloat(r.total_duties_set ? r.total_duties_set.shop_money.amount : 0), 0) : 0,
            order.currency,
            order.note,
            order.note_attributes ? JSON.stringify(order.note_attributes) : null,
            order.tags ? JSON.stringify(order.tags ? order.tags.split(',').map(t => t.trim()) : []) : '[]',
            order.source_name,
            order.source_identifier,
            order.shipping_address ? JSON.stringify(order.shipping_address) : null,
            order.billing_address ? JSON.stringify(order.billing_address) : null,
            order.shipping_lines && order.shipping_lines[0] ? order.shipping_lines[0].title : null,
            order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].tracking_number : null,
            order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].tracking_company : null,
            order.created_at,
            order.processed_at,
            order.fulfillments && order.fulfillments[0] ? order.fulfillments[0].created_at : null,
            order.cancelled_at
          ], function(err) {
            if (err) {
              console.error('Error saving order:', err);
              resolve(false); // Return false for error
              return;
            }
            
            const orderId = this.lastID;
            savedCount++;
            
            // Only save line items if we actually inserted a new order
            if (orderId && order.line_items && order.line_items.length > 0) {
              let itemsToSave = order.line_items.length;
              let itemsSaved = 0;
              
              order.line_items.forEach(item => {
                db.run(`
                  INSERT OR IGNORE INTO order_items (
                    order_id, shopify_id, product_id, variant_id,
                    name, variant_title, sku, quantity, price, cost,
                    total_discount, fulfillment_status, image
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  orderId,
                  item.id,
                  item.product_id,
                  item.variant_id,
                  item.name,
                  item.variant_title,
                  item.sku,
                  item.quantity,
                  parseFloat(item.price || 0),
                  0, // Cost would need to be fetched from product data
                  parseFloat(item.total_discount || 0),
                  item.fulfillment_status,
                  item.product_exists && item.image ? item.image.src : null
                ], (err) => {
                  if (err) console.error('Error saving line item:', err);
                  itemsSaved++;
                  if (itemsSaved === itemsToSave) {
                    resolve(true); // Return true for success with items
                  }
                  });
                });
              } else {
                resolve(true); // Return true for success without items
              }
            });
          });
        });
      };
      
      // Fetch all orders using pagination with rate limiting
      while (hasNextPage && pageCount < maxPages) {
        pageCount++;
        let url;
        if (pageInfo) {
          // page_info cannot be used with other parameters except limit
          url = `https://${settings.shopify_store_domain}.myshopify.com/admin/api/2024-10/orders.json?limit=${pageSize}&page_info=${pageInfo}`;
        } else {
          // First page can use status and created_at_min parameters
          if (lastOrderDate) {
            url = `https://${settings.shopify_store_domain}.myshopify.com/admin/api/2024-10/orders.json?limit=${pageSize}&status=any&created_at_min=${lastOrderDate}`;
          } else {
            // Full sync - no date filter
            url = `https://${settings.shopify_store_domain}.myshopify.com/admin/api/2024-10/orders.json?limit=${pageSize}&status=any`;
          }
        }
        
        const response = await fetch(url, {
          headers: {
            'X-Shopify-Access-Token': settings.shopify_access_token,
            'Content-Type': 'application/json'
          }
        });
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await wait(waitTime);
          continue; // Retry the same request
        }
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Shopify API Error:', response.status, error);
          
          // Check for specific error types
          if (response.status === 403) {
            return res.status(403).json({ 
              error: 'Access denied. Please check your Shopify access token has the "read_orders" scope.', 
              details: error,
              requiredScopes: ['read_orders', 'read_customers']
            });
          }
          
          return res.status(response.status).json({ 
            error: 'Failed to fetch from Shopify', 
            details: error 
          });
        }
        
        const data = await response.json();
        
        // Update sync progress
        syncProgress.currentBatch = pageCount;
        syncProgress.totalBatches = maxPages;
        syncProgress.total += data.orders.length;
        
        // Save this batch of orders immediately
        console.log(`Saving batch of ${data.orders.length} orders to database...`);
        let batchSaved = 0;
        let batchSkipped = 0;
        
        // Extract product information for visualization
        const batchProducts = [];
        
        for (const order of data.orders) {
          // Extract products from line items
          if (order.line_items) {
            order.line_items.forEach(item => {
              // Get image URL from various possible sources
              let imageUrl = null;
              if (item.product_exists && item.image && item.image.src) {
                imageUrl = item.image.src;
              } else if (item.properties) {
                const imageProp = item.properties.find(p => p.name === '_image');
                if (imageProp) imageUrl = imageProp.value;
              }
              
              batchProducts.push({
                id: item.product_id,
                title: item.title || item.name,
                name: item.title || item.name,
                sku: item.sku,
                vendor: item.vendor,
                price: parseFloat(item.price),
                quantity: item.quantity,
                image: imageUrl,
                thumbnail: imageUrl // Add thumbnail field too
              });
            });
          }
          
          const result = await saveOrderToDatabase(order);
          if (result) {
            batchSaved++;
            syncProgress.processed++;
          } else {
            batchSkipped++;
          }
        }
        
        // Update recent products for visualization
        syncProgress.recentProducts = batchProducts.slice(0, 50); // Keep only last 50 products
        
        // Update consecutive duplicates counter
        if (batchSaved === 0 && batchSkipped > 0) {
          consecutiveDuplicates += batchSkipped;
        } else {
          consecutiveDuplicates = 0; // Reset if we saved any new orders
        }
        
        allOrders = allOrders.concat(data.orders);
        
        // Check for pagination
        const linkHeader = response.headers.get('link');
        if (linkHeader && linkHeader.includes('rel="next"')) {
          // Shopify Link header format: <url>; rel="next", <url>; rel="previous"
          const links = linkHeader.split(',');
          const nextLink = links.find(link => link.includes('rel="next"'));
          if (nextLink) {
            const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
            pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
            hasNextPage = pageInfo !== null;
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
        
        console.log(`Page ${pageCount}: Fetched ${data.orders.length} orders | Total fetched: ${allOrders.length} | Saved: ${savedCount} | Skipped (duplicates): ${skippedCount}`);
        
        // Stop early if we're only finding duplicates (optimization) - but not for full sync
        if (!fullSync && consecutiveDuplicates >= 100) {
          console.log('🛑 Stopping sync early - only finding duplicates (100+ consecutive)');
          hasNextPage = false;
        }
        
        // Add a small delay between requests to avoid rate limiting
        if (hasNextPage) {
          await wait(500); // Wait 500ms between requests
        }
      }
      
      if (pageCount >= maxPages) {
        console.log(`⚠️ Reached maximum page limit (${maxPages}). Stopping to prevent infinite loop.`);
      }
      console.log(`✅ Sync completed! Total fetched: ${allOrders.length} | Saved: ${savedCount} | Skipped: ${skippedCount}`);
      
      // Update sync progress to completed
      syncProgress.status = 'completed';
      syncProgress.total = allOrders.length;
      syncProgress.processed = savedCount;
      
      // Return the orders
      db.all(`
        SELECT 
          o.*,
          GROUP_CONCAT(
            json_object(
              'id', oi.id,
              'shopify_id', oi.shopify_id,
              'product_id', oi.product_id,
              'variant_id', oi.variant_id,
              'name', oi.name,
              'variant_title', oi.variant_title,
              'sku', oi.sku,
              'quantity', oi.quantity,
              'price', oi.price,
              'cost', oi.cost,
              'fulfillment_status', oi.fulfillment_status,
              'image', oi.image
            )
          ) as line_items_json
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch saved orders' });
        }
        
        // Parse line items JSON
        const orders = rows.map(row => {
          const order = { ...row };
          if (order.line_items_json) {
            try {
              order.lineItems = order.line_items_json.split(',').map(item => JSON.parse(item));
            } catch (e) {
              order.lineItems = [];
            }
            delete order.line_items_json;
          } else {
            order.lineItems = [];
          }
          
          // Parse JSON fields
          if (order.tags) order.tags = JSON.parse(order.tags || '[]');
          if (order.shipping_address) order.shippingAddress = JSON.parse(order.shipping_address || '{}');
          if (order.billing_address) order.billingAddress = JSON.parse(order.billing_address || '{}');
          
          // Convert snake_case to camelCase
          order.orderNumber = order.order_number;
          order.customerName = order.customer_name;
          order.customerEmail = order.customer_email;
          order.customerPhone = order.customer_phone;
          order.financialStatus = order.financial_status;
          order.fulfillmentStatus = order.fulfillment_status;
          order.totalPrice = order.total_price;
          order.subtotalPrice = order.subtotal_price;
          order.totalTax = order.total_tax;
          order.totalDiscounts = order.total_discounts;
          order.totalShipping = order.total_shipping;
          order.totalRefunded = order.total_refunded;
          order.customerNote = order.customer_note;
          order.shippingMethod = order.shipping_method;
          order.trackingNumber = order.tracking_number;
          order.createdAt = order.created_at;
          order.processedAt = order.processed_at;
          order.fulfilledAt = order.fulfilled_at;
          order.cancelledAt = order.cancelled_at;
          order.shopifyId = order.shopify_id;
          
          return order;
        });
        
        res.json({ 
          success: true, 
          count: savedCount,
          orders: orders
        });
      });
      
    } catch (error) {
      console.error('Error syncing orders:', error);
      syncProgress.status = 'error';
      res.status(500).json({ error: 'Failed to sync orders', message: error.message });
    }
  });
});

// Delete all orders
app.delete('/api/orders', (req, res) => {
  db.run('DELETE FROM order_items', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete order items' });
    }
    
    db.run('DELETE FROM orders', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete orders' });
      }
      
      res.json({ success: true, message: 'All orders deleted' });
    });
  });
});

// === PRODUCT PERFORMANCE ROUTES ===

// Sync product performance from orders
app.post('/api/product-performance/sync', async (req, res) => {
  console.log('Starting product performance sync...');
  
  try {
    // Clear existing performance data
    db.run('DELETE FROM product_performance', (err) => {
      if (err) console.error('Error clearing product_performance:', err);
    });
    
    // Calculate performance from orders and order_items
    // CRITICAL: Understanding the price structure:
    // - Our DB: oi.price is GROSS (includes 27% VAT)
    // - Shopify: Reports NET sales (without VAT) + Taxes = Total Sales
    // - Discounts: Both o.total_discounts and o.subtotal_price are NET (without VAT)
    // 
    // Formula to match Shopify exactly:
    // 1. Convert our GROSS price to NET: price / 1.27
    // 2. Apply discount on NET values
    // 3. Add VAT back: * 1.27
    // This gives us the Shopify "Total Sales" value
    const query = `
      INSERT INTO product_performance (product_id, date, revenue, units_sold, orders_count)
      SELECT 
        oi.product_id as product_id,
        DATE(datetime(substr(o.created_at, 1, 19))) as date,
        -- Exact Shopify formula
        SUM(
          CASE
            -- If order has discount, calculate on NET values then add VAT back
            WHEN o.total_discounts > 0 AND (o.subtotal_price + o.total_discounts) > 0 THEN
              -- Step 1: Convert to NET
              -- Step 2: Apply discount proportionally (both values are NET)
              -- Step 3: Add VAT back (* 1.27)
              (oi.price * oi.quantity / 1.27) * 
              (1 - (o.total_discounts / (o.subtotal_price + o.total_discounts))) * 
              1.27
            -- No discount: price already matches Shopify total (includes VAT)
            ELSE
              oi.price * oi.quantity
          END
        ) as revenue,
        SUM(oi.quantity) as units_sold,
        COUNT(DISTINCT o.id) as orders_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id IS NOT NULL
        AND oi.product_id != ''
        -- Exclude "Utánvét Díja" and other non-product items
        AND oi.name NOT LIKE '%Utánvét%'
        AND oi.name NOT LIKE '%Csomagbiztosítás%'
        -- Ensure proper date extraction (exclude timezone issues)
        AND DATE(datetime(substr(o.created_at, 1, 19))) IS NOT NULL
      GROUP BY oi.product_id, DATE(datetime(substr(o.created_at, 1, 19)))
    `;
    
    db.run(query, function(err) {
      if (err) {
        console.error('Error syncing product performance:', err);
        return res.status(500).json({ error: 'Failed to sync product performance' });
      }
      
      // Get count of records created
      db.get('SELECT COUNT(*) as count FROM product_performance', (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to get count' });
        }
        
        console.log(`✅ Product performance synced: ${result.count} records`);
        res.json({ 
          success: true, 
          message: 'Product performance synced successfully',
          recordsCreated: result.count
        });
      });
    });
    
  } catch (error) {
    console.error('Error in product performance sync:', error);
    res.status(500).json({ error: 'Failed to sync product performance', message: error.message });
  }
});

// Get product performance with filters
app.get('/api/product-performance', (req, res) => {
  const { 
    page = 1, 
    limit = 50,
    start_date,
    end_date,
    product_id,
    search
  } = req.query;
  
  const offset = (page - 1) * limit;
  
  // Build WHERE conditions
  let whereConditions = [];
  let params = [];
  
  if (start_date) {
    whereConditions.push('pp.date >= ?');
    params.push(start_date);
  }
  
  if (end_date) {
    whereConditions.push('pp.date <= ?');
    params.push(end_date);
  }
  
  if (product_id) {
    whereConditions.push('pp.product_id = ?');
    params.push(product_id);
  }
  
  if (search) {
    whereConditions.push('(p.name LIKE ? OR p.vendor LIKE ? OR p.product_type LIKE ?)');
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';
  
  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT pp.product_id, pp.date) as total
    FROM product_performance pp
    LEFT JOIN products p ON pp.product_id = p.shopify_id
    ${whereClause}
  `;
  
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      console.error('Error counting product performance:', err);
      return res.status(500).json({ error: 'Failed to count records' });
    }
    
    const totalCount = countResult.total;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get paginated data with product details
    const dataQuery = `
      SELECT 
        pp.*,
        p.name as product_title,
        p.vendor,
        p.product_type,
        p.tags,
        p.featured_image as image_url,
        p.handle,
        p.status,
        p.sku
      FROM product_performance pp
      LEFT JOIN products p ON pp.product_id = p.id
      ${whereClause}
      ORDER BY pp.date DESC, pp.revenue DESC
      LIMIT ? OFFSET ?
    `;
    
    const queryParams = [...params, parseInt(limit), offset];
    
    db.all(dataQuery, queryParams, (err, rows) => {
      if (err) {
        console.error('Error fetching product performance:', err);
        return res.status(500).json({ error: 'Failed to fetch product performance' });
      }
      
      // Parse JSON fields
      const performance = rows.map(row => {
        if (row.tags) {
          try {
            row.tags = JSON.parse(row.tags);
          } catch (e) {
            row.tags = [];
          }
        }
        return row;
      });
      
      res.json({
        performance: performance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// Get aggregated product performance
app.get('/api/product-performance/aggregate', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let whereConditions = [];
  let params = [];
  
  if (start_date) {
    whereConditions.push('pp.date >= ?');
    params.push(start_date);
  }
  
  if (end_date) {
    whereConditions.push('pp.date <= ?');
    params.push(end_date);
  }
  
  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';
  
  const query = `
    SELECT 
      pp.product_id,
      p.name as product_title,
      p.vendor,
      p.product_type,
      p.featured_image as image_url,
      p.images as images_json,
      p.sku,
      p.cost as cost_per_unit,
      SUM(pp.revenue) as total_revenue,
      SUM(pp.units_sold) as total_units,
      SUM(pp.orders_count) as total_orders,
      AVG(pp.revenue / NULLIF(pp.units_sold, 0)) as avg_price,
      COUNT(DISTINCT pp.date) as days_sold,
      -- Enhanced metrics from product_performance_enhanced if available
      SUM(ppe.gross_sales) as gross_sales,
      SUM(ppe.net_sales) as net_sales,
      SUM(ppe.total_discounts) as total_discounts,
      SUM(ppe.total_cost) as total_cogs,
      SUM(ppe.gross_profit) as gross_profit,
      SUM(ppe.net_profit) as net_profit,
      AVG(ppe.margin_percentage) as avg_margin,
      SUM(ppe.returns_amount) as returns_amount,
      SUM(ppe.refunds_amount) as refunds_amount,
      SUM(ppe.taxes) as total_taxes,
      SUM(ppe.shipping_charges) as total_shipping,
      SUM(ppe.unique_customers) as unique_customers,
      AVG(ppe.conversion_rate) as avg_conversion_rate,
      AVG(ppe.average_order_value) as avg_order_value
    FROM product_performance pp
    LEFT JOIN products p ON pp.product_id = p.shopify_id
    LEFT JOIN product_performance_enhanced ppe ON pp.product_id = ppe.product_id AND pp.date = ppe.date
    ${whereClause}
    GROUP BY pp.product_id
    ORDER BY total_revenue DESC
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching aggregated performance:', err);
      return res.status(500).json({ error: 'Failed to fetch aggregated performance' });
    }
    
    // Process rows to parse images JSON and ensure proper image URL
    const processedRows = rows.map(row => {
      let images = [];
      try {
        if (row.images_json) {
          images = JSON.parse(row.images_json);
        }
      } catch (e) {
        console.error('Error parsing images for product:', row.product_id, e);
      }
      
      // Use first image from array if no featured image
      const imageUrl = row.image_url || (images && images.length > 0 ? images[0] : null);
      
      // Calculate derived metrics
      const cogs = row.total_cogs || (row.cost_per_unit * row.total_units) || 0;
      const grossProfit = row.gross_profit || (row.total_revenue - cogs) || 0;
      const margin = row.avg_margin || (row.total_revenue > 0 ? (grossProfit / row.total_revenue * 100) : 0);
      
      return {
        ...row,
        images: images,
        image_url: imageUrl,
        // Ensure all metrics are present
        gross_sales: row.gross_sales || row.total_revenue || 0,
        net_sales: row.net_sales || (row.total_revenue - (row.total_discounts || 0)) || 0,
        total_cogs: cogs,
        gross_profit: grossProfit,
        net_profit: row.net_profit || grossProfit || 0,
        margin: margin,
        cost_per_unit: row.cost_per_unit || 0,
        // Remove the raw JSON field
        images_json: undefined
      };
    });
    
    res.json({
      products: processedRows,
      summary: {
        totalProducts: processedRows.length,
        totalRevenue: processedRows.reduce((sum, p) => sum + (p.total_revenue || 0), 0),
        totalUnits: processedRows.reduce((sum, p) => sum + (p.total_units || 0), 0),
        totalOrders: processedRows.reduce((sum, p) => sum + (p.total_orders || 0), 0)
      }
    });
  });
});

// === EXPERIMENT API ENDPOINTS ===

// Test Types endpoints
app.get('/api/test-types', (req, res) => {
  // Return default test types for now
  const testTypes = [
    {
      id: 'vct',
      name: 'Video Creative Test',
      short_name: 'VCT',
      shortName: 'VCT',
      description: 'Video creative performance testing',
      color: 'purple',
      icon_name: 'Video',
      iconName: 'Video',
      display_order: 1,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'tiktok', is_default: true },
        { platform_id: 'google', is_default: true }
      ]
    },
    {
      id: 'sct',
      name: 'Static Creative Test',
      short_name: 'SCT',
      shortName: 'SCT',
      description: 'Static image creative testing',
      color: 'blue',
      icon_name: 'Image',
      iconName: 'Image',
      display_order: 2,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'pinterest', is_default: true },
        { platform_id: 'linkedin', is_default: true }
      ]
    },
    {
      id: 'act',
      name: 'Ad Copy Test',
      short_name: 'ACT',
      shortName: 'ACT',
      description: 'Ad copy and messaging testing',
      color: 'green',
      icon_name: 'MessageSquare',
      iconName: 'MessageSquare',
      display_order: 3,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'google', is_default: true },
        { platform_id: 'linkedin', is_default: true }
      ]
    }
  ];
  res.json(testTypes);
});

app.get('/api/test-types/:id', (req, res) => {
  const testTypes = {
    'vct': {
      id: 'vct',
      name: 'Video Creative Test',
      short_name: 'VCT',
      shortName: 'VCT',
      description: 'Video creative performance testing',
      color: 'purple',
      icon_name: 'Video',
      iconName: 'Video',
      display_order: 1,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'tiktok', is_default: true },
        { platform_id: 'google', is_default: true }
      ]
    },
    'sct': {
      id: 'sct',
      name: 'Static Creative Test',
      short_name: 'SCT',
      shortName: 'SCT',
      description: 'Static image creative testing',
      color: 'blue',
      icon_name: 'Image',
      iconName: 'Image',
      display_order: 2,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'pinterest', is_default: true },
        { platform_id: 'linkedin', is_default: true }
      ]
    },
    'act': {
      id: 'act',
      name: 'Ad Copy Test',
      short_name: 'ACT',
      shortName: 'ACT',
      description: 'Ad copy and messaging testing',
      color: 'green',
      icon_name: 'MessageSquare',
      iconName: 'MessageSquare',
      display_order: 3,
      allowed_platforms: [
        { platform_id: 'meta', is_default: true },
        { platform_id: 'google', is_default: true },
        { platform_id: 'linkedin', is_default: true }
      ]
    }
  };
  
  const testType = testTypes[req.params.id];
  if (!testType) {
    return res.status(404).json({ error: 'Test type not found' });
  }
  res.json(testType);
});

app.post('/api/test-types', (req, res) => {
  // For now, just return the sent data with an ID
  const testType = {
    ...req.body,
    id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-')
  };
  res.status(201).json(testType);
});

// Platforms endpoints
app.get('/api/platforms', (req, res) => {
  const platforms = [
    {
      id: 'meta',
      name: 'Meta',
      description: 'Facebook and Instagram advertising',
      color: 'blue',
      icon_name: 'Facebook',
      iconName: 'Facebook',
      display_order: 1
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'TikTok advertising platform',
      color: 'pink',
      icon_name: 'Music',
      iconName: 'Music',
      display_order: 2
    },
    {
      id: 'google',
      name: 'Google',
      description: 'Google Ads and YouTube',
      color: 'red',
      icon_name: 'Youtube',
      iconName: 'Youtube',
      display_order: 3
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      description: 'Pinterest advertising',
      color: 'red',
      icon_name: 'Image',
      iconName: 'Image',
      display_order: 4
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'LinkedIn advertising',
      color: 'blue',
      icon_name: 'Linkedin',
      iconName: 'Linkedin',
      display_order: 5
    }
  ];
  res.json(platforms);
});

app.get('/api/platforms/:id', (req, res) => {
  const platforms = {
    'meta': {
      id: 'meta',
      name: 'Meta',
      description: 'Facebook and Instagram advertising',
      color: 'blue',
      icon_name: 'Facebook',
      iconName: 'Facebook',
      display_order: 1
    },
    'tiktok': {
      id: 'tiktok',
      name: 'TikTok',
      description: 'TikTok advertising platform',
      color: 'pink',
      icon_name: 'Music',
      iconName: 'Music',
      display_order: 2
    },
    'google': {
      id: 'google',
      name: 'Google',
      description: 'Google Ads and YouTube',
      color: 'red',
      icon_name: 'Youtube',
      iconName: 'Youtube',
      display_order: 3
    },
    'pinterest': {
      id: 'pinterest',
      name: 'Pinterest',
      description: 'Pinterest advertising',
      color: 'red',
      icon_name: 'Image',
      iconName: 'Image',
      display_order: 4
    },
    'linkedin': {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'LinkedIn advertising',
      color: 'blue',
      icon_name: 'Linkedin',
      iconName: 'Linkedin',
      display_order: 5
    }
  };
  
  const platform = platforms[req.params.id];
  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }
  res.json(platform);
});

app.post('/api/platforms', (req, res) => {
  // For now, just return the sent data with an ID
  const platform = {
    ...req.body,
    id: req.body.id || req.body.name.toLowerCase().replace(/\s+/g, '-')
  };
  res.status(201).json(platform);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 SQLite database: ./database.db');
  console.log('✨ Ready to handle requests!');
});