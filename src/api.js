// API helper functions for backend communication

const API_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Employee APIs
export const employeeAPI = {
  getAll: () => apiCall('/employees'),
  
  getById: (id) => apiCall(`/employees/${id}`),
  
  create: (employee) => apiCall('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  
  update: (id, employee) => apiCall(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  }),
  
  delete: (id) => apiCall(`/employees/${id}`, {
    method: 'DELETE',
  }),
};

// Product APIs
export const productAPI = {
  getAll: () => apiCall('/products'),
  
  getById: (id) => apiCall(`/products/${id}`),
  
  create: (product) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  
  update: (id, product) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Score APIs
export const scoreAPI = {
  getScores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/scores${query ? `?${query}` : ''}`);
  },
  
  saveScore: (scoreData) => apiCall('/scores', {
    method: 'POST',
    body: JSON.stringify(scoreData),
  }),
  
  deleteScore: (employeeId, date, category) => 
    apiCall(`/scores/${employeeId}/${date}/${category}`, {
      method: 'DELETE',
    }),
};

// Category APIs
export const categoryAPI = {
  getAll: () => apiCall('/categories'),
  
  saveAll: (categories) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify(categories),
  }),
};

// Migration API
export const migrationAPI = {
  migrateFromLocalStorage: async () => {
    // Get data from localStorage
    const employees = JSON.parse(localStorage.getItem('hr_employees') || '[]');
    const scores = JSON.parse(localStorage.getItem('hr_scores') || '{}');
    const categories = JSON.parse(localStorage.getItem('hr_categories') || '[]');
    
    // Send to backend
    return apiCall('/migrate', {
      method: 'POST',
      body: JSON.stringify({ employees, scores, categories }),
    });
  },
};

// Health check
export const healthCheck = () => apiCall('/health');

// Export all APIs
export default {
  employees: employeeAPI,
  products: productAPI,
  scores: scoreAPI,
  categories: categoryAPI,
  migration: migrationAPI,
  health: healthCheck,
};