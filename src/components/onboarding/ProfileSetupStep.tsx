'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import * as Avatar from '@radix-ui/react-avatar';

interface ProfileSetupStepProps {
  onDataChange: (data: ProfileData) => void;
  initialData?: ProfileData;
}

interface ProfileData {
  displayName: string;
  avatar?: File | null;
  avatarPreview?: string;
  bio: string;
  interests: string[];
}

const AVAILABLE_INTERESTS = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Development',
  'Leadership',
  'Innovation',
  'Entrepreneurship',
  'Data Science',
  'Artificial Intelligence',
  'Digital Marketing',
  'Project Management',
];

export const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({
  onDataChange,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: initialData?.displayName || '',
    avatar: null,
    avatarPreview: initialData?.avatarPreview,
    bio: initialData?.bio || '',
    interests: initialData?.interests || [],
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      }));
      onDataChange({
        ...formData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];

    setFormData((prev) => ({
      ...prev,
      interests: newInterests,
    }));
    onDataChange({
      ...formData,
      interests: newInterests,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    onDataChange({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center">
        <Avatar.Root className="relative inline-block h-32 w-32 rounded-full overflow-hidden">
          <Avatar.Image
            src={formData.avatarPreview}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback delayMs={600}>
            <UserCircleIcon className="h-full w-full text-gray-400" />
          </Avatar.Fallback>
        </Avatar.Root>

        <label
          htmlFor="avatar-upload"
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition"
        >
          <PhotoIcon className="w-5 h-5" />
          <span>Upload Photo</span>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your display name"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Tell us a bit about yourself"
          />
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Your Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                formData.interests.includes(interest)
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
