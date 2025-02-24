'use client';

import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface InterestsStepProps {
  onDataChange: (data: InterestsData) => void;
  initialData?: InterestsData;
}

interface InterestsData {
  selectedTopics: string[];
  selectedSkills: string[];
  careerGoals: string[];
}

const LEARNING_TOPICS = [
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'personal-dev', label: 'Personal Development', icon: '🌱' },
  { id: 'languages', label: 'Languages', icon: '🗣️' },
  { id: 'health', label: 'Health & Wellness', icon: '🧘‍♂️' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'arts', label: 'Arts & Culture', icon: '🎭' },
  { id: 'science', label: 'Science', icon: '🔬' },
];

const SKILLS = [
  { id: 'programming', label: 'Programming', icon: '👨‍💻' },
  { id: 'data-analysis', label: 'Data Analysis', icon: '📊' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
  { id: 'public-speaking', label: 'Public Speaking', icon: '🎤' },
  { id: 'leadership', label: 'Leadership', icon: '👥' },
  { id: 'creativity', label: 'Creativity', icon: '🎯' },
  { id: 'problem-solving', label: 'Problem Solving', icon: '🧩' },
  { id: 'communication', label: 'Communication', icon: '💬' },
];

const CAREER_GOALS = [
  {
    id: 'career-change',
    label: 'Career Change',
    description: 'Transition to a new field',
  },
  {
    id: 'skill-upgrade',
    label: 'Skill Upgrade',
    description: 'Enhance current abilities',
  },
  {
    id: 'certification',
    label: 'Certification',
    description: 'Obtain professional certifications',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Develop management skills',
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    description: 'Start or grow a business',
  },
  {
    id: 'personal-growth',
    label: 'Personal Growth',
    description: 'Focus on self-improvement',
  },
];

export const InterestsStep: React.FC<InterestsStepProps> = ({
  onDataChange,
  initialData,
}) => {
  const [interests, setInterests] = useState<InterestsData>({
    selectedTopics: initialData?.selectedTopics || [],
    selectedSkills: initialData?.selectedSkills || [],
    careerGoals: initialData?.careerGoals || [],
  });

  const toggleSelection = (category: keyof InterestsData, itemId: string) => {
    const currentSelection = interests[category];
    const newSelection = currentSelection.includes(itemId)
      ? currentSelection.filter((id) => id !== itemId)
      : [...currentSelection, itemId];

    const newInterests = {
      ...interests,
      [category]: newSelection,
    };
    setInterests(newInterests);
    onDataChange(newInterests);
  };

  return (
    <div className="space-y-8">
      {/* Learning Topics */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">
          What would you like to learn?
        </h3>
        <p className="text-gray-400 mb-4">Select topics that interest you</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LEARNING_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => toggleSelection('selectedTopics', topic.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                interests.selectedTopics.includes(topic.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{topic.icon}</span>
              <span className="font-medium block">{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">
          Skills to develop
        </h3>
        <p className="text-gray-400 mb-4">Choose skills you want to improve</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SKILLS.map((skill) => (
            <button
              key={skill.id}
              onClick={() => toggleSelection('selectedSkills', skill.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                interests.selectedSkills.includes(skill.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{skill.icon}</span>
              <span className="font-medium block">{skill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Career Goals */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Career Goals</h3>
        <p className="text-gray-400 mb-4">
          What are your professional objectives?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAREER_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleSelection('careerGoals', goal.id)}
              className={`p-4 rounded-lg border-2 transition text-left flex items-center ${
                interests.careerGoals.includes(goal.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex-1">
                <span className="font-medium block">{goal.label}</span>
                <span className="text-sm text-gray-400">
                  {goal.description}
                </span>
              </div>
              {interests.careerGoals.includes(goal.id) && (
                <CheckIcon className="w-6 h-6 text-primary ml-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
