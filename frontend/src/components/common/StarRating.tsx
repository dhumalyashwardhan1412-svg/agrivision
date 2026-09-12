import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (val: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showScore?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  maxStars = 5,
  size = 'md',
  readOnly = false,
  showScore = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starNumber = idx + 1;
        const isFilled = starNumber <= Math.round(value);

        return (
          <button
            type="button"
            key={idx}
            disabled={readOnly}
            onClick={() => onChange && onChange(starNumber)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} p-0.5`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}

      {showScore && (
        <span className="ml-1 text-sm font-semibold text-slate-700">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
};
