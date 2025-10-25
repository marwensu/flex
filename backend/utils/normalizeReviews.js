/**
 * Normalize Hostaway review data to a consistent format
 * @param {Array} reviews - Raw review data from Hostaway API
 * @returns {Array} Normalized review objects
 */
module.exports = function normalizeReviews(reviews) {
  if (!Array.isArray(reviews)) {
    console.error('Invalid reviews data:', reviews);
    return [];
  }

  return reviews.map(review => {
    try {
      // Calculate average rating from categories
      const categoryRatings = review.reviewCategory || [];
      let avgRating = null;
      
      if (categoryRatings.length > 0) {
        const sum = categoryRatings.reduce((total, cat) => total + (cat.rating || 0), 0);
        avgRating = parseFloat((sum / categoryRatings.length).toFixed(2));
      } else if (review.rating !== null && review.rating !== undefined) {
        avgRating = parseFloat(review.rating);
      }

      // Convert category array to object for easier access
      const categories = {};
      categoryRatings.forEach(cat => {
        if (cat.category && cat.rating !== undefined) {
          categories[cat.category] = cat.rating;
        }
      });

      // Parse submitted date
      const submittedDate = new Date(review.submittedAt);
      const isValidDate = !isNaN(submittedDate.getTime());
      
      // Map listing names to IDs (for frontend compatibility)
      const listingIdMap = {
        '2B N1 A - 29 Shoreditch Heights': 101,
        '1B E1 A - 39 Shoreditch Heights': 102,
        'Beachfront Studio': 102,
        'Downtown Loft - 2BR': 101,
        'City Center Penthouse': 103,
        'Garden View Apartment': 104
      };
      
      const listingId = review.listingId || listingIdMap[review.listingName] || null;

      return {
        id: review.id,
        type: review.type,
        status: review.status,
        guest_name: review.guestName,
        listing_name: review.listingName,
        listing_id: listingId,
        average_rating: avgRating,
        comment: review.publicReview || '',
        categories: categories,
        submitted_at: review.submittedAt,
        
        // Additional computed fields for frontend
        is_host_review: review.type === 'host-to-guest',
        is_guest_review: review.type === 'guest-to-host',
        has_high_rating: avgRating ? avgRating >= 9 : false,
        rating_label: getRatingLabel(avgRating),
        formatted_date: isValidDate 
          ? submittedDate.toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : review.submittedAt,
        
        // For sorting and filtering
        timestamp: isValidDate ? submittedDate.getTime() : 0,
        year: isValidDate ? submittedDate.getFullYear() : null,
        month: isValidDate ? submittedDate.getMonth() + 1 : null,
        
        // Legacy fields for backward compatibility
        overallRating: avgRating,
        reviewText: review.publicReview || '',
        guestName: review.guestName,
        listingName: review.listingName,
      };
    } catch (error) {
      console.error('Error normalizing review:', review, error);
      return {
        id: review.id || 0,
        type: review.type || 'unknown',
        status: review.status || 'unknown',
        guest_name: review.guestName || 'Unknown',
        listing_name: review.listingName || 'Unknown',
        average_rating: null,
        comment: review.publicReview || '',
        categories: {},
        submitted_at: review.submittedAt || new Date().toISOString(),
      };
    }
  });
};

/**
 * Get a human-readable rating label
 * @param {number|null} rating - Average rating
 * @returns {string} Rating label
 */
function getRatingLabel(rating) {
  if (rating === null || rating === undefined) return 'No Rating';
  if (rating >= 9.5) return 'Excellent';
  if (rating >= 8.5) return 'Very Good';
  if (rating >= 7.5) return 'Good';
  if (rating >= 6.5) return 'Fair';
  return 'Poor';
}
