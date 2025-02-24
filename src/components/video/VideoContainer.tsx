'use client';

import React, { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { VideoPlaylist } from './VideoPlaylist';

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  src: string;
  progress: number;
}

interface VideoContainerProps {
  videos: Video[];
  initialVideoId?: string;
  onVideoComplete?: (videoId: string) => void;
  onProgressUpdate?: (videoId: string, progress: number) => void;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  videos,
  initialVideoId,
  onVideoComplete,
  onProgressUpdate,
}) => {
  const [currentVideoId, setCurrentVideoId] = useState(
    initialVideoId || videos[0]?.id
  );
  const currentVideo = videos.find((v) => v.id === currentVideoId);

  const handleVideoSelect = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const handleProgress = (progress: number) => {
    if (currentVideo) {
      onProgressUpdate?.(currentVideo.id, progress);
    }
  };

  const handleComplete = () => {
    if (currentVideo) {
      onVideoComplete?.(currentVideo.id);

      // Auto-play next video if available
      const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
      if (currentIndex < videos.length - 1) {
        setCurrentVideoId(videos[currentIndex + 1].id);
      }
    }
  };

  if (!currentVideo) {
    return <div>No videos available</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <VideoPlayer
          src={currentVideo.src}
          title={currentVideo.title}
          initialProgress={currentVideo.progress}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      </div>

      <div className="lg:col-span-1">
        <VideoPlaylist
          videos={videos}
          currentVideoId={currentVideoId}
          onVideoSelect={handleVideoSelect}
        />
      </div>
    </div>
  );
};
