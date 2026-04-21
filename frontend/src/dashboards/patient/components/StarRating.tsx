import React from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (!readonly && onChange) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(rating);
      }
    }
  };

  return (
    <div 
      className="flex items-center space-x-1" 
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Rating: ${value} out of 5 stars` : 'Rate from 1 to 5 stars'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          disabled={readonly}
          role={readonly ? undefined : 'radio'}
          aria-checked={readonly ? undefined : star === value}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform ${
            readonly ? '' : 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded'
          }`}
        >
          <svg
            className={`${sizeClasses[size]} ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } ${readonly ? '' : 'hover:text-yellow-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
