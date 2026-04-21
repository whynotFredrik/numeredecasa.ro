'use client';

import { Star } from 'lucide-react';

interface ReviewCardProps {
  customerName: string;
  rating: number;
  reviewText: string;
  productType?: string;
  createdAt: string;
  variant?: 'default' | 'compact';
}

function getProductLabel(type?: string): string {
  switch (type) {
    case 'house': return 'Număr de Casă';
    case 'apartment': return 'Număr de Apartament';
    case 'office': return 'Plăcuță de Birou';
    default: return '';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ReviewCard({ customerName, rating, reviewText, productType, createdAt, variant = 'default' }: ReviewCardProps) {
  const productLabel = getProductLabel(productType);

  if (variant === 'compact') {
    return (
      <div className="p-6 rounded-2xl bg-background border border-foreground/5 shadow-lg shadow-foreground/5 hover:shadow-xl transition-shadow w-[340px] min-w-[340px] flex flex-col">
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-foreground/20'}`}
            />
          ))}
        </div>
        <p className="text-foreground/80 text-sm leading-relaxed mb-4 flex-grow">&ldquo;{reviewText}&rdquo;</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground/90">{customerName}</span>
          {productLabel && (
            <span className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded-full">{productLabel}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-3xl bg-background border border-foreground/5 shadow-xl shadow-foreground/5 hover:border-primary/10 transition-all">
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-foreground/20'}`}
          />
        ))}
      </div>
      <p className="text-foreground/80 leading-relaxed mb-6 text-base">&ldquo;{reviewText}&rdquo;</p>
      <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
        <div>
          <span className="font-semibold text-foreground/90">{customerName}</span>
          {productLabel && (
            <span className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded-full ml-3">{productLabel}</span>
          )}
        </div>
        <span className="text-xs text-foreground/40">{formatDate(createdAt)}</span>
      </div>
    </div>
  );
}
