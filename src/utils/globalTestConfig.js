// Global Test Configuration - Database-backed test types and platforms for both Experiment and Creative Performance
import experimentApi from '../api/experimentClient.js';
import { mockTestTypes, mockPlatforms } from '../api/mockData.js';

// Cache for test types and platforms to avoid excessive API calls
let testTypesCache = null;
let platformsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Storage keys for backward compatibility fallback only
const GLOBAL_TEST_TYPES_KEY = 'global_test_types';
const GLOBAL_PLATFORMS_KEY = 'global_platforms';

// Initialize global configuration from database
export async function initializeGlobalTestConfig() {
  try {
    // Load from database
    await refreshCache();
    return true;
  } catch (error) {
    console.error('Failed to initialize from database, using mock data:', error);
    // Use mock data as fallback
    testTypesCache = mockTestTypes;
    platformsCache = mockPlatforms;
    // Save to localStorage for offline use
    localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(mockTestTypes));
    localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(mockPlatforms));
    return false;
  }
}

// Refresh cache from database
async function refreshCache() {
  try {
    const [testTypes, platforms] = await Promise.all([
      experimentApi.testTypes.getAll(),
      experimentApi.platforms.getAll()
    ]);
    
    testTypesCache = testTypes;
    platformsCache = platforms;
    cacheTimestamp = Date.now();
    
    // Also update localStorage for offline fallback
    localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(testTypes));
    localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(platforms));
    
    return { testTypes, platforms };
  } catch (error) {
    console.error('Error refreshing cache from database:', error);
    throw error;
  }
}

// Check if cache is still valid
function isCacheValid() {
  return cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION);
}

