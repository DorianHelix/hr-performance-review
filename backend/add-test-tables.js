// Script to add test types and platforms tables to existing database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  console.log('Adding test types and platforms tables to existing database...');
  
  // Test Types table
  db.run(`
    CREATE TABLE IF NOT EXISTS test_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon_name TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating test_types table:', err);
    else console.log('✓ test_types table created');
  });

  // Platforms table
  db.run(`
    CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon_name TEXT,
      color TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating platforms table:', err);
    else console.log('✓ platforms table created');
  });

  // Test Type-Platform mapping
  db.run(`
    CREATE TABLE IF NOT EXISTS test_type_platforms (
      test_type_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (test_type_id, platform_id),
      FOREIGN KEY (test_type_id) REFERENCES test_types(id) ON DELETE CASCADE,
      FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating test_type_platforms table:', err);
    else console.log('✓ test_type_platforms table created');
  });

  // Check if we need to insert default data
  db.get('SELECT COUNT(*) as count FROM test_types', (err, row) => {
    if (!err && row.count === 0) {
      console.log('Inserting default test types...');
      
      const testTypes = [
        ['vct', 'Video Creative Test', 'VCT', 'Testing video creative performance', '#A78BFA', 'Video', 1],
        ['sct', 'Static Creative Test', 'SCT', 'Testing static image creative performance', '#60A5FA', 'Image', 2],
        ['act', 'Ad Copy Test', 'ACT', 'Testing ad copy effectiveness', '#34D399', 'FileText', 3]
      ];
      
      testTypes.forEach(type => {
        db.run(
          'INSERT INTO test_types (id, name, short_name, description, color, icon_name, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          type
        );
      });
    }
  });

  db.get('SELECT COUNT(*) as count FROM platforms', (err, row) => {
    if (!err && row.count === 0) {
      console.log('Inserting default platforms...');
      
      const platforms = [
        ['meta', 'Meta', 'Facebook and Instagram Ads', 'Facebook', 'blue', 1],
        ['google', 'Google', 'Google Ads and YouTube', 'Chrome', 'yellow', 2],
        ['tiktok', 'TikTok', 'TikTok Ads', 'Music', 'pink', 3]
      ];
      
      platforms.forEach(platform => {
        db.run(
          'INSERT INTO platforms (id, name, description, icon_name, color, display_order) VALUES (?, ?, ?, ?, ?, ?)',
          platform
        );
      });
      
      // Add default mappings
      const mappings = [
        ['vct', 'meta', 1],
        ['vct', 'google', 1],
        ['vct', 'tiktok', 1],
        ['sct', 'meta', 1],
        ['sct', 'google', 1],
        ['act', 'meta', 1],
        ['act', 'google', 1]
      ];
      
      mappings.forEach(mapping => {
        db.run(
          'INSERT INTO test_type_platforms (test_type_id, platform_id, is_default) VALUES (?, ?, ?)',
          mapping
        );
      });
    }
  });
});

setTimeout(() => {
  db.close();
  console.log('Database update complete!');
}, 2000);