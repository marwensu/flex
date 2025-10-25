const fs = require("fs");
const path = require("path");
const axios = require("axios");
const normalizeReviews = require("../utils/normalizeReviews");
require('dotenv').config();

// Configuration
const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== 'false'; // Default to mock
const HOSTAWAY_API_BASE = 'https://api.hostaway.com/v1';
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY;

/**
 * Fetch reviews from real Hostaway API
 * Documentation: https://api.hostaway.com/v1/reviews
 */
async function fetchFromHostawayAPI() {
  try {
    console.log('🌐 Fetching reviews from Hostaway API...');
    
    const response = await axios.get(`${HOSTAWAY_API_BASE}/reviews`, {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        accountId: HOSTAWAY_ACCOUNT_ID,
        // Add any additional query parameters as needed
        // limit: 100,
        // offset: 0,
      },
      timeout: 10000, // 10 second timeout
    });
    
    console.log(`✅ Fetched ${response.data.result?.length || 0} reviews from Hostaway API`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching from Hostaway API:', error.message);
    
    if (error.response) {
      // API responded with error
      console.error('API Response:', error.response.status, error.response.data);
      throw new Error(`Hostaway API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // No response received
      throw new Error('Hostaway API: No response received. Please check your connection.');
    } else {
      // Request setup error
      throw new Error(`Hostaway API Request Error: ${error.message}`);
    }
  }
}

/**
 * Fetch reviews from mock data file
 */
async function fetchFromMockData() {
  try {
    console.log('📁 Loading reviews from mock data...');
    
    // Simulate API delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try multiple possible locations for mock data
    const possiblePaths = [
      path.join(__dirname, "../mock/reviews.json"),
      path.join(__dirname, "../data/mockReviews.json"),
      path.join(__dirname, "../data/reviews.json"),
    ];
    
    let mockDataPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        mockDataPath = testPath;
        break;
      }
    }
    
    if (!mockDataPath) {
      throw new Error('Mock data file not found. Please ensure mock/reviews.json exists.');
    }
    
    const rawData = fs.readFileSync(mockDataPath, 'utf8');
    const mockData = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${(mockData.result || []).length} reviews from mock data`);
    console.log(`� Source: ${mockDataPath}`);
    
    return mockData;
  } catch (error) {
    console.error('❌ Error loading mock reviews:', error.message);
    throw new Error(`Failed to load mock data: ${error.message}`);
  }
}

/**
 * Main function to fetch reviews (switches between mock and real API)
 */
async function fetchHostawayReviews() {
  console.log('\n🔄 Fetching Hostaway Reviews...');
  console.log(`🔑 Account ID: ${HOSTAWAY_ACCOUNT_ID}`);
  console.log(`🔧 Mode: ${USE_MOCK_DATA ? 'MOCK DATA' : 'REAL API'}`);
  
  try {
    if (USE_MOCK_DATA) {
      return await fetchFromMockData();
    } else {
      return await fetchFromHostawayAPI();
    }
  } catch (error) {
    console.error('❌ Error in fetchHostawayReviews:', error.message);
    throw error;
  }
}

/**
 * Get normalized reviews
 */
exports.getNormalizedReviews = async () => {
  try {
    const data = await fetchHostawayReviews();
    return normalizeReviews(data.result || data);
  } catch (error) {
    console.error('Error normalizing reviews:', error);
    throw error;
  }
};

/**
 * Synchronous version for backward compatibility
 */
exports.getNormalizedReviewsSync = () => {
  try {
    let mockDataPath = path.join(__dirname, "../mock/reviews.json");
    if (!fs.existsSync(mockDataPath)) {
      mockDataPath = path.join(__dirname, "../data/mockReviews.json");
    }
    const raw = fs.readFileSync(mockDataPath, 'utf8');
    const json = JSON.parse(raw);
    return normalizeReviews(json.result || json);
  } catch (error) {
    console.error("Error reading mock reviews:", error);
    return [];
  }
};

/**
 * Get reviews for a specific listing
 */
exports.getReviewsByListing = async (listingName) => {
  try {
    const reviews = await exports.getNormalizedReviews();
    return reviews.filter(review => 
      review.listing_name.toLowerCase().includes(listingName.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching reviews by listing:', error);
    throw error;
  }
};

/**
 * Get reviews by type (host-to-guest or guest-to-host)
 */
exports.getReviewsByType = async (type) => {
  try {
    const reviews = await exports.getNormalizedReviews();
    return reviews.filter(review => review.type === type);
  } catch (error) {
    console.error('Error fetching reviews by type:', error);
    throw error;
  }
};