// Get global test types from database
export async function getGlobalTestTypesAsync() {
  try {
    if (!isCacheValid() || !testTypesCache) {
      await refreshCache();
    }
    return testTypesCache || [];
  } catch (error) {
    console.error('Error fetching test types from database:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(GLOBAL_TEST_TYPES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

// Get global platforms from database
export async function getGlobalPlatformsAsync() {
  try {
    if (!isCacheValid() || !platformsCache) {
      await refreshCache();
    }
    return platformsCache || [];
  } catch (error) {
    console.error('Error fetching platforms from database:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(GLOBAL_PLATFORMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

// Synchronous versions for backward compatibility (returns cached or localStorage data)
export function getGlobalTestTypes() {
  if (testTypesCache) {
    return testTypesCache;
  }
  const stored = localStorage.getItem(GLOBAL_TEST_TYPES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored test types:', e);
    }
  }
  // Return mock data as last resort
  return mockTestTypes;
}

export function getGlobalPlatforms() {
  if (platformsCache) {
    return platformsCache;
  }
  const stored = localStorage.getItem(GLOBAL_PLATFORMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored platforms:', e);
    }
  }
  // Return mock data as last resort
  return mockPlatforms;
}

// Save global test types to database
export async function saveGlobalTestTypes(testTypes) {
  try {
    // Update each test type in the database
    const promises = testTypes.map(async (testType) => {
      try {
        // Check if exists
        const existing = await experimentApi.testTypes.getById(testType.id);
        if (existing) {
          // Update
          return await experimentApi.testTypes.update(testType.id, testType);
        } else {
          // Create
          return await experimentApi.testTypes.create(testType);
        }
      } catch (error) {
        // If getById fails, try to create
        return await experimentApi.testTypes.create(testType);
      }
    });
    
    await Promise.all(promises);
    
    // Refresh cache
    await refreshCache();
    
    return true;
  } catch (error) {
    console.error('Error saving test types to database:', error);
    // Fallback to localStorage
    localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(testTypes));
    testTypesCache = testTypes;
    return false;
  }
}

// Save global platforms to database
export async function saveGlobalPlatforms(platforms) {
  try {
    // Update each platform in the database
    const promises = platforms.map(async (platform) => {
      try {
        // Check if exists
        const existing = await experimentApi.platforms.getById(platform.id);
        if (existing) {
          // Update
          return await experimentApi.platforms.update(platform.id, platform);
        } else {
          // Create
          return await experimentApi.platforms.create(platform);
        }
      } catch (error) {
        // If getById fails, try to create
        return await experimentApi.platforms.create(platform);
      }
    });
    
    await Promise.all(promises);
    
    // Refresh cache
    await refreshCache();
    
    return true;
  } catch (error) {
    console.error('Error saving platforms to database:', error);
    // Fallback to localStorage
    localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(platforms));
    platformsCache = platforms;
    return false;
  }
}

// Delete a test type from database
export async function deleteGlobalTestType(testTypeId) {
  try {
    await experimentApi.testTypes.delete(testTypeId);
    
    // Refresh cache
    await refreshCache();
    
    return true;
  } catch (error) {
    console.error('Error deleting test type from database, updating local storage:', error);
    
    // Fallback to localStorage manipulation
    const testTypes = getGlobalTestTypes();
    const filtered = testTypes.filter(t => t.id !== testTypeId);
    localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(filtered));
    testTypesCache = filtered;
    
    // Return true since we successfully updated local state
    return true;
  }
}

// Delete a platform from database
export async function deleteGlobalPlatform(platformId) {
  try {
    await experimentApi.platforms.delete(platformId);
    
    // Refresh cache
    await refreshCache();
    
    return true;
  } catch (error) {
    console.error('Error deleting platform from database, updating local storage:', error);
    
    // Fallback to localStorage manipulation
    const platforms = getGlobalPlatforms();
    const filtered = platforms.filter(p => p.id !== platformId);
    localStorage.setItem(GLOBAL_PLATFORMS_KEY, JSON.stringify(filtered));
    platformsCache = filtered;
    
    // Return true since we successfully updated local state
    return true;
  }
}

// Get allowed platforms for a test type
export function getGlobalAllowedPlatforms(testTypeId) {
  const testTypes = getGlobalTestTypes();
  const testType = testTypes.find(t => t.id === testTypeId);
  
  if (!testType) return [];
  
  // If test type has allowed_platforms from database
  if (testType.allowed_platforms && Array.isArray(testType.allowed_platforms)) {
    return testType.allowed_platforms.map(ap => ap.platform_id || ap);
  }
  
  // Fallback to allowedPlatforms property
  return testType.allowedPlatforms || [];
}

// Update allowed platforms for a test type
export async function updateAllowedPlatforms(testTypeId, platformIds) {
  try {
    const testType = await experimentApi.testTypes.getById(testTypeId);
    if (!testType) {
      throw new Error('Test type not found');
    }
    
    // Update with new allowed platforms
    const allowedPlatforms = platformIds.map(pid => ({
      platform_id: pid,
      is_default: true
    }));
    
    await experimentApi.testTypes.update(testTypeId, {
      allowed_platforms: allowedPlatforms
    });
    
    // Refresh cache
    await refreshCache();
    
    return true;
  } catch (error) {
    console.error('Error updating allowed platforms:', error);
    
    // Fallback to localStorage
    const testTypes = getGlobalTestTypes();
    const index = testTypes.findIndex(t => t.id === testTypeId);
    if (index !== -1) {
      testTypes[index].allowedPlatforms = platformIds;
      localStorage.setItem(GLOBAL_TEST_TYPES_KEY, JSON.stringify(testTypes));
      testTypesCache = testTypes;
    }
    
    return false;
  }
}

// Migration function - only needed once
export async function migrateToGlobalConfig() {
  try {
    // This function is now a no-op since we're using the database
    console.log('Migration to database-backed configuration complete');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Force refresh from database
export async function forceRefreshFromDatabase() {
  testTypesCache = null;
  platformsCache = null;
  cacheTimestamp = 0;
  return await refreshCache();
}