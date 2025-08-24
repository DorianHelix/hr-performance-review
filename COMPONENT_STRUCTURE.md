# 🎯 Professional Component Structure

## Current Structure (Messy)
```
components/
├── Analytics.jsx
├── Dashboard.jsx
├── Employees.jsx
├── Settings.jsx
├── CreativePerformance.jsx
├── CreativePerformance/
├── products/
├── orders/
└── [20+ loose files...]
```

## New Professional Structure
```
components/
├── common/                    # Shared, reusable components
│   ├── ui/                   # UI primitives
│   │   ├── AlertMessage/
│   │   │   ├── index.jsx
│   │   │   └── AlertMessage.module.css
│   │   ├── ConfirmDialog/
│   │   ├── Toast/
│   │   └── LiquidTooltip/
│   │
│   ├── forms/                # Form components
│   │   ├── DatePicker/
│   │   ├── DateRangePicker/
│   │   └── BulkImportModal/
│   │
│   └── layout/               # Layout components
│       ├── SectionHeader/
│       └── ThemeSwitcher/
│
├── features/                  # Feature-specific components
│   ├── Dashboard/
│   │   ├── index.jsx
│   │   ├── DashboardHeader.jsx
│   │   ├── DashboardCharts.jsx
│   │   ├── DashboardStats.jsx
│   │   └── Dashboard.module.css
│   │
│   ├── Analytics/
│   │   ├── index.jsx
│   │   ├── AnalyticsCharts.jsx
│   │   ├── AnalyticsFilters.jsx
│   │   └── Analytics.module.css
│   │
│   ├── Experiments/
│   │   ├── index.jsx
│   │   ├── ExperimentList.jsx
│   │   ├── ExperimentForm.jsx
│   │   ├── ExperimentCard.jsx
│   │   └── Experiments.module.css
│   │
│   ├── CreativePerformance/
│   │   ├── index.jsx
│   │   ├── ScoreChartModal/
│   │   ├── TestTypesModal/
│   │   ├── PlatformTypesModal/
│   │   └── CreativePerformance.module.css
│   │
│   ├── Products/
│   │   ├── index.jsx
│   │   ├── ProductTable/
│   │   ├── ProductFilters/
│   │   ├── ProductModals/
│   │   └── Products.module.css
│   │
│   ├── Orders/
│   │   ├── index.jsx
│   │   ├── OrderTable/
│   │   ├── OrderFilters/
│   │   └── Orders.module.css
│   │
│   ├── Employees/
│   │   ├── index.jsx
│   │   ├── OrganizationChart/
│   │   ├── OrganizationTreemap/
│   │   └── Employees.module.css
│   │
│   ├── Settings/
│   │   ├── index.jsx
│   │   ├── ShopifySettings/
│   │   ├── GeneralSettings/
│   │   └── Settings.module.css
│   │
│   └── FlowBuilder/
│       ├── index.jsx
│       ├── FlowNodes/
│       ├── FlowControls/
│       └── FlowBuilder.module.css
│
├── deprecated/               # Old components to phase out
│   ├── ProductVariantsDemo.jsx
│   └── ProductsWithVariants.jsx
│
└── index.js                  # Barrel exports
```

## Key Principles

### 1. **Folder per Component**
Each component gets its own folder with:
- `index.jsx` - Main component
- `ComponentName.module.css` - Styles
- Sub-components if needed
- Tests (optional)

### 2. **Clear Separation**
- `common/` - Reusable across features
- `features/` - Feature-specific
- `deprecated/` - To be removed

### 3. **Consistent Naming**
- PascalCase for components
- camelCase for utilities
- kebab-case for CSS modules

### 4. **Barrel Exports**
Each folder has `index.jsx` for clean imports:
```js
// Bad
import Dashboard from './components/Dashboard/Dashboard.jsx'

// Good
import { Dashboard } from './components/features/Dashboard'
```

### 5. **Co-location**
Keep related files together:
```
Dashboard/
├── index.jsx           # Main component
├── Dashboard.test.js   # Tests
├── Dashboard.module.css # Styles
├── useDashboard.js     # Custom hook
└── utils.js            # Helper functions
```

## Benefits
✅ **Scalable** - Easy to add new features
✅ **Discoverable** - Know where to find things
✅ **Maintainable** - Clear ownership
✅ **Professional** - Industry standard
✅ **Clean imports** - No more ../../../