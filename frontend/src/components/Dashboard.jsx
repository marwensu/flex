import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import ReviewTable from './ReviewTable';
import Filters from './Filters';

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    listing: '',
    minRating: '',
    type: '',
    status: '',
    search: '',
  });
  
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [reviews, filters, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsData, statsData] = await Promise.all([
        reviewsAPI.getAllReviews(),
        reviewsAPI.getStats(),
      ]);
      
      setReviews(reviewsData.reviews || []);
      setStats(statsData.stats);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data. Make sure the backendddd is running on https://flex-ba-mu.vercel.app');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];
    
    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.guest_name?.toLowerCase().includes(searchLower) ||
        r.listing_name?.toLowerCase().includes(searchLower) ||
        r.comment?.toLowerCase().includes(searchLower)
      );
    }
    
    // Listing filter
    if (filters.listing) {
      filtered = filtered.filter(r => 
        r.listing_name?.toLowerCase().includes(filters.listing.toLowerCase())
      );
    }
    
    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(r => 
        r.average_rating >= parseFloat(filters.minRating)
      );
    }
    
    // Type filter
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = (a.timestamp || 0) - (b.timestamp || 0);
          break;
        case 'rating':
          comparison = (a.average_rating || 0) - (b.average_rating || 0);
          break;
        case 'name':
          comparison = (a.guest_name || '').localeCompare(b.guest_name || '');
          break;
        case 'listing':
          comparison = (a.listing_name || '').localeCompare(b.listing_name || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId) => {
    try {
      await reviewsAPI.approveReview(reviewId);
      alert('Review approved successfully!');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error approving review:', err);
      alert('Failed to approve review');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      listing: '',
      minRating: '',
      type: '',
      status: '',
      search: '',
    });
  };

  const getUniqueListings = () => {
    return [...new Set(reviews.map(r => r.listing_name))].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Average Rating</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.average_rating}/10</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Published</div>
              <div className="text-3xl font-bold text-green-600">{stats.by_status?.published || 0}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Excellent (9-10)</div>
              <div className="text-3xl font-bold text-blue-600">{stats.rating_distribution?.excellent || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filters.listing}
              onChange={(e) => handleFilterChange('listing', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Listings</option>
              {getUniqueListings().map(listing => (
                <option key={listing} value={listing}>{listing}</option>
              ))}
            </select>
            
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="9">9+ Excellent</option>
              <option value="8">8+ Very Good</option>
              <option value="7">7+ Good</option>
              <option value="5">5+ Fair</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="guest-to-host">Guest to Host</option>
              <option value="host-to-guest">Host to Guest</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="listing">Sort by Listing</option>
            </select>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </span>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <ReviewTable 
        reviews={filteredReviews}
        onApprove={handleApprove}
      />
    </div>
  );
}
