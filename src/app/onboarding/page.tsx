'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { ProfileSetupStep } from '@/components/onboarding/ProfileSetupStep';
import { ContentPreferencesStep } from '@/components/onboarding/ContentPreferencesStep';
import { InterestsStep } from '@/components/onboarding/InterestsStep';
import { CompletionStep } from '@/components/onboarding/CompletionStep';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  profile: {
    displayName: string;
    avatar?: string;
    avatarPreview?: string;
    bio: string;
    interests: string[];
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
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      displayName: '',
      bio: '',
      interests: [],
    },
    contentPreferences: {
      contentTypes: [],
      learningStyle: '',
      dailyGoal: 30,
      difficulty: 'beginner',
      language: 'en',
    },
    interests: {
      selectedTopics: [],
      selectedSkills: [],
      careerGoals: [],
    },
  });

  const handleProfileUpdate = (data: OnboardingData['profile']) => {
    setOnboardingData((prev) => ({
      ...prev,
      profile: data,
    }));
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
      variant: 'success',
    });
  };

  const handleContentPreferencesUpdate = (
    data: OnboardingData['contentPreferences']
  ) => {
    setOnboardingData((prev) => ({
      ...prev,
      contentPreferences: data,
    }));
    toast({
      title: 'Preferences Updated',
      description: 'Your learning preferences have been saved.',
      variant: 'success',
    });
  };

  const handleInterestsUpdate = (data: OnboardingData['interests']) => {
    setOnboardingData((prev) => ({
      ...prev,
      interests: data,
    }));
    toast({
      title: 'Interests Updated',
      description: 'Your interests have been saved.',
      variant: 'success',
    });
  };

  const validateOnboardingData = () => {
    const { profile, contentPreferences, interests } = onboardingData;

    if (!profile.displayName) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please enter your display name.',
        variant: 'warning',
      });
      return false;
    }

    if (contentPreferences.contentTypes.length === 0) {
      toast({
        title: 'Preferences Incomplete',
        description: 'Please select at least one content type.',
        variant: 'warning',
      });
      return false;
    }

    if (!contentPreferences.learningStyle) {
      toast({
        title: 'Preferences Incomplete',
        description: 'Please select your learning style.',
        variant: 'warning',
      });
      return false;
    }

    if (interests.selectedTopics.length === 0) {
      toast({
        title: 'Interests Incomplete',
        description: 'Please select at least one topic of interest.',
        variant: 'warning',
      });
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateOnboardingData()) {
      return;
    }

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      toast({
        title: 'Setup Complete!',
        description: 'Welcome to ÜPlay! Your profile has been created.',
        variant: 'success',
      });

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const steps = [
    {
      id: 'profile',
      title: 'Create Your Profile',
      subtitle: 'Tell us about yourself',
      component: (
        <ProfileSetupStep
          onDataChange={handleProfileUpdate}
          initialData={onboardingData.profile}
        />
      ),
    },
    {
      id: 'preferences',
      title: 'Learning Preferences',
      subtitle: 'Customize your learning experience',
      component: (
        <ContentPreferencesStep
          onDataChange={handleContentPreferencesUpdate}
          initialData={onboardingData.contentPreferences}
        />
      ),
    },
    {
      id: 'interests',
      title: 'Your Interests',
      subtitle: 'Choose what you want to learn',
      component: (
        <InterestsStep
          onDataChange={handleInterestsUpdate}
          initialData={onboardingData.interests}
        />
      ),
    },
    {
      id: 'completion',
      title: 'Almost There!',
      subtitle: 'Review your preferences and get started',
      component: (
        <CompletionStep
          profileData={onboardingData.profile}
          contentPreferences={onboardingData.contentPreferences}
          interests={onboardingData.interests}
          onComplete={handleComplete}
        />
      ),
    },
  ];

  return (
    <>
      <OnboardingContainer steps={steps} onComplete={handleComplete} />
      <Toaster />
    </>
  );
}
