'use client';

import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import * as Slider from '@radix-ui/react-slider';

interface ContentPreferencesStepProps {
  onDataChange: (data: ContentPreferences) => void;
  initialData?: ContentPreferences;
}

interface ContentPreferences {
  contentTypes: string[];
  learningStyle: string;
  dailyGoal: number;
  difficulty: string;
  language: string;
}

const CONTENT_TYPES = [
  { id: 'videos', label: 'Video Courses', icon: '🎥' },
  { id: 'articles', label: 'Articles', icon: '📚' },
  { id: 'tutorials', label: 'Interactive Tutorials', icon: '💻' },
  { id: 'podcasts', label: 'Podcasts', icon: '🎧' },
  { id: 'quizzes', label: 'Practice Quizzes', icon: '✍️' },
  { id: 'workshops', label: 'Live Workshops', icon: '👥' },
];

const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'Visual Learner',
    description: 'Learn best through images and videos',
  },
  {
    id: 'auditory',
    label: 'Auditory Learner',
    description: 'Learn best through listening and discussion',
  },
  {
    id: 'reading',
    label: 'Reading/Writing',
    description: 'Learn best through written content',
  },
  {
    id: 'kinesthetic',
    label: 'Hands-on Learner',
    description: 'Learn best through practice and doing',
  },
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
  { id: 'pt', label: 'Portuguese' },
];

export const ContentPreferencesStep: React.FC<ContentPreferencesStepProps> = ({
  onDataChange,
  initialData,
}) => {
  const [preferences, setPreferences] = useState<ContentPreferences>({
    contentTypes: initialData?.contentTypes || [],
    learningStyle: initialData?.learningStyle || '',
    dailyGoal: initialData?.dailyGoal || 30,
    difficulty: initialData?.difficulty || 'beginner',
    language: initialData?.language || 'en',
  });

  const handleContentTypeToggle = (contentType: string) => {
    const newTypes = preferences.contentTypes.includes(contentType)
      ? preferences.contentTypes.filter((t) => t !== contentType)
      : [...preferences.contentTypes, contentType];

    const newPreferences = {
      ...preferences,
      contentTypes: newTypes,
    };
    setPreferences(newPreferences);
    onDataChange(newPreferences);
  };

  const handlePreferenceChange = (
    key: keyof ContentPreferences,
    value: any
  ) => {
    const newPreferences = {
      ...preferences,
      [key]: value,
    };
    setPreferences(newPreferences);
    onDataChange(newPreferences);
  };

  return (
    <div className="space-y-8">
      {/* Content Types */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Content Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleContentTypeToggle(type.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                preferences.contentTypes.includes(type.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <span className="font-medium block">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Style */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Learning Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEARNING_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handlePreferenceChange('learningStyle', style.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                preferences.learningStyle === style.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="font-medium block">{style.label}</span>
              <span className="text-sm text-gray-400">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Goal */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Daily Learning Goal
        </h3>
        <div className="px-4">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[preferences.dailyGoal]}
            onValueChange={([value]) =>
              handlePreferenceChange('dailyGoal', value)
            }
            max={120}
            min={15}
            step={15}
          >
            <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-5 h-5 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Daily goal"
            />
          </Slider.Root>
          <div className="mt-2 text-center text-gray-400">
            {preferences.dailyGoal} minutes per day
          </div>
        </div>
      </div>

      {/* Difficulty Level */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Preferred Difficulty
        </h3>
        <div className="flex space-x-4">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => handlePreferenceChange('difficulty', level.id)}
              className={`flex-1 p-3 rounded-lg transition ${
                preferences.difficulty === level.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Preferred Language
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handlePreferenceChange('language', lang.id)}
              className={`p-3 rounded-lg transition flex items-center justify-center ${
                preferences.language === lang.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {preferences.language === lang.id && (
                <CheckIcon className="w-4 h-4 mr-2" />
              )}
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
