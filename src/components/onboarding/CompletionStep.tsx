'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface CompletionStepProps {
  profileData: {
    displayName: string;
    avatar?: string;
    bio?: string;
  };
  contentPreferences: {
    contentTypes: string[];
    learningStyle: string;
    dailyGoal: number;
    difficulty: string;
    language: string;
  };
  interests: {
    selectedTopics: string[];
    selectedSkills: string[];
    careerGoals: string[];
  };
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  profileData,
  contentPreferences,
  interests,
  onComplete,
}) => {
  const formatList = (items: string[]) => {
    if (items.length === 0) return 'None selected';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items.slice(-1)}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Profile Setup Complete!
        </h2>
        <p className="text-gray-400">
          Welcome to ÜPlay, {profileData.displayName}! Here's a summary of your
          preferences:
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Summary */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt={profileData.displayName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-xl">{profileData.displayName[0]}</span>
                </div>
              )}
              <div className="ml-4">
                <div className="font-medium text-white">
                  {profileData.displayName}
                </div>
                {profileData.bio && (
                  <div className="text-sm text-gray-400">{profileData.bio}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Learning Preferences
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">Daily Goal</div>
              <div className="text-white">
                {formatTime(contentPreferences.dailyGoal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Learning Style</div>
              <div className="text-white">
                {contentPreferences.learningStyle}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Difficulty Level</div>
              <div className="text-white capitalize">
                {contentPreferences.difficulty}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Preferred Language</div>
              <div className="text-white capitalize">
                {contentPreferences.language}
              </div>
            </div>
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Selected Content
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">Content Types</div>
              <div className="text-white">
                {formatList(contentPreferences.contentTypes)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Topics</div>
              <div className="text-white">
                {formatList(interests.selectedTopics)}
              </div>
            </div>
          </div>
        </div>

        {/* Goals and Skills */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Goals & Skills
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-400">Career Goals</div>
              <div className="text-white">
                {formatList(interests.careerGoals)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Skills to Develop</div>
              <div className="text-white">
                {formatList(interests.selectedSkills)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
        >
          Start Learning
        </button>
        <p className="mt-4 text-sm text-gray-400">
          You can always update these preferences later in your profile settings
        </p>
      </div>
    </div>
  );
};
