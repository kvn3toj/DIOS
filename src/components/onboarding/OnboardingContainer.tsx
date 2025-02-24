'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle?: string;
  component: React.ReactNode;
  isOptional?: boolean;
}

interface OnboardingContainerProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const currentStep = steps[currentStepIndex];

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

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip && currentStep.isOptional) {
      onSkip();
    } else {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-700">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{currentStep.title}</h1>
          {currentStep.subtitle && (
            <p className="text-gray-400">{currentStep.subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-800 p-6">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentStepIndex}
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
              {currentStep.component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition
              ${
                currentStepIndex === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-gray-700'
              }`}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex space-x-4">
            {currentStep.isOptional && (
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-400 hover:text-white transition"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg transition"
            >
              <span>
                {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
              </span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
