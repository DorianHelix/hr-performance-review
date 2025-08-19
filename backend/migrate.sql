-- Migration script to separate products and employees tables

-- First, rename the old employees table to backup
ALTER TABLE employees RENAME TO employees_backup;

-- Create new employees table with proper HR fields
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
);

-- Copy employee data from backup (only HR-related records)
INSERT INTO employees (id, name, division, squad, team, role, created_at, updated_at)
SELECT id, name, division, squad, team, role, created_at, updated_at
FROM employees_backup
WHERE id LIKE 'emp-%' OR (id NOT LIKE 'prod-%' AND category IS NULL);

-- Insert product data into products table
INSERT OR IGNORE INTO products (id, name, sku, category, created_at, updated_at)
SELECT id, name, sku, category, created_at, updated_at
FROM employees_backup
WHERE id LIKE 'prod-%' OR category IS NOT NULL;

-- Drop the backup table
DROP TABLE employees_backup;