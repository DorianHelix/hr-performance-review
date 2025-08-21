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
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT,
      category TEXT,
      description TEXT,
      price REAL,
      stock INTEGER,
      min_stock INTEGER,
      status TEXT DEFAULT 'active',
      supplier TEXT,
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
  db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert snake_case to camelCase for frontend
    const products = rows.map(row => ({
      ...row,
      minStock: row.min_stock
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
  const { storeDomain, accessToken, limit = 250, since_id = null, saveToDb = false } = req.body;
  
  if (!storeDomain || !accessToken) {
    return res.status(400).json({ error: 'Store domain and access token are required' });
  }
  
  try {
    // Fetch ALL fields including metafields, SEO, and collections
    let url = `https://${storeDomain}.myshopify.com/admin/api/2024-01/products.json?limit=${limit}`;
    if (since_id) {
      url += `&since_id=${since_id}`;
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
    const products = data.products;
    
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
    
    res.json({ 
      success: true, 
      products: products,
      count: products.length
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 SQLite database: ./database.db');
  console.log('✨ Ready to handle requests!');
});