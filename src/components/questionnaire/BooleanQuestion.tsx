'use client';

import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Question } from './QuestionnaireContainer';

interface BooleanQuestionProps {
  question: Question;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export const BooleanQuestion: React.FC<BooleanQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange(true)}
          className={`flex items-center justify-center space-x-3 p-6 rounded-lg border-2 transition ${
            value === true
              ? 'border-green-500 bg-green-500/10 text-green-500'
              : 'border-gray-700 hover:border-gray-600 text-white'
          }`}
        >
          <CheckCircleIcon className="w-8 h-8" />
          <span className="text-lg font-medium">Yes</span>
        </button>

        <button
          onClick={() => onChange(false)}
          className={`flex items-center justify-center space-x-3 p-6 rounded-lg border-2 transition ${
            value === false
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-gray-700 hover:border-gray-600 text-white'
          }`}
        >
          <XCircleIcon className="w-8 h-8" />
          <span className="text-lg font-medium">No</span>
        </button>
      </div>

      {question.required && value === null && (
        <p className="text-center text-red-500 text-sm">
          Please select an option
        </p>
      )}
    </div>
  );
};
