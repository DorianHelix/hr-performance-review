# 🧹 Project Cleanup List

## Files to Remove (Deprecated/Test Files)

### Root Level Test/Debug HTML Files
These were used for testing and are no longer needed:
- ❌ admin.html - Old admin interface
- ❌ check_storage.html - Debug tool
- ❌ check-and-migrate.html - One-time migration tool
- ❌ clearLocalStorage.html - Debug utility
- ❌ fix-shopify.html - One-time fix script
- ❌ load-test-data.html - Test data loader
- ❌ migrate-to-db.html - Old migration tool
- ❌ sync-shopify-products.html - Now handled by Settings UI
- ❌ test-database.html - Test utility
- ❌ test-experiment-scores.html - Test file
- ❌ test-persistence.html - Test file
- ❌ test-theme.html - Theme testing

### Deprecated JavaScript Files
- ❌ server.js (root) - Using backend/server.js now
- ❌ loadTestData.js - Test data loader
- ❌ test-loader.js - Test utility
- ❌ debug-scores.js - Debug script
- ❌ populate-scores.js - One-time data script
- ❌ api/experimentApi.js - Duplicate/unused API file
- ❌ backend/add-test-tables.js - One-time migration
- ❌ backend/check-db.js - Debug utility

### Files to KEEP
✅ index.html - Main app entry
✅ backend/server.js - Main backend server
✅ backend/database.db - Shopify data
✅ database/helix.db - Experiment data
✅ database/init-db.js - Database initialization
✅ src/* - All source code
✅ public/* - Public assets
✅ package.json, vite.config.js - Config files
✅ .gitignore - Git configuration
✅ DATABASE_SETUP.md - Documentation

## Summary
- **12 HTML test files** to remove
- **8 JavaScript files** to remove  
- **Total: 20 files** can be safely deleted

This will significantly clean up your project root!