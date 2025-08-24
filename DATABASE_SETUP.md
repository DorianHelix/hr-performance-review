# Database Setup Guide 🗄️

## Overview
This project uses **SQLite** for local development with proper database management to avoid conflicts between branches.

## Key Improvements Made
- ✅ **Single consolidated database** (`database/helix.db`)
- ✅ **Database files in .gitignore** (no more merge conflicts!)
- ✅ **Automatic backups** before database changes
- ✅ **Easy initialization scripts** for fresh setup
- ✅ **Seed data option** for testing

## Quick Start

### Fresh Setup (After cloning or when DB is broken)
```bash
# Initialize empty database
npm run db:init

# OR initialize with sample data
npm run db:seed

# Start the app
npm run dev:all
```

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:init` | Create fresh empty database |
| `npm run db:seed` | Create database with sample data |
| `npm run db:backup` | Manual backup (auto-backups on init) |
| `npm run migrate` | Run PostgreSQL migrations (if switching to Postgres) |

## File Structure
```
database/
├── helix.db              # Main database (git-ignored)
├── backups/              # Automatic backups (git-ignored)
├── init-db.js            # Database initialization script
├── schema.sql            # Database schema (version controlled)
└── migrations/           # PostgreSQL migration files
```

## Working with Branches

### Switching branches safely:
```bash
# Before switching branches
git stash           # Save your work
npm run db:backup   # Optional: manual backup

# Switch branch
git checkout feature-branch

# Reinitialize database for new branch
npm run db:init     # Fresh database for this branch
```

### Best Practices

1. **Never commit .db files** - They're in .gitignore
2. **Use db:init when starting new feature** - Clean slate
3. **Backups are automatic** - Check `database/backups/` folder
4. **Each developer has own database** - No conflicts!

## Database Contents

### Consolidated Tables:
- **Experiment System**: test_types, platforms, experiments, creative_scores
- **Shopify Data**: products, orders, order_items, product_variants
- **Settings**: settings, shopify_sync_log
- **Organization**: employees
- **Analytics**: product_performance, product_scores

## Troubleshooting

### Database is corrupted/broken:
```bash
npm run db:init
```

### Need to restore a backup:
```bash
# List available backups
ls database/backups/

# Restore specific backup
cp database/backups/helix-backup-2024-*.db database/helix.db
```

### Want to switch to PostgreSQL:
1. Update `.env` with PostgreSQL credentials
2. Run `npm run migrate`
3. Update server.js to use pg instead of sqlite

## Environment Variables

Create `.env` file (copy from `.env.example`):
```env
# For SQLite (current setup)
DB_PATH=database/helix.db

# For PostgreSQL (future option)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helix_finance
DB_USER=postgres
DB_PASSWORD=your_password
```

## Tips for Teams

### For your team:
1. Add this to your README:
   ```
   After cloning: Run `npm run db:init` to set up database
   ```

2. Each developer runs their own local database

3. Share seed data in `database/seed-data.sql` for consistent testing

### CI/CD:
- Use `npm run db:init` in CI pipeline
- Use PostgreSQL for production
- Keep SQLite for fast local development

## Migration Path (SQLite → PostgreSQL)

When ready for production:
1. PostgreSQL is already configured in migrations
2. Run `npm run migrate` 
3. Update connection strings
4. Deploy!

---

💡 **Remember**: Database problems usually mean you need to run `npm run db:init`!