# 🔍 Google Reviews Integration Guide

## Overview

This document explains how to integrate Google Reviews into the Flex Living Reviews Dashboard using the Google Places API.

## 📋 Table of Contents
1. [Why Google Reviews](#why-google-reviews)
2. [Setup Requirements](#setup-requirements)
3. [Implementation Steps](#implementation-steps)
4. [API Limitations](#api-limitations)
5. [Alternative Solutions](#alternative-solutions)
6. [Code Examples](#code-examples)

---

## Why Google Reviews

### Benefits
- **✅ Verified Reviews**: Google reviews come from verified users
- **✅ Increased Trust**: Displaying Google reviews alongside your own builds credibility
- **✅ SEO Benefits**: Google reviews improve search engine rankings
- **✅ Wider Reach**: Potential guests can find your property through Google Search/Maps

### Use Cases
1. Display Google reviews on property pages
2. Aggregate ratings from multiple sources
3. Respond to Google reviews directly from your dashboard
4. Monitor overall reputation across platforms

---

## Setup Requirements

### 1. Google Cloud Account
- Sign up at [Google Cloud Console](https://console.cloud.google.com)
- Billing must be enabled (free tier available)
- Credit card required (charged only after free credits expire)

### 2. Enable Google Places API
```bash
# Steps:
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Navigate to "APIs & Services" → "Library"
4. Search for "Places API"
5. Click "Enable"
```

### 3. Create API Credentials
```bash
# Steps:
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "API Key"
3. Copy your API key
4. (Recommended) Click "Restrict Key":
   - Application restrictions: HTTP referrers
   - API restrictions: Places API only
```

### 4. Get Place IDs
Each property needs a unique Google Place ID:

```bash
# Method 1: Use Place ID Finder
https://developers.google.com/maps/documentation/places/web-service/place-id

# Method 2: Search on Google Maps
1. Find your property on Google Maps
2. Click "Share"
3. Copy the URL
4. Extract the Place ID from the URL
```

---

## Implementation Steps

### Backend Implementation

#### Step 1: Install Required Packages
```bash
cd backend
npm install @googlemaps/google-maps-services-js dotenv
```

#### Step 2: Add Environment Variables
```env
# backend/.env
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID_SHOREDITCH=ChIJdd4hrwug2EcRmSrV3Vo6llI
GOOGLE_PLACE_ID_BEACHFRONT=ChIJ1234567890abcdef
```

#### Step 3: Create Google Service
```javascript
// backend/services/googleReviewsService.js
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

/**
 * Fetch reviews from Google Places API
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details with reviews
 */
exports.getPlaceReviews = async (placeId) => {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'name',
          'rating',
          'user_ratings_total',
          'reviews'
        ],
        key: process.env.GOOGLE_PLACES_API_KEY,
      },
      timeout: 5000
    });
    
    if (response.data.status === 'OK') {
      return {
        success: true,
        data: response.data.result
      };
    } else {
      throw new Error(`Google API Error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Normalize Google reviews to match our format
 * @param {Array} googleReviews - Raw Google reviews
 * @param {string} listingName - Property name
 * @returns {Array} Normalized reviews
 */
exports.normalizeGoogleReviews = (googleReviews, listingName) => {
  return googleReviews.map(review => ({
    id: `google_${review.time}`,
    guest_name: review.author_name,
    listing_name: listingName,
    average_rating: review.rating, // Google uses 1-5 scale
    comment: review.text,
    submitted_at: new Date(review.time * 1000).toISOString(),
    source: 'Google',
    profile_photo: review.profile_photo_url,
    relative_time: review.relative_time_description
  }));
};
```

#### Step 4: Add API Route
```javascript
// backend/routes/reviews.js
const googleReviewsService = require('../services/googleReviewsService');

// GET Google reviews for a specific place
router.get("/google/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const result = await googleReviewsService.getPlaceReviews(placeId);
    
    if (result.success) {
      const normalized = googleReviewsService.normalizeGoogleReviews(
        result.data.reviews || [],
        result.data.name
      );
      
      res.json({
        status: "success",
        place: {
          name: result.data.name,
          rating: result.data.rating,
          total_reviews: result.data.user_ratings_total
        },
        reviews: normalized
      });
    } else {
      res.status(500).json({
        status: "error",
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// GET combined reviews (Hostaway + Google)
router.get("/combined/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Get Hostaway reviews
    const hostawayReviews = await hostawayService.getNormalizedReviews();
    const filtered = hostawayReviews.filter(r => r.listing_id === listingId);
    
    // Get Google reviews
    const placeId = process.env[`GOOGLE_PLACE_ID_${listingId}`];
    let googleReviews = [];
    
    if (placeId) {
      const googleResult = await googleReviewsService.getPlaceReviews(placeId);
      if (googleResult.success) {
        googleReviews = googleReviewsService.normalizeGoogleReviews(
          googleResult.data.reviews || [],
          googleResult.data.name
        );
      }
    }
    
    res.json({
      status: "success",
      hostaway_reviews: filtered,
      google_reviews: googleReviews,
      total: filtered.length + googleReviews.length
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});
```

### Frontend Implementation

#### Step 5: Update API Service
```javascript
// frontend/src/services/api.js

export const reviewsAPI = {
  //...existing code...
  
  // Get Google reviews
  getGoogleReviews: async (placeId) => {
    const response = await axios.get(`${API_BASE_URL}/reviews/google/${placeId}`);
    return response.data;
  },
  
  // Get combined reviews
  getCombinedReviews: async (listingId) => {
    const response = await axios.get(`${API_BASE_URL}/reviews/combined/${listingId}`);
    return response.data;
  }
};
```

#### Step 6: Create Google Reviews Component
```jsx
// frontend/src/components/GoogleReviews.jsx
import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';

export default function GoogleReviews({ placeId }) {
  const [reviews, setReviews] = useState([]);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoogleReviews();
  }, [placeId]);

  const fetchGoogleReviews = async () => {
    try {
      const data = await reviewsAPI.getGoogleReviews(placeId);
      setPlaceInfo(data.place);
      setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading Google reviews...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <img 
          src="/google-logo.png" 
          alt="Google" 
          className="w-8 h-8 mr-2"
        />
        <h3 className="text-xl font-bold">Google Reviews</h3>
      </div>
      
      {placeInfo && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center">
            <div className="text-3xl font-bold mr-2">{placeInfo.rating}</div>
            <div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(placeInfo.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {placeInfo.total_reviews} reviews on Google
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex items-start space-x-3">
              {review.profile_photo && (
                <img 
                  src={review.profile_photo}
                  alt={review.guest_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{review.guest_name}</h4>
                  <span className="text-sm text-gray-500">{review.relative_time}</span>
                </div>
                <div className="flex items-center my-1">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-4 h-4 ${i < review.average_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## API Limitations

### Quota Limits
- **Free Tier**: $200/month credit (≈ 40,000 requests)
- **Cost**: $0.017 per Place Details request
- **Max Reviews**: Returns only the 5 most helpful reviews

### Rate Limits
- **Requests**: 1,000 requests per 100 seconds
- **Caching**: Cache results for 24 hours to avoid excessive calls

### Restrictions
- Cannot fetch reviews older than 1 year
- Limited control over which reviews are returned
- No ability to filter by rating or date
- Cannot access review responses programmatically

### Best Practices
```javascript
// Cache Google reviews
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

exports.getCachedPlaceReviews = async (placeId) => {
  const cached = cache.get(placeId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await exports.getPlaceReviews(placeId);
  cache.set(placeId, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};
```

---

## Alternative Solutions

### 1. Google My Business API
**Pros**:
- More control over reviews
- Can respond to reviews
- Access to insights and analytics

**Cons**:
- Requires business verification
- More complex setup
- Limited to your own properties

### 2. Third-Party Review Aggregators
- **Trustpilot**: Centralized review platform
- **Yotpo**: E-commerce focused
- **Bazaarvoice**: Enterprise solution

### 3. Web Scraping (Not Recommended)
**⚠️ Warning**: Violates Google's Terms of Service
- Can lead to IP bans
- Legally risky
- Unreliable and breaks easily

---

## Testing

### Test with Sample Place IDs
```javascript
// Use famous landmarks for testing
const TEST_PLACE_IDS = {
  'British Museum': 'ChIJB9OTMDIbdkgRp0JWbQGZsS8',
  'Tower of London': 'ChIJN3UznROa2IcRhU6pXnInY3c',
  'Hyde Park': 'ChIJF3NfWfIEdkgRrR7WTovJFr4'
};

// Test API call
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJB9OTMDIbdkgRp0JWbQGZsS8&fields=name,rating,reviews&key=YOUR_API_KEY"
```

---

## Cost Estimation

### Monthly Usage Example
```
Scenario: 10 properties, 100 views per property per day

Calculations:
- Requests per day: 10 properties × 1 request = 10
- Requests per month: 10 × 30 days = 300
- Cost: 300 × $0.017 = $5.10/month

With caching (24hr):
- Requests per month: 10 × 30 = 300
- Cost: $5.10/month

Without caching:
- Requests per month: 10 × 100 × 30 = 30,000
- Cost: 30,000 × $0.017 = $510/month
```

**💡 Tip**: Always implement caching to reduce costs!

---

## Conclusion

### Current Implementation Status
✅ Architecture designed and documented  
✅ Backend service structure created  
✅ Frontend components planned  
⚠️ Requires Google API key to activate  
⚠️ Requires billing setup on Google Cloud  

### Next Steps
1. Create Google Cloud project
2. Enable Places API
3. Get API key
4. Find Place IDs for properties
5. Add environment variables
6. Install dependencies
7. Test with sample data
8. Deploy to production

### Support
For issues or questions:
- Google Places API Docs: https://developers.google.com/maps/documentation/places
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-places-api
- GitHub Issues: [Your Repo]/issues

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0
