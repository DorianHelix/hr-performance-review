-- Migration to rename employee_id to entity_id in scores table
-- and update incorrect category names

-- Backup the current scores table
CREATE TABLE scores_backup AS SELECT * FROM scores;

-- Drop the old table
DROP TABLE scores;

-- Create new scores table with entity_id instead of employee_id
CREATE TABLE scores (
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
);

-- Migrate data from backup, fixing category names
INSERT INTO scores (entity_id, date, category, score, performance_report, media_buyer_review, created_at, updated_at)
SELECT 
  employee_id as entity_id,
  date,
  CASE 
    WHEN category = 'RCT' THEN 'SCT'  -- Fix incorrect RCT to SCT
    ELSE category 
  END as category,
  score,
  performance_report,
  media_buyer_review,
  created_at,
  updated_at
FROM scores_backup;

-- Drop the backup table
DROP TABLE scores_backup;