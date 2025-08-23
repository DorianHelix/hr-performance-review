# Database Structure for Creative Performance & Experiments

## Overview
This database structure supports both the Experiment and Creative Performance components with synchronized test types and platforms.

## Tables

### 1. **test_types**
Stores all available test types (VCT, SCT, ACT, etc.)
- Shared between both components
- Supports custom test types
- Includes display configuration (color, icon, order)

### 2. **platforms**
Advertising platforms (Meta, Google, TikTok, etc.)
- Centralized platform definitions
- Extensible for new platforms
- Visual configuration (icon, color)

### 3. **test_type_platforms**
Maps which platforms are available for each test type
- Flexible platform assignment
- Default platform settings
- Ensures consistency across components

### 4. **experiments**
A/B test experiments from the Experiment component
- Full experiment lifecycle (draft to completed)
- Variant tracking (A/B)
- Integration with Creative Performance via push to evaluation

### 5. **experiment_results**
Daily KPI metrics for experiments
- Time-series data
- Multiple metric types
- Per-variant tracking

### 6. **creative_scores**
Performance evaluations from Creative Performance
- Manual scoring (1-10)
- Performance metrics (CTR, ROAS, etc.)
- Links to source experiments

## Setup Instructions

1. **Create database:**
```bash
createdb helix_finance
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run migrations:**
```bash
npm run migrate
# or
node database/migrate.js
```

## Migration Management

Migrations are automatically tracked in the `migrations` table. To add a new migration:

1. Create a new `.sql` file in `database/migrations/`
2. Name it with a number prefix (e.g., `002_add_new_feature.sql`)
3. Run `npm run migrate`

## API Usage

```javascript
import experimentApi from './api/experimentApi.js';

// Get all test types
const testTypes = await experimentApi.testTypes.getAll();

// Create an experiment
const experiment = await experimentApi.experiments.create({
  name: 'Summer Sale Video Test',
  test_type_id: 'vct',
  platform_id: 'meta',
  // ... other fields
});

// Save a creative score
const score = await experimentApi.creativeScores.saveScore({
  product_id: 'prod-123',
  test_type_id: 'vct',
  platform_id: 'meta',
  evaluation_date: '2025-08-23',
  score: 8,
  // ... metrics
});
```

## Data Flow

1. **Experiment Creation** → Creates test in `experiments` table
2. **Experiment Running** → Collects metrics in `experiment_results`
3. **Push to Evaluation** → Sets `pushed_to_evaluation` flag
4. **Creative Scoring** → Creates entry in `creative_scores`
5. **Performance Analysis** → Queries across all tables for insights

## Preserved Data

The migration preserves all Shopify-related tables:
- Products
- Orders
- Customers
- Any other Shopify data

Only experiment and creative performance tables are recreated.