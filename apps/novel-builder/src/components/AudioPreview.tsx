import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Button } from '@mikugg/ui-kit';
import './AudioPreview.scss';

const AudioPreview: React.FC<{ src: string }> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [src]);

  return (
    <div className="AudioPreview">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)}>
        Your browser does not support the audio element.
      </audio>
      <Button
        theme="transparent"
        onClick={togglePlayPause}
        className="AudioPreview__play-button"
      >
        {isPlaying ? <FaStop /> : <FaPlay />}
      </Button>
    </div>
  );
};

export default AudioPreview;
