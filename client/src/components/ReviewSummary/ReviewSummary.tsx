import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../config';
import './ReviewSummary.scss';

interface ReviewSummaryProps {
  movieId: number;
  userId?: number | null;
  reviewUpdated: boolean;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  movieId,
  userId,
  reviewUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<{
    total_reviews: number;
    average_rating: number | null; // Allow average_rating to be null
  } | null>(null);

  useEffect(() => {
    const fetchReviewSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        let apiUrl = `${baseUrl}/movies/${movieId}/reviews-summary`;
        if (userId) {
          apiUrl += `?userId=${userId}`;
        }

        const response = await axios.get(apiUrl);
        setReviewData(response.data);
      } catch (error: any) {
        setError('Failed to fetch review summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSummary();
  }, [movieId, userId, reviewUpdated]);

  if (loading) {
    return <div>Loading review summary...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="review-summary">
      {reviewData ? (
        <div>
          <p className="d-flex align-items-center">
            <h3 className="primary">{reviewData.total_reviews}</h3>&nbsp;(
            {reviewData.average_rating !== null &&
            !isNaN(reviewData.average_rating)
              ? reviewData.average_rating
              : 'No rating available'}
            )
          </p>
        </div>
      ) : (
        <p>No reviews available.</p>
      )}
    </div>
  );
};

export default ReviewSummary;
