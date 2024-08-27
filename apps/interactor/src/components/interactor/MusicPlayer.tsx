import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { selectCurrentScene } from '../../state/selectors';
import { setMusicEnabled, setMusicVolume } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MusicPlayer.scss';

export const Music = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
    </svg>
  );
};

export const MusicNegated = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
      <line x1="0" y1="0" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

const MusicPlayer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, isMobileApp } = useAppContext();
  const [isToggledByUser, setIsToggledByUser] = useState<boolean>(false);
  const _volume = useAppSelector((state) => state.settings.music.volume);
  const enabled = useAppSelector((state) => state.settings.music.enabled);
  const songs = useAppSelector((state) => state.novel.songs);
  const scene = useAppSelector(selectCurrentScene);
  const audioRef = useRef<HTMLAudioElement>(null);
  const _src = songs.find((s) => s.id === scene?.musicId)?.source || scene?.musicId;
  const src = _src ? assetLinkLoader(_src) : '';

  const volume = enabled ? _volume : 0;

  const togglePlay = () => {
    if (audioRef.current) {
      if (enabled) {
        audioRef.current.pause();
        setIsToggledByUser(true);
        dispatch(setMusicEnabled(false));
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Autoplay blocked:', error);
        });
        setIsToggledByUser(false);
        dispatch(setMusicEnabled(true));
      }
    }
    trackEvent('music-toggle-click', { enabledMusic: !volume });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setMusicVolume(newVolume));
  };

  if (audioRef.current) audioRef.current.volume = volume;

  useEffect(() => {
    const pauseAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      dispatch(setMusicEnabled(false));
    };

    const resumeAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error('Autoplay error:', error);
        });
        dispatch(setMusicEnabled(true));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAudio();
      } else if (!isToggledByUser) {
        resumeAudio();
      }
    };

    if (audioRef.current && volume > 0 && !document.hidden) {
      resumeAudio();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [src, volume, enabled]);

  return (
    <div className="MusicPlayer">
      <audio ref={audioRef} src={src} loop />
      <button onClick={togglePlay} className="MusicPlayer__icon icon-button">
        {volume ? <Music /> : <MusicNegated />}
      </button>
      {!isMobileApp ? (
        <div className="MusicPlayer__range">
          <input type="range" min="0" max="1" step="0.01" value={_volume} onChange={handleVolumeChange} />
        </div>
      ) : null}
    </div>
  );
};

export default MusicPlayer;
