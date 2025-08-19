const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      score INTEGER NOT NULL,
      performance_report TEXT,
      media_buyer_review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, date, category)
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
  db.run('DELETE FROM scores WHERE employee_id = ?', [id], (err) => {
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
    res.json(rows);
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
    res.json(row);
  });
});

// Create product
app.post('/api/products', (req, res) => {
  const { id, name, sku, category, description, price, stock, min_stock, status, supplier } = req.body;
  
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
  const { name, sku, category, description, price, stock, min_stock, status, supplier } = req.body;
  
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
  db.run('DELETE FROM scores WHERE employee_id = ?', [id], (err) => {
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
  const { employee_id, start_date, end_date } = req.query;
  
  let query = 'SELECT * FROM scores WHERE 1=1';
  const params = [];
  
  if (employee_id) {
    query += ' AND employee_id = ?';
    params.push(employee_id);
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
  const { employee_id, date, category, score, performance_report, media_buyer_review } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO scores (employee_id, date, category, score, performance_report, media_buyer_review) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [employee_id, date, category, score, performance_report, media_buyer_review],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID,
        employee_id,
        date,
        category,
        score
      });
    }
  );
});

// Delete score
app.delete('/api/scores/:employee_id/:date/:category', (req, res) => {
  const { employee_id, date, category } = req.params;
  
  db.run(
    'DELETE FROM scores WHERE employee_id = ? AND date = ? AND category = ?',
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
      `INSERT OR REPLACE INTO scores (employee_id, date, category, score, performance_report, media_buyer_review) 
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