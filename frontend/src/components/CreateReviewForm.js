'use client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_REVIEW } from '../graphql/mutations';

export default function CreateReviewForm({ tourId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [createReview, { loading, error }] = useMutation(CREATE_REVIEW);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReview({
      variables: {
        input: {
          tourId,
          rating: parseInt(rating),
          comment
        }
      }
    });
    alert('Review submitted!');
    setRating(5);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <input type="number" value={rating} min="1" max="5" onChange={e => setRating(e.target.value)} className="border p-2 w-full" required />
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment" className="border p-2 w-full" required />
      <button type="submit" disabled={loading} className="bg-yellow-600 text-white p-2 rounded w-full">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
      {error && <p className="text-red-500">Error submitting review</p>}
    </form>
  );
}
