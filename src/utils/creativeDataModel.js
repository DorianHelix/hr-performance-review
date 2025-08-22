// Creative Performance Data Model - Refactored Structure

// Default Test Types (formerly in categories, now main navigation)
export const DEFAULT_TEST_TYPES = [
  {
    id: 'video-creative-test',
    key: 'VCT',
    name: 'Video Creative Test',
    short: 'Video',
    description: 'Video ad performance testing',
    iconName: 'Film',
    color: 'purple',
    allowedPlatforms: ['meta', 'tiktok', 'youtube'],
    order: 1
  },
  {
    id: 'static-creative-test',
    key: 'SCT', 
    name: 'Static Creative Test',
    short: 'Static',
    description: 'Static image ad testing',
    iconName: 'Image',
    color: 'blue',
    allowedPlatforms: ['meta'],
    order: 2
  },
  {
    id: 'add-copy-test',
    key: 'ACT',
    name: 'Add Copy Test',
    short: 'Copy',
    description: 'Ad copy and text testing',
    iconName: 'FileText',
    color: 'green',
    allowedPlatforms: ['meta'],
    order: 3
  }
];

// Default Platform Types (formerly test types under products)
export const DEFAULT_PLATFORM_TYPES = [
  {
    id: 'meta',
    name: 'Meta',
    description: 'Facebook & Instagram Ads',
    iconName: 'Facebook',
    color: 'blue',
    order: 1
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'TikTok Ads',
    iconName: 'Music',
    color: 'pink',
    order: 2
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'YouTube Ads',
    iconName: 'Youtube',
    color: 'red',
    order: 3
  }
];

// Initialize localStorage with new structure
export function initializeCreativeData() {
  // Check if data already exists
  const existingTestTypes = localStorage.getItem('creativeTestTypes');
  const existingPlatformTypes = localStorage.getItem('creativePlatformTypes');
  
  if (!existingTestTypes) {
    localStorage.setItem('creativeTestTypes', JSON.stringify(DEFAULT_TEST_TYPES));
  }
  
  if (!existingPlatformTypes) {
    localStorage.setItem('creativePlatformTypes', JSON.stringify(DEFAULT_PLATFORM_TYPES));
  }
  
  // Clear old scores as requested
  localStorage.removeItem('hr_creative_scores');
  
  // Initialize new scores structure
  if (!localStorage.getItem('creativeScores')) {
    localStorage.setItem('creativeScores', JSON.stringify({}));
  }
}

// Get all test types
export function getTestTypes() {
  const stored = localStorage.getItem('creativeTestTypes');
  return stored ? JSON.parse(stored) : DEFAULT_TEST_TYPES;
}

// Get all platform types
export function getPlatformTypes() {
  const stored = localStorage.getItem('creativePlatformTypes');
  return stored ? JSON.parse(stored) : DEFAULT_PLATFORM_TYPES;
}

// Save test types
export function saveTestTypes(testTypes) {
  localStorage.setItem('creativeTestTypes', JSON.stringify(testTypes));
}

// Save platform types
export function savePlatformTypes(platformTypes) {
  localStorage.setItem('creativePlatformTypes', JSON.stringify(platformTypes));
}

// Get platforms allowed for a specific test type
export function getAllowedPlatforms(testTypeId) {
  const testTypes = getTestTypes();
  const testType = testTypes.find(t => t.id === testTypeId);
  return testType?.allowedPlatforms || [];
}

// Update allowed platforms for a test type
export function updateTestTypePlatforms(testTypeId, platformIds) {
  const testTypes = getTestTypes();
  const testType = testTypes.find(t => t.id === testTypeId);
  if (testType) {
    testType.allowedPlatforms = platformIds;
    saveTestTypes(testTypes);
  }
}

// Get score for product/testType/platform combination
export function getScore(productId, testTypeId, platformId, dateKey) {
  const scores = JSON.parse(localStorage.getItem('creativeScores') || '{}');
  return scores[productId]?.[testTypeId]?.[platformId]?.[dateKey]?.score || null;
}

// Save score for product/testType/platform combination
export function saveScore(productId, testTypeId, platformId, dateKey, score) {
  const scores = JSON.parse(localStorage.getItem('creativeScores') || '{}');
  
  if (!scores[productId]) scores[productId] = {};
  if (!scores[productId][testTypeId]) scores[productId][testTypeId] = {};
  if (!scores[productId][testTypeId][platformId]) scores[productId][testTypeId][platformId] = {};
  
  scores[productId][testTypeId][platformId][dateKey] = {
    score,
    date: new Date().toISOString()
  };
  
  localStorage.setItem('creativeScores', JSON.stringify(scores));
}

// Delete platform type and associated scores
export function deletePlatformType(platformId) {
  // Remove from platform types
  const platformTypes = getPlatformTypes();
  const filtered = platformTypes.filter(p => p.id !== platformId);
  savePlatformTypes(filtered);
  
  // Remove from all test types' allowed platforms
  const testTypes = getTestTypes();
  testTypes.forEach(testType => {
    if (testType.allowedPlatforms.includes(platformId)) {
      testType.allowedPlatforms = testType.allowedPlatforms.filter(p => p !== platformId);
    }
  });
  saveTestTypes(testTypes);
  
  // Remove all scores for this platform
  const scores = JSON.parse(localStorage.getItem('creativeScores') || '{}');
  Object.keys(scores).forEach(productId => {
    Object.keys(scores[productId]).forEach(testTypeId => {
      if (scores[productId][testTypeId][platformId]) {
        delete scores[productId][testTypeId][platformId];
      }
    });
  });
  localStorage.setItem('creativeScores', JSON.stringify(scores));
  
  return true;
}

// Delete test type and associated scores
export function deleteTestType(testTypeId) {
  // Remove from test types
  const testTypes = getTestTypes();
  const filtered = testTypes.filter(t => t.id !== testTypeId);
  saveTestTypes(filtered);
  
  // Remove all scores for this test type
  const scores = JSON.parse(localStorage.getItem('creativeScores') || '{}');
  Object.keys(scores).forEach(productId => {
    if (scores[productId][testTypeId]) {
      delete scores[productId][testTypeId];
    }
  });
  localStorage.setItem('creativeScores', JSON.stringify(scores));
  
  return true;
}

// Get all scores for a product
export function getProductScores(productId) {
  const scores = JSON.parse(localStorage.getItem('creativeScores') || '{}');
  return scores[productId] || {};
}