// Global Test Configuration - Unified test types and platforms for both Experiment and Creative Performance

// Default test types that work for both components
export const DEFAULT_GLOBAL_TEST_TYPES = [
  {
    id: 'vct',
    name: 'Video Creative Test',
    shortName: 'VCT',
    key: 'VCT', // For Creative Performance compatibility
    color: '#60A5FA',
    description: 'Video ad performance testing',
    iconName: 'Film',
    allowedPlatforms: ['meta', 'tiktok', 'youtube'],
    order: 1
  },
  {
    id: 'sct',
    name: 'Static Creative Test',
    shortName: 'SCT',
    key: 'SCT', // For Creative Performance compatibility
    color: '#A78BFA',
    description: 'Static image ad testing',
    iconName: 'Image',
    allowedPlatforms: ['meta', 'google'],
    order: 2
  },
  {
    id: 'act',
    name: 'Ad Copy Test',
    shortName: 'ACT',
    key: 'ACT', // For Creative Performance compatibility
    color: '#34D399',
    description: 'Ad copy and text testing',
    iconName: 'FileText',
    allowedPlatforms: ['meta', 'google'],
    order: 3
  }
];

// Default platforms that work for both components
export const DEFAULT_GLOBAL_PLATFORMS = [
  {
    id: 'meta',
    name: 'Meta',
    description: 'Facebook & Instagram Ads',
    iconName: 'Facebook',
    color: 'blue',
    order: 1
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Google Ads',
    iconName: 'Chrome',
    color: 'yellow',
    order: 2
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'TikTok Ads',
    iconName: 'Music',
    color: 'pink',
    order: 3
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'YouTube Ads',
    iconName: 'Youtube',
    color: 'red',
    order: 4
  }
];

// Storage keys
const GLOBAL_TEST_TYPES_KEY = 'global_test_types';
const GLOBAL_PLATFORMS_KEY = 'global_platforms';

// Initialize global configuration
export function initializeGlobalTestConfig() {
  // Check if global data already exists
  const existingTestTypes = localStorage.getItem(GLOBAL_TEST_TYPES_KEY);
  const existingPlatforms = localStorage.getItem(GLOBAL_PLATFORMS_KEY);
  
  if (!existingTestTypes) {
    localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(DEFAULT_GLOBAL_TEST_TYPES));
  }
  
  if (!existingPlatforms) {
    localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(DEFAULT_GLOBAL_PLATFORMS));
  }
}

// Get global test types
export function getGlobalTestTypes() {
  const stored = localStorage.getItem(GLOBAL_TEST_TYPES_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_GLOBAL_TEST_TYPES;
}

// Get global platforms
export function getGlobalPlatforms() {
  const stored = localStorage.getItem(GLOBAL_PLATFORMS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_GLOBAL_PLATFORMS;
}

// Save global test types
export function saveGlobalTestTypes(testTypes) {
  localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(testTypes));
  
  // Sync to both component storages
  syncToExperimentStorage(testTypes, 'testTypes');
  syncToCreativeStorage(testTypes, 'testTypes');
}

// Save global platforms
export function saveGlobalPlatforms(platforms) {
  localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(platforms));
  
  // Sync to both component storages
  syncToExperimentStorage(platforms, 'platforms');
  syncToCreativeStorage(platforms, 'platforms');
}

// Sync global config to Experiment component storage
function syncToExperimentStorage(data, type) {
  if (type === 'testTypes') {
    // Convert global format to Experiment format
    const experimentTypes = data.map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      color: t.color
    }));
    localStorage.setItem('experiment_test_types', JSON.stringify(experimentTypes));
  } else if (type === 'platforms') {
    // Convert global format to Experiment format (with icon components)
    const experimentPlatforms = data.map(p => ({
      id: p.id,
      name: p.name,
      // Note: iconComponent will be handled by the Experiment component
    }));
    localStorage.setItem('experiment_platforms', JSON.stringify(experimentPlatforms));
  }
}

