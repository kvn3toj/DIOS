'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface VideoPlayerProps {
  src: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
  qualities?: string[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onProgress,
  onComplete,
  initialProgress = 0,
  qualities = ['1080p', '720p', '480p', '360p'],
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState(qualities[0]);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = duration * (initialProgress / 100);
    }
  }, [initialProgress, duration]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      setCurrentTime(videoRef.current.currentTime);
      onProgress?.(progress);

      if (progress >= 100) {
        onComplete?.();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
      .map((v) => (v < 10 ? `0${v}` : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent =
      Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-y-[-50%] w-3 h-3 bg-primary rounded-full shadow-lg" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition"
            >
              {isPlaying ? (
                <PauseIcon className="w-8 h-8" />
              ) : (
                <PlayIcon className="w-8 h-8" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
              )}
            </button>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Settings Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="text-white hover:text-primary transition">
                  <Cog6ToothIcon className="w-6 h-6" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[220px] bg-gray-800 rounded-lg p-2 shadow-xl"
                  sideOffset={5}
                  align="end"
                >
                  {/* Playback Speed */}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-white hover:bg-gray-700 rounded">
                      <span>Playback Speed</span>
                      <span>{playbackSpeed}x</span>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="min-w-[220px] bg-gray-800 rounded-lg p-2 shadow-xl"
                        sideOffset={2}
                        alignOffset={-5}
                      >
                        {speeds.map((speed) => (
                          <DropdownMenu.Item
                            key={speed}
                            className={`px-2 py-1.5 text-sm text-white hover:bg-gray-700 rounded cursor-pointer ${
                              speed === playbackSpeed ? 'bg-primary/20' : ''
                            }`}
                            onClick={() => setPlaybackSpeed(speed)}
                          >
                            {speed}x
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  {/* Quality Selection */}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-white hover:bg-gray-700 rounded">
                      <span>Quality</span>
                      <span>{selectedQuality}</span>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        className="min-w-[220px] bg-gray-800 rounded-lg p-2 shadow-xl"
                        sideOffset={2}
                        alignOffset={-5}
                      >
                        {qualities.map((quality) => (
                          <DropdownMenu.Item
                            key={quality}
                            className={`px-2 py-1.5 text-sm text-white hover:bg-gray-700 rounded cursor-pointer ${
                              quality === selectedQuality ? 'bg-primary/20' : ''
                            }`}
                            onClick={() => setSelectedQuality(quality)}
                          >
                            {quality}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m11-5h-4m4 0v4m0-4l-5 5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
