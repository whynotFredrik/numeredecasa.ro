'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';

interface Review {
  id: string;
  created_at: string;
  customer_name: string;
  rating: number;
  review_text: string;
  product_type: string | null;
  is_featured: boolean;
}

interface ReviewsSectionProps {
  productType?: string;
  showForm?: boolean;
  variant?: 'homepage' | 'product';
  title?: string;
  subtitle?: string;
}

export function ReviewsSection({
  productType,
  showForm = false,
  variant = 'homepage',
  title = 'Ce spun clienții noștri',
  subtitle = 'Recenzii reale de la clienți mulțumiți care au ales produsele noastre.',
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const reviewsPerPage = variant === 'homepage' ? 3 : 4;

  useEffect(() => {
    async function fetchReviews() {
      try {
        const params = new URLSearchParams({ limit: '20' });
        if (productType) params.set('product_type', productType);
        if (variant === 'homepage') params.set('featured', 'true');

        const response = await fetch(`/api/reviews?${params.toString()}`);
        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Eroare la încărcarea recenziilor:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productType, variant]);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const displayedReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  // Calculare medie rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-foreground/5 rounded-xl w-64 mx-auto"></div>
            <div className="h-4 bg-foreground/5 rounded-xl w-96 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-foreground/5 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={variant === 'homepage' ? 'mt-32 max-w-7xl w-full' : 'mt-16'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title.split(' ').map((word, i, arr) =>
              i === arr.length - 1 ? (
                <span key={i} className="text-primary italic font-serif">{word}</span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-foreground/60 max-w-xl">{subtitle}</p>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(parseFloat(averageRating))
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{averageRating}</span>
              <span className="text-sm text-foreground/50">({reviews.length} recenzii)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {showForm && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm border border-primary/20 px-4 py-2 rounded-full hover:bg-primary/5"
            >
              <MessageSquare className="w-4 h-4" />
              {showReviewForm ? 'Ascunde formularul' : 'Scrie o recenzie'}
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && showReviewForm && (
        <div className="mb-12 p-8 rounded-3xl bg-foreground/[0.03] border border-foreground/5">
          <h3 className="text-xl font-bold mb-6">Scrie o recenzie</h3>
          <ReviewForm productType={productType} />
        </div>
      )}

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className={`grid gap-6 ${
          variant === 'homepage'
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              customerName={review.customer_name}
              rating={review.rating}
              reviewText={review.review_text}
              productType={review.product_type || undefined}
              createdAt={review.created_at}
              variant={variant === 'homepage' ? 'compact' : 'default'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
          <MessageSquare className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <p className="text-foreground/50 mb-2">Încă nu există recenzii{productType ? ' pentru acest produs' : ''}.</p>
          {showForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-primary font-semibold hover:underline text-sm"
            >
              Fii primul care scrie o recenzie!
            </button>
          )}
        </div>
      )}
    </div>
  );
}
