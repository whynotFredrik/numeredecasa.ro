'use client';

import { useState } from 'react';
import { Star, Send, Loader2, Check } from 'lucide-react';

interface ReviewFormProps {
  productType?: string;
  orderId?: string;
}

export function ReviewForm({ productType, orderId }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Te rugăm să selectezi un rating (1-5 stele)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          rating,
          review_text: reviewText,
          product_type: productType || null,
          order_id: orderId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Eroare la trimiterea recenziei');
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError('A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Mulțumim pentru recenzie!</h3>
        <p className="text-foreground/60">
          Recenzia ta va fi publicată după verificare. Apreciem feedback-ul tău!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3 text-foreground/80">Rating</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-foreground/20'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-foreground/50 ml-2">
              {rating === 1 && 'Slab'}
              {rating === 2 && 'Acceptabil'}
              {rating === 3 && 'Bun'}
              {rating === 4 && 'Foarte bun'}
              {rating === 5 && 'Excelent'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Numele tău"
          className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresa de email"
          className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          required
        />
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Scrie recenzia ta aici... (minim 10 caractere)"
        rows={4}
        className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
        required
        minLength={10}
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Se trimite...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Trimite Recenzia
          </>
        )}
      </button>
    </form>
  );
}
