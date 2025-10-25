import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { reviewsAPI } from '../services/api';

export default function PropertyPage() {
  const { listingId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock property data (in real app, fetch from API)
  const mockProperties = {
    '101': {
      id: 101,
      name: '2B N1 A - 29 Shoreditch Heights',
      description: 'Modern 2-bedroom apartment in the heart of Shoreditch with stunning city views and premium amenities.',
      location: 'Shoreditch, London',
      amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Washer', 'TV', 'Heating'],
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ]
    },
    '102': {
      id: 102,
      name: 'Beachfront Studio',
      description: 'Cozy beachfront studio with breathtaking ocean views. Perfect for a romantic getaway.',
      location: 'Brighton Beach, UK',
      amenities: ['WiFi', 'Kitchen', 'Ocean View', 'Parking'],
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ]
    }
  };

  useEffect(() => {
    fetchData();
  }, [listingId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get approved reviews from the API
      const response = await reviewsAPI.getApprovedReviews();
      
      // Handle different response formats (with or without wrapper)
      const allReviews = Array.isArray(response) ? response : (response.reviews || []);
      
      console.log('Approved reviews:', allReviews);
      console.log('Looking for listingId:', listingId);
      
      // Filter reviews for this specific listing
      const filtered = allReviews.filter(r => {
        // Try to match by listing_id first, then by name
        if (r.listing_id && r.listing_id.toString() === listingId) {
          return true;
        }
        
        // Fallback to name matching for mock data compatibility
        if (listingId === '101' && r.listing_name && r.listing_name.includes('Shoreditch')) {
          return true;
        }
        if (listingId === '102' && r.listing_name && r.listing_name.includes('Beachfront')) {
          return true;
        }
        
        return false;
      });
      
      console.log('Filtered reviews:', filtered);
      setReviews(filtered);
      
      // Set property info from mock data
      setProperty(mockProperties[listingId] || {
        id: listingId,
        name: 'Flex Living Property',
        description: 'Premium accommodation in prime location',
        location: 'London, UK',
        amenities: ['WiFi', 'Kitchen', 'TV'],
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load property data');
      setLoading(false);
      
      // Set default property even on error
      setProperty(mockProperties[listingId] || {
        id: listingId,
        name: 'Flex Living Property',
        description: 'Premium accommodation in prime location',
        location: 'London, UK',
        amenities: ['WiFi', 'Kitchen', 'TV'],
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Error loading property</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.average_rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image Gallery */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px]">
          <div className="relative h-[500px]">
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-full object-cover rounded-l-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {property.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative h-[245px]">
                <img 
                  src={img} 
                  alt={`${property.name} ${idx + 2}`}
                  className={`w-full h-full object-cover ${
                    idx === 1 || idx === 3 ? 'rounded-r-xl' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.name}
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{avgRating}</span>
                    <span className="mx-1">·</span>
                    <span className="text-gray-600">{reviews.length} reviews</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Info */}
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Up to {property.maxGuests} guests</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Guest Reviews
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center mb-6">
                    <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                      <svg className="w-8 h-8 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
                        <div className="text-sm text-gray-600">{reviews.length} reviews</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {review.guest_name?.charAt(0) || 'G'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{review.guest_name}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(review.submitted_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-semibold text-gray-900">{review.average_rating}/10</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          
                          {/* Category Ratings */}
                          {review.categories && Object.keys(review.categories).length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(review.categories).map(([category, rating]) => (
                                <div key={category} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                                  <span className="text-sm text-gray-600 capitalize">
                                    {category.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">{rating}/10</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to review this property!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  £150 <span className="text-base font-normal text-gray-600">/ night</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-sm">{avgRating}</span>
                    <span className="text-sm text-gray-600 ml-1">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-in</label>
                  <input type="date" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-out</label>
                  <input type="date" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Guests</label>
                  <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                    {[...Array(property.maxGuests)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                Reserve
              </button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                You won't be charged yet
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">£150 x 5 nights</span>
                  <span className="text-gray-900">£750</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span className="text-gray-900">£50</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Service fee</span>
                  <span className="text-gray-900">£100</span>
                </div>
                <div className="flex justify-between font-semibold text-base mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>£900</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Google Reviews Integration Available
              </h3>
              <p className="text-gray-700 mb-4">
                This property is also listed on Google My Business. You can view additional reviews from Google users.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">How Google Reviews Work:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Reviews are fetched directly from Google Places API</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Real-time ratings and verified guest feedback</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Displays alongside property reviews for complete transparency</span>
                  </li>
                </ul>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                View Google Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
