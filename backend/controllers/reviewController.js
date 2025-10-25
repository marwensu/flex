const hostawayService = require('../services/hostawayService');

/**
 * Get all reviews from Hostaway (mocked data)
 */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await hostawayService.getNormalizedReviews();
    
    res.json({
      status: 'success',
      count: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Get reviews filtered by query parameters
 */
exports.getFilteredReviews = async (req, res) => {
  try {
    const { listing, minRating, type, status, startDate, endDate } = req.query;
    
    let reviews = await hostawayService.getNormalizedReviews();
    
    // Apply filters
    if (listing) {
      reviews = reviews.filter(r => 
        r.listing_name.toLowerCase().includes(listing.toLowerCase())
      );
    }
    
    if (minRating) {
      reviews = reviews.filter(r => 
        r.average_rating >= parseFloat(minRating)
      );
    }
    
    if (type) {
      reviews = reviews.filter(r => r.type === type);
    }
    
    if (status) {
      reviews = reviews.filter(r => r.status === status);
    }
    
    if (startDate) {
      reviews = reviews.filter(r => 
        new Date(r.submitted_at) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      reviews = reviews.filter(r => 
        new Date(r.submitted_at) <= new Date(endDate)
      );
    }
    
    res.json({
      status: 'success',
      count: reviews.length,
      filters: { listing, minRating, type, status, startDate, endDate },
      reviews: reviews
    });
  } catch (error) {
    console.error('Error filtering reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to filter reviews',
      error: error.message
    });
  }
};

/**
 * Get a single review by ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await hostawayService.getNormalizedReviews();
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    res.json({
      status: 'success',
      review: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

/**
 * Get statistics about reviews
 */
exports.getReviewStats = async (req, res) => {
  try {
    const reviews = await hostawayService.getNormalizedReviews();
    
    const stats = {
      total: reviews.length,
      by_type: {},
      by_status: {},
      by_listing: {},
      average_rating: 0,
      rating_distribution: {
        excellent: 0, // 9-10
        good: 0,      // 7-8.9
        average: 0,   // 5-6.9
        poor: 0       // <5
      }
    };
    
    let totalRating = 0;
    let ratingCount = 0;
    
    reviews.forEach(review => {
      // Count by type
      stats.by_type[review.type] = (stats.by_type[review.type] || 0) + 1;
      
      // Count by status
      stats.by_status[review.status] = (stats.by_status[review.status] || 0) + 1;
      
      // Count by listing
      stats.by_listing[review.listing_name] = (stats.by_listing[review.listing_name] || 0) + 1;
      
      // Calculate average rating
      if (review.average_rating) {
        totalRating += review.average_rating;
        ratingCount++;
        
        // Rating distribution
        if (review.average_rating >= 9) {
          stats.rating_distribution.excellent++;
        } else if (review.average_rating >= 7) {
          stats.rating_distribution.good++;
        } else if (review.average_rating >= 5) {
          stats.rating_distribution.average++;
        } else {
          stats.rating_distribution.poor++;
        }
      }
    });
    
    stats.average_rating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;
    
    res.json({
      status: 'success',
      stats: stats
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate statistics',
      error: error.message
    });
  }
};

/**
 * Approve a review (saves to approvedReviews.json)
 */
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');
    
    // Get all reviews to find the one to approve
    const allReviews = await hostawayService.getNormalizedReviews();
    const reviewToApprove = allReviews.find(r => r.id === parseInt(id));
    
    if (!reviewToApprove) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Path to approved reviews file
    const approvedPath = path.join(__dirname, "../data/approvedReviews.json");
    
    // Create directory if it doesn't exist
    const dir = path.dirname(approvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read current approved reviews
    let approved = [];
    if (fs.existsSync(approvedPath)) {
      const data = fs.readFileSync(approvedPath, 'utf8');
      approved = JSON.parse(data);
    }
    
    // Check if already approved
    if (approved.some(r => r.id === parseInt(id))) {
      return res.status(400).json({
        status: 'error',
        message: 'Review already approved'
      });
    }
    
    // Add approved timestamp and status
    reviewToApprove.approved_at = new Date().toISOString();
    reviewToApprove.is_approved = true;
    approved.push(reviewToApprove);
    
    // Save to file
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
    
    console.log(`✅ Review ${id} approved successfully`);
    
    res.json({
      status: 'success',
      message: `Review ${id} approved successfully`,
      review: reviewToApprove
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve review',
      error: error.message
    });
  }
};

/**
 * Get all approved reviews
 */
exports.getApprovedReviews = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const approvedPath = path.join(__dirname, "../data/approvedReviews.json");
    
    // Return empty array if file doesn't exist
    if (!fs.existsSync(approvedPath)) {
      return res.json({
        status: 'success',
        count: 0,
        reviews: []
      });
    }
    
    const data = fs.readFileSync(approvedPath, 'utf8');
    const approved = JSON.parse(data);
    
    // Filter by listingId if provided
    const { listingId } = req.query;
    let filteredReviews = approved;
    
    if (listingId) {
      filteredReviews = approved.filter(r => r.listing_id === parseInt(listingId));
    }
    
    res.json({
      status: 'success',
      count: filteredReviews.length,
      reviews: filteredReviews
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch approved reviews',
      error: error.message
    });
  }
};

/**
 * Remove approval from a review
 */
exports.unapproveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');
    const approvedPath = path.join(__dirname, "../data/approvedReviews.json");
    
    if (!fs.existsSync(approvedPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'No approved reviews found'
      });
    }
    
    const data = fs.readFileSync(approvedPath, 'utf8');
    let approved = JSON.parse(data);
    
    // Check if review exists
    const reviewIndex = approved.findIndex(r => r.id === parseInt(id));
    if (reviewIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found in approved list'
      });
    }
    
    // Remove the review
    approved.splice(reviewIndex, 1);
    
    // Save updated list
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
    
    console.log(`✅ Review ${id} unapproved successfully`);
    
    res.json({
      status: 'success',
      message: `Review ${id} removed from approved list`
    });
  } catch (error) {
    console.error('Error unapproving review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unapprove review',
      error: error.message
    });
  }
};
