'use client';

import React from 'react';
import { Question } from './QuestionnaireContainer';

interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value = '',
  onChange,
}) => {
  const { validation } = question;
  const isLongAnswer = validation?.max && validation.max > 100;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      {isLongAnswer ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Type your answer here..."
          rows={5}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-white placeholder-gray-400"
          maxLength={validation?.max}
          minLength={validation?.min}
          required={question.required}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type your answer here..."
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
          maxLength={validation?.max}
          minLength={validation?.min}
          pattern={validation?.pattern}
          required={question.required}
        />
      )}

      {validation && (
        <div className="flex justify-between text-sm text-gray-400">
          {validation.min && <span>Minimum {validation.min} characters</span>}
          {validation.max && (
            <span>
              {value.length} / {validation.max} characters
            </span>
          )}
        </div>
      )}

      {question.required && value.length === 0 && (
        <p className="text-red-500 text-sm">This field is required</p>
      )}

      {validation?.pattern &&
        !new RegExp(validation.pattern).test(value) &&
        value.length > 0 && (
          <p className="text-red-500 text-sm">
            {validation.message || 'Invalid format'}
          </p>
        )}
    </div>
  );
};
