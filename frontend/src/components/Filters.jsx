import React from 'react';

export default function Filters({ filters, setFilters, reviews }) {
  const channels = [...new Set(reviews.map(r => r.channelName))];
  const listings = [...new Set(reviews.map(r => r.listingName))];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
        </div>

        {/* Listing Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property
          </label>
          <select
            value={filters.listing}
            onChange={(e) => setFilters({ ...filters, listing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Properties</option>
            {listings.map(listing => (
              <option key={listing} value={listing}>{listing}</option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channel
          </label>
          <select
            value={filters.channel}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Channels</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.rating || filters.listing || filters.channel || filters.dateFrom || filters.dateTo) && (
        <div className="mt-4">
          <button
            onClick={() => setFilters({ rating: '', listing: '', channel: '', dateFrom: '', dateTo: '' })}
            className="text-sm text-primary hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
