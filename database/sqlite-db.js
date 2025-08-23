// SQLite database implementation - works without external server
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create or open database file
const db = new Database(path.join(__dirname, 'helix.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
function initializeTables() {
  // Test Types table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon_name TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Platforms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon_name TEXT,
      color TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Test Type-Platform mapping
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_type_platforms (
      test_type_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (test_type_id, platform_id),
      FOREIGN KEY (test_type_id) REFERENCES test_types(id) ON DELETE CASCADE,
      FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
    )
  `);

  // Insert default data if tables are empty
  const testTypeCount = db.prepare('SELECT COUNT(*) as count FROM test_types').get();
  if (testTypeCount.count === 0) {
    console.log('Inserting default test types...');
    const insertTestType = db.prepare(`
      INSERT INTO test_types (id, name, short_name, description, color, icon_name, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertTestType.run('vct', 'Video Creative Test', 'VCT', 'Testing video creative performance', '#A78BFA', 'Video', 1);
    insertTestType.run('sct', 'Static Creative Test', 'SCT', 'Testing static image creative performance', '#60A5FA', 'Image', 2);
    insertTestType.run('act', 'Ad Copy Test', 'ACT', 'Testing ad copy effectiveness', '#34D399', 'FileText', 3);
  }

  const platformCount = db.prepare('SELECT COUNT(*) as count FROM platforms').get();
  if (platformCount.count === 0) {
    console.log('Inserting default platforms...');
    const insertPlatform = db.prepare(`
      INSERT INTO platforms (id, name, description, icon_name, color, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertPlatform.run('meta', 'Meta', 'Facebook and Instagram Ads', 'Facebook', 'blue', 1);
    insertPlatform.run('google', 'Google', 'Google Ads and YouTube', 'Chrome', 'yellow', 2);
    insertPlatform.run('tiktok', 'TikTok', 'TikTok Ads', 'Music', 'pink', 3);

    // Set default platform mappings
    const insertMapping = db.prepare(`
      INSERT INTO test_type_platforms (test_type_id, platform_id, is_default)
      VALUES (?, ?, ?)
    `);

    // VCT - all platforms
    insertMapping.run('vct', 'meta', 1);
    insertMapping.run('vct', 'google', 1);
    insertMapping.run('vct', 'tiktok', 1);

    // SCT - meta and google
    insertMapping.run('sct', 'meta', 1);
    insertMapping.run('sct', 'google', 1);

    // ACT - meta and google
    insertMapping.run('act', 'meta', 1);
    insertMapping.run('act', 'google', 1);
  }
}

// Initialize on import
initializeTables();

// Test Types API
export const testTypesApi = {
  getAll() {
    const stmt = db.prepare(`
      SELECT t.*,
        GROUP_CONCAT(tp.platform_id) as platform_ids
      FROM test_types t
      LEFT JOIN test_type_platforms tp ON t.id = tp.test_type_id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY t.display_order
    `);
    
    const rows = stmt.all();
    return rows.map(row => ({
      ...row,
      allowed_platforms: row.platform_ids ? 
        row.platform_ids.split(',').map(pid => ({ platform_id: pid, is_default: true })) : 
        []
    }));
  },

  getById(id) {
    const stmt = db.prepare(`
      SELECT t.*,
        GROUP_CONCAT(tp.platform_id) as platform_ids
      FROM test_types t
      LEFT JOIN test_type_platforms tp ON t.id = tp.test_type_id
      WHERE t.id = ?
      GROUP BY t.id
    `);
    
    const row = stmt.get(id);
    if (!row) return null;
    
    return {
      ...row,
      allowed_platforms: row.platform_ids ? 
        row.platform_ids.split(',').map(pid => ({ platform_id: pid, is_default: true })) : 
        []
    };
  },

  create(testType) {
    const { id, name, short_name, shortName, description, color, icon_name, iconName, display_order, allowed_platforms } = testType;
    
    // Insert test type
    const stmt = db.prepare(`
      INSERT INTO test_types (id, name, short_name, description, color, icon_name, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      name,
      short_name || shortName,
      description,
      color,
      icon_name || iconName,
      display_order || 0
    );

    // Insert platform mappings
    if (allowed_platforms && allowed_platforms.length > 0) {
      const insertMapping = db.prepare(`
        INSERT INTO test_type_platforms (test_type_id, platform_id, is_default)
        VALUES (?, ?, ?)
      `);

      allowed_platforms.forEach(ap => {
        const platformId = typeof ap === 'string' ? ap : ap.platform_id;
        insertMapping.run(id, platformId, 1);
      });
    }

    return this.getById(id);
  },

  update(id, updates) {
    const { name, short_name, shortName, description, color, icon_name, iconName, display_order, is_active, allowed_platforms } = updates;
    
    // Update test type
    const stmt = db.prepare(`
      UPDATE test_types 
      SET name = COALESCE(?, name),
          short_name = COALESCE(?, short_name),
          description = COALESCE(?, description),
          color = COALESCE(?, color),
          icon_name = COALESCE(?, icon_name),
          display_order = COALESCE(?, display_order),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      name,
      short_name || shortName,
      description,
      color,
      icon_name || iconName,
      display_order,
      is_active,
      id
    );

    // Update platform mappings if provided
    if (allowed_platforms !== undefined) {
      // Delete existing mappings
      db.prepare('DELETE FROM test_type_platforms WHERE test_type_id = ?').run(id);
      
      // Insert new mappings
      if (allowed_platforms.length > 0) {
        const insertMapping = db.prepare(`
          INSERT INTO test_type_platforms (test_type_id, platform_id, is_default)
          VALUES (?, ?, ?)
        `);

        allowed_platforms.forEach(ap => {
          const platformId = typeof ap === 'string' ? ap : ap.platform_id;
          insertMapping.run(id, platformId, 1);
        });
      }
    }

    return this.getById(id);
  },

  delete(id) {
    const stmt = db.prepare('UPDATE test_types SET is_active = 0 WHERE id = ?');
    stmt.run(id);
    return { id, deleted: true };
  }
};

// Platforms API
export const platformsApi = {
  getAll() {
    const stmt = db.prepare(`
      SELECT * FROM platforms 
      WHERE is_active = 1 
      ORDER BY display_order
    `);
    return stmt.all();
  },

  getById(id) {
    const stmt = db.prepare('SELECT * FROM platforms WHERE id = ?');
    return stmt.get(id);
  },

  create(platform) {
    const { id, name, description, icon_name, iconName, color, display_order } = platform;
    
    const stmt = db.prepare(`
      INSERT INTO platforms (id, name, description, icon_name, color, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      name,
      description,
      icon_name || iconName,
      color,
      display_order || 0
    );

    return this.getById(id);
  },

  update(id, updates) {
    const { name, description, icon_name, iconName, color, display_order, is_active } = updates;
    
    const stmt = db.prepare(`
      UPDATE platforms 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          icon_name = COALESCE(?, icon_name),
          color = COALESCE(?, color),
          display_order = COALESCE(?, display_order),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      name,
      description,
      icon_name || iconName,
      color,
      display_order,
      is_active,
      id
    );

    return this.getById(id);
  },

  delete(id) {
    const stmt = db.prepare('UPDATE platforms SET is_active = 0 WHERE id = ?');
    stmt.run(id);
    return { id, deleted: true };
  }
};

export default {
  testTypes: testTypesApi,
  platforms: platformsApi
};