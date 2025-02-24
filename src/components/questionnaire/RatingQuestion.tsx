'use client';

import React from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Question } from './QuestionnaireContainer';

interface RatingQuestionProps {
  question: Question;
  value: number;
  onChange: (value: number) => void;
}

export const RatingQuestion: React.FC<RatingQuestionProps> = ({
  question,
  value = 0,
  onChange,
}) => {
  const maxRating = question.validation?.max || 5;
  const labels = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

  const handleRatingClick = (rating: number) => {
    // Toggle off if clicking the same rating
    onChange(value === rating ? 0 : rating);
  };

  const handleRatingHover = (
    event: React.MouseEvent<HTMLDivElement>,
    rating: number
  ) => {
    const stars = event.currentTarget.parentElement?.children;
    if (!stars) return;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i] as HTMLElement;
      if (i < rating) {
        star.classList.add('text-yellow-400');
        star.classList.remove('text-gray-400');
      } else {
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-400');
      }
    }
  };

  const handleRatingLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const stars = event.currentTarget.parentElement?.children;
    if (!stars) return;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i] as HTMLElement;
      if (i < value) {
        star.classList.add('text-yellow-400');
        star.classList.remove('text-gray-400');
      } else {
        star.classList.remove('text-yellow-400');
        star.classList.add('text-gray-400');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div
          className="flex space-x-2"
          onMouseLeave={() => {
            const stars = document.querySelectorAll('.rating-star');
            stars.forEach((star, index) => {
              if (index < value) {
                star.classList.add('text-yellow-400');
                star.classList.remove('text-gray-400');
              } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-400');
              }
            });
          }}
        >
          {Array.from({ length: maxRating }).map((_, index) => (
            <div
              key={index}
              className={`rating-star cursor-pointer transition-all duration-200 ${
                index < value ? 'text-yellow-400' : 'text-gray-400'
              }`}
              onClick={() => handleRatingClick(index + 1)}
              onMouseEnter={(e) => handleRatingHover(e, index + 1)}
              onMouseLeave={handleRatingLeave}
            >
              {index < value ? (
                <StarSolid className="w-12 h-12" />
              ) : (
                <StarOutline className="w-12 h-12" />
              )}
            </div>
          ))}
        </div>
      </div>

      {value > 0 && (
        <div className="text-center">
          <span className="text-lg font-medium text-yellow-400">
            {labels[value - 1]}
          </span>
        </div>
      )}

      {question.required && value === 0 && (
        <p className="text-center text-red-500 text-sm">
          Please select a rating
        </p>
      )}
    </div>
  );
};
