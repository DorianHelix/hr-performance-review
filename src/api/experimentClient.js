// Client-side API wrapper for experiment/creative functionality
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Test Types API
export const testTypesApi = {
  async getAll() {
    return apiCall('/test-types');
  },

  async getById(id) {
    return apiCall(`/test-types/${id}`);
  },

  async create(testType) {
    return apiCall('/test-types', {
      method: 'POST',
      body: JSON.stringify(testType),
    });
  },

  async update(id, updates) {
    return apiCall(`/test-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return apiCall(`/test-types/${id}`, {
      method: 'DELETE',
    });
  },
};

// Platforms API
export const platformsApi = {
  async getAll() {
    return apiCall('/platforms');
  },

  async getById(id) {
    return apiCall(`/platforms/${id}`);
  },

  async create(platform) {
    return apiCall('/platforms', {
      method: 'POST',
      body: JSON.stringify(platform),
    });
  },

  async update(id, updates) {
    return apiCall(`/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return apiCall(`/platforms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Experiments API
export const experimentsApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/experiments${params ? `?${params}` : ''}`);
  },

  async getById(id) {
    return apiCall(`/experiments/${id}`);
  },

  async create(experiment) {
    return apiCall('/experiments', {
      method: 'POST',
      body: JSON.stringify(experiment),
    });
  },

  async update(id, updates) {
    return apiCall(`/experiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    return apiCall(`/experiments/${id}`, {
      method: 'DELETE',
    });
  },

  async pushToEvaluation(id) {
    return apiCall(`/experiments/${id}/push-to-evaluation`, {
      method: 'POST',
    });
  },
};

// Creative Scores API
export const creativeScoresApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/creative-scores${params ? `?${params}` : ''}`);
  },

  async saveScore(score) {
    return apiCall('/creative-scores', {
      method: 'POST',
      body: JSON.stringify(score),
    });
  },
};

// Export all APIs
export default {
  testTypes: testTypesApi,
  platforms: platformsApi,
  experiments: experimentsApi,
  creativeScores: creativeScoresApi,
};