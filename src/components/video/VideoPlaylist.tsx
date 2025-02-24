'use client';

import React from 'react';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/24/solid';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  progress: number;
}

interface VideoPlaylistProps {
  videos: VideoItem[];
  currentVideoId: string;
  onVideoSelect: (videoId: string) => void;
}

export const VideoPlaylist: React.FC<VideoPlaylistProps> = ({
  videos,
  currentVideoId,
  onVideoSelect,
}) => {
  return (
    <div className="w-full bg-gray-900 rounded-lg p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Playlist</h2>

      <div className="space-y-2">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onVideoSelect(video.id)}
            className={`w-full flex items-center space-x-3 p-2 rounded-lg transition
              ${currentVideoId === video.id ? 'bg-primary/20' : 'hover:bg-gray-800'}`}
          >
            {/* Thumbnail Container */}
            <div className="relative w-32 aspect-video rounded-md overflow-hidden">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
              />

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${video.progress}%` }}
                />
              </div>

              {/* Play Icon Overlay */}
              {currentVideoId === video.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="flex-1 text-left">
              <h3 className="text-white font-medium line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-400 text-sm">{video.duration}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
