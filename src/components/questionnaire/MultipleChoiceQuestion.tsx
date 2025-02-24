'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Question } from './QuestionnaireContainer';

interface MultipleChoiceQuestionProps {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  value = [],
  onChange,
}) => {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  if (!question.options) {
    return <div>Error: No options provided for multiple choice question</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleToggle(option.value)}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition text-left ${
              value.includes(option.value)
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-md border-2 transition ${
                  value.includes(option.value)
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-500'
                }`}
              >
                {value.includes(option.value) && (
                  <CheckIcon className="w-4 h-4" />
                )}
              </div>
              <span className="text-white">{option.label}</span>
            </div>
          </button>
        ))}
      </div>

      {question.required && value.length === 0 && (
        <p className="text-red-500 text-sm">
          Please select at least one option
        </p>
      )}
    </div>
  );
};