// Sync global config to Creative Performance storage
function syncToCreativeStorage(data, type) {
  if (type === 'testTypes') {
    // Creative Performance uses the same format as global
    localStorage.setItem('creativeTestTypes', JSON.stringify(data));
  } else if (type === 'platforms') {
    // Creative Performance uses the same format as global
    localStorage.setItem('creativePlatformTypes', JSON.stringify(data));
  }
}

// Migrate existing data to global format
export function migrateToGlobalConfig() {
  // Get existing data from both components
  const experimentTestTypes = JSON.parse(localStorage.getItem('experiment_test_types') || '[]');
  const experimentPlatforms = JSON.parse(localStorage.getItem('experiment_platforms') || '[]');
  const creativeTestTypes = JSON.parse(localStorage.getItem('creativeTestTypes') || '[]');
  const creativePlatforms = JSON.parse(localStorage.getItem('creativePlatformTypes') || '[]');
  
  // Merge and migrate test types
  const mergedTestTypes = mergeTestTypes(experimentTestTypes, creativeTestTypes);
  if (mergedTestTypes.length > 0) {
    saveGlobalTestTypes(mergedTestTypes);
  }
  
  // Merge and migrate platforms
  const mergedPlatforms = mergePlatforms(experimentPlatforms, creativePlatforms);
  if (mergedPlatforms.length > 0) {
    saveGlobalPlatforms(mergedPlatforms);
  }
}

// Helper function to merge test types from different formats
function mergeTestTypes(experimentTypes, creativeTypes) {
  const merged = [];
  const seenIds = new Set();
  
  // Add experiment types
  experimentTypes.forEach(t => {
    if (!seenIds.has(t.id)) {
      merged.push({
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        key: t.shortName,
        color: t.color,
        description: `${t.name} - migrated from Experiment`,
        iconName: 'Target',
        allowedPlatforms: ['meta', 'google', 'tiktok'],
        order: merged.length + 1
      });
      seenIds.add(t.id);
    }
  });
  
  // Add creative types that aren't already present
  creativeTypes.forEach(t => {
    if (!seenIds.has(t.id)) {
      merged.push(t);
      seenIds.add(t.id);
    }
  });
  
  return merged.length > 0 ? merged : DEFAULT_GLOBAL_TEST_TYPES;
}

// Helper function to merge platforms from different formats
function mergePlatforms(experimentPlatforms, creativePlatforms) {
  const merged = [];
  const seenIds = new Set();
  
  // Add experiment platforms
  experimentPlatforms.forEach(p => {
    if (!seenIds.has(p.id)) {
      merged.push({
        id: p.id,
        name: p.name,
        description: `${p.name} Ads - migrated from Experiment`,
        iconName: p.name === 'Meta' ? 'Facebook' : p.name === 'Google' ? 'Chrome' : 'Globe',
        color: 'blue',
        order: merged.length + 1
      });
      seenIds.add(p.id);
    }
  });
  
  // Add creative platforms that aren't already present
  creativePlatforms.forEach(p => {
    if (!seenIds.has(p.id)) {
      merged.push(p);
      seenIds.add(p.id);
    }
  });
  
  return merged.length > 0 ? merged : DEFAULT_GLOBAL_PLATFORMS;
}

// Get platforms allowed for a specific test type
export function getGlobalAllowedPlatforms(testTypeId) {
  const testTypes = getGlobalTestTypes();
  const testType = testTypes.find(t => t.id === testTypeId);
  return testType?.allowedPlatforms || [];
}

// Update allowed platforms for a test type
export function updateGlobalTestTypePlatforms(testTypeId, platformIds) {
  const testTypes = getGlobalTestTypes();
  const testType = testTypes.find(t => t.id === testTypeId);
  if (testType) {
    testType.allowedPlatforms = platformIds;
    saveGlobalTestTypes(testTypes);
  }
}