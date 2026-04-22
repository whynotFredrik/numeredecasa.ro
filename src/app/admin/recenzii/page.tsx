'use client';

import { useState, useEffect } from 'react';
import { Star, Check, X } from 'lucide-react';

interface Review {
  id: string;
  created_at: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  product_type: string;
  is_approved: boolean;
  is_featured: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string, isApproved: boolean) => {
    try {
      setUpdatingReviewId(reviewId);
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          is_approved: !isApproved,
        }),
      });

      if (!response.ok) throw new Error('Failed to update review');

      // Update local state
      setReviews(reviews.map(r => (r.id === reviewId ? { ...r, is_approved: !isApproved } : r)));
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Eroare la actualizarea recenziei');
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleFeature = async (reviewId: string, isFeatured: boolean) => {
    try {
      setUpdatingReviewId(reviewId);
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          is_featured: !isFeatured,
        }),
      });

      if (!response.ok) throw new Error('Failed to update review');

      // Update local state
      setReviews(reviews.map(r => (r.id === reviewId ? { ...r, is_featured: !isFeatured } : r)));
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Eroare la actualizarea recenziei');
    } finally {
      setUpdatingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-foreground/60">Se încarcă...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Eroare la încărcarea recenziilor</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const approvedReviews = reviews.filter(r => r.is_approved);
  const pendingReviews = reviews.filter(r => !r.is_approved);
  const featuredReviews = reviews.filter(r => r.is_featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Recenzii</h1>
        <p className="text-foreground/60">Gestionează recenziile clienților</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Total Recenzii</p>
          <p className="text-3xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">Aprobate</p>
          <p className="text-3xl font-bold text-green-600">{approvedReviews.length}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-6">
          <p className="text-sm text-foreground/60 mb-2">În Așteptare</p>
          <p className="text-3xl font-bold text-amber-600">{pendingReviews.length}</p>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recenzii în Așteptare ({pendingReviews.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onFeature={handleFeature}
                isUpdating={updatingReviewId === review.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Reviews */}
      {approvedReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recenzii Aprobate ({approvedReviews.length})</h2>
          <div className="grid grid-cols-1 gap-4">
            {approvedReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onFeature={handleFeature}
                isUpdating={updatingReviewId === review.id}
              />
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-foreground/10 p-8 text-center text-foreground/60">
          <p>Nu au fost găsite recenzii.</p>
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onApprove: (reviewId: string, isApproved: boolean) => void;
  onFeature: (reviewId: string, isFeatured: boolean) => void;
  isUpdating: boolean;
}

function ReviewCard({ review, onApprove, onFeature, isUpdating }: ReviewCardProps) {
  const productTypeLabels: Record<string, string> = {
    house: 'Număr de Casă',
    apartment: 'Număr de Apartament',
    office: 'Plăcuță de Birou',
  };

  return (
    <div
      className={`bg-card rounded-lg shadow-sm border transition-all ${
        review.is_featured
          ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent'
          : 'border-foreground/10'
      } p-6`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{review.customer_name}</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/60 mb-3">{review.customer_email}</p>
          <p className="text-sm text-foreground/80 line-clamp-3">{review.review_text}</p>
        </div>

        <div className="flex items-center gap-2 md:flex-col md:items-end">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
            {productTypeLabels[review.product_type] || review.product_type}
          </span>
          <span className="text-xs text-foreground/50">
            {new Date(review.created_at).toLocaleDateString('ro-RO')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onApprove(review.id, review.is_approved)}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
            review.is_approved
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <Check className="w-4 h-4" />
          {review.is_approved ? 'Aprobată' : 'Aprobă'}
        </button>

        <button
          onClick={() => onFeature(review.id, review.is_featured)}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
            review.is_featured
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          <Star className="w-4 h-4" />
          {review.is_featured ? 'Featured' : 'Featured?'}
        </button>

        <button
          onClick={() => onApprove(review.id, review.is_approved)}
          disabled={isUpdating}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Respinge
        </button>
      </div>
    </div>
  );
}
