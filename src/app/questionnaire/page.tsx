'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  QuestionnaireContainer,
  type Question,
  type Answer,
} from '@/components/questionnaire/QuestionnaireContainer';
import { useToast } from '@/hooks/use-toast';

const sampleQuestions: Question[] = [
  {
    id: 'learning-goal',
    type: 'text',
    question: 'What is your main learning goal?',
    description:
      'Describe what you hope to achieve through this learning journey',
    required: true,
    validation: {
      min: 10,
      max: 500,
      message:
        'Please provide a detailed response between 10 and 500 characters',
    },
  },
  {
    id: 'preferred-content',
    type: 'multiple-choice',
    question: 'What types of content do you prefer?',
    description: 'Select all that apply',
    required: true,
    options: [
      { id: 'video', label: 'Video Lessons', value: 'video' },
      { id: 'text', label: 'Text-based Tutorials', value: 'text' },
      {
        id: 'interactive',
        label: 'Interactive Exercises',
        value: 'interactive',
      },
      { id: 'quiz', label: 'Practice Quizzes', value: 'quiz' },
      { id: 'project', label: 'Hands-on Projects', value: 'project' },
    ],
  },
  {
    id: 'experience-level',
    type: 'single-choice',
    question: 'What is your current experience level?',
    description: 'Choose the option that best describes your expertise',
    required: true,
    options: [
      { id: 'beginner', label: 'Beginner', value: 'beginner' },
      { id: 'intermediate', label: 'Intermediate', value: 'intermediate' },
      { id: 'advanced', label: 'Advanced', value: 'advanced' },
      { id: 'expert', label: 'Expert', value: 'expert' },
    ],
  },
  {
    id: 'daily-time',
    type: 'rating',
    question: 'How many hours can you dedicate to learning daily?',
    description: 'Rate from 1 (less than 1 hour) to 5 (more than 4 hours)',
    required: true,
    validation: {
      min: 1,
      max: 5,
    },
  },
  {
    id: 'mentor-interest',
    type: 'boolean',
    question: 'Would you be interested in having a mentor?',
    description: 'Mentors can provide personalized guidance and feedback',
    required: true,
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleComplete = async (answers: Answer[]) => {
    try {
      // Here you would typically send the answers to your backend
      await fetch('/api/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      toast({
        title: 'Questionnaire Complete!',
        description:
          "Thank you for your responses. We'll use this to personalize your experience.",
        variant: 'success',
      });

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to save questionnaire answers:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your responses. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = (answers: Answer[]) => {
    // Optionally save progress to local storage or backend
    localStorage.setItem('questionnaire-progress', JSON.stringify(answers));
  };

  return (
    <QuestionnaireContainer
      title="Learning Preferences Questionnaire"
      description="Help us understand your learning style and preferences"
      questions={sampleQuestions}
      onComplete={handleComplete}
      onSave={handleSave}
      initialAnswers={JSON.parse(
        localStorage.getItem('questionnaire-progress') || '[]'
      )}
    />
  );
}
