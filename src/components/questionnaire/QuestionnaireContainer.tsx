'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { TextQuestion } from './TextQuestion';
import { RatingQuestion } from './RatingQuestion';
import { BooleanQuestion } from './BooleanQuestion';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'single-choice' | 'text' | 'rating' | 'boolean';
  question: string;
  description?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean;
  timestamp: number;
}

interface QuestionnaireContainerProps {
  title: string;
  description?: string;
  questions: Question[];
  onComplete: (answers: Answer[]) => void;
  onSave?: (answers: Answer[]) => void;
  initialAnswers?: Answer[];
}

export const QuestionnaireContainer: React.FC<QuestionnaireContainerProps> = ({
  title,
  description,
  questions,
  onComplete,
  onSave,
  initialAnswers = [],
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const validateAnswer = (questionId: string, value: any): boolean => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return true;

    if (
      question.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      setError('This question is required');
      return false;
    }

    if (question.validation) {
      const { min, max, pattern } = question.validation;

      if (typeof value === 'string') {
        if (min && value.length < min) {
          setError(`Answer must be at least ${min} characters`);
          return false;
        }
        if (max && value.length > max) {
          setError(`Answer must be no more than ${max} characters`);
          return false;
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          setError(question.validation.message || 'Invalid format');
          return false;
        }
      }

      if (typeof value === 'number') {
        if (min && value < min) {
          setError(`Value must be at least ${min}`);
          return false;
        }
        if (max && value > max) {
          setError(`Value must be no more than ${max}`);
          return false;
        }
      }
    }

    setError(null);
    return true;
  };

  const handleAnswerChange = (value: string | string[] | number | boolean) => {
    if (!validateAnswer(currentQuestion.id, value)) {
      return;
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value,
      timestamp: Date.now(),
    };

    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.questionId === currentQuestion.id
      );
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = newAnswer;
        return newAnswers;
      }
      return [...prev, newAnswer];
    });

    // Call onSave if provided
    onSave?.(answers);
  };

  const handleNext = () => {
    const currentAnswer = answers.find(
      (a) => a.questionId === currentQuestion.id
    );

    if (currentQuestion.required && !currentAnswer) {
      setError('This question is required');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex((prev) => prev + 1);
      setError(null);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
      setError(null);
    }
  };

  const getCurrentAnswer = () => {
    return answers.find((a) => a.questionId === currentQuestion.id)?.value;
  };

  const renderQuestion = () => {
    const currentValue = getCurrentAnswer();

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            value={(currentValue as string[]) || []}
            onChange={handleAnswerChange}
          />
        );

      case 'single-choice':
        return (
          <SingleChoiceQuestion
            question={currentQuestion}
            value={(currentValue as string) || ''}
            onChange={handleAnswerChange}
          />
        );

      case 'text':
        return (
          <TextQuestion
            question={currentQuestion}
            value={(currentValue as string) || ''}
            onChange={handleAnswerChange}
          />
        );

      case 'rating':
        return (
          <RatingQuestion
            question={currentQuestion}
            value={(currentValue as number) || 0}
            onChange={handleAnswerChange}
          />
        );

      case 'boolean':
        return (
          <BooleanQuestion
            question={currentQuestion}
            value={(currentValue as boolean) || null}
            onChange={handleAnswerChange}
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-700">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-gray-400">{description}</p>}
        </div>

        {/* Question Content */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-800 p-6">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-medium">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-400">{currentQuestion.description}</p>
                )}

                {renderQuestion()}

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition
              ${
                currentQuestionIndex === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-gray-700'
              }`}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg transition"
          >
            <span>
              {currentQuestionIndex === questions.length - 1
                ? 'Complete'
                : 'Next'}
            </span>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
