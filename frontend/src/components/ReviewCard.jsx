import React from 'react';

export default function ReviewCard({ review, showProperty = true }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {review.guestName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{review.guestName}</h3>
            <p className="text-sm text-gray-500">{formatDate(review.submittedAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {renderStars(review.overallRating)}
          <span className="text-lg font-semibold text-gray-900">{review.overallRating}</span>
        </div>
      </div>

      {showProperty && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Property:</span> {review.listingName}
          </p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
      </div>

      {review.categories && review.categories.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Rating Categories</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {review.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <span className="text-sm text-gray-700">{cat.name}</span>
                <span className="text-sm font-semibold text-gray-900">{cat.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {review.checkInDate && review.checkOutDate && (
            <span>
              {new Date(review.checkInDate).toLocaleDateString()} - {new Date(review.checkOutDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>{review.channelName}</span>
        </div>
      </div>

      {review.privateReview && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">Private Review (Host Only)</p>
          <p className="text-sm text-yellow-700">{review.privateReview}</p>
        </div>
      )}
    </div>
  );
}
