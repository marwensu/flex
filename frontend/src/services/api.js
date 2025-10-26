import axios from 'axios';

// Always use the backend deployment URL for production
const API_BASE_URL = 'https://flex-ba-mu.vercel.app/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 404) {
        console.error('Resource not found');
      } else if (status === 500) {
        console.error('Server error');
      }
      
      return Promise.reject(data || error);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      return Promise.reject({ message: 'No response from server. Please check if the backend is running.' });
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

// API Methods
export const reviewsAPI = {
  // Get all reviews from Hostaway
  getAllReviews: async () => {
    const response = await api.get('/reviews/hostaway');
    return response.data;
  },

  // Search reviews with filters
  searchReviews: async (filters) => {
    const params = new URLSearchParams();
    
    if (filters.listing) params.append('listing', filters.listing);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/reviews/search?${params.toString()}`);
    return response.data;
  },

  // Get review statistics
  getStats: async () => {
    const response = await api.get('/reviews/stats');
    return response.data;
  },

  // Get a specific review
  getReviewById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  // Approve a review
  approveReview: async (id) => {
    const response = await api.post(`/reviews/${id}/approve`);
    return response.data;
  },

  // Get approved reviews
  getApprovedReviews: async () => {
    const response = await api.get('/reviews/approved');
    return response.data;
  },

  // Remove approval (legacy)
  removeApproval: async (id) => {
    const response = await api.delete(`/reviews/approve/${id}`);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health', { baseURL: 'https://flex-ba-mu.vercel.app' });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
