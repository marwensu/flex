const fs = require("fs");
const path = require("path");
const normalizeReviews = require("../utils/normalizeReviews");
require('dotenv').config();

/**
 * Fetch reviews from Hostaway API (using mock data)
 * In production, this would make actual API calls to Hostaway
 */
async function fetchHostawayReviews() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Read mock data from file (try both locations)
    let mockDataPath = path.join(__dirname, "../mock/reviews.json");
    if (!fs.existsSync(mockDataPath)) {
      mockDataPath = path.join(__dirname, "../data/mockReviews.json");
    }
    
    const rawData = fs.readFileSync(mockDataPath, 'utf8');
    const mockData = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${(mockData.result || mockData).length} reviews from mock data`);
    console.log(`🔑 Using Account ID: ${process.env.HOSTAWAY_ACCOUNT_ID}`);
    
    return mockData;
  } catch (error) {
    console.error(' Error loading mock reviews:', error);
    throw new Error('Failed to fetch reviews: ' + error.message);
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
