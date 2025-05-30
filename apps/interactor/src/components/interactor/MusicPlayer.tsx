import { useEffect, useRef, useState } from 'react';
import './MusicPlayer.scss';
import { useAppContext } from '../../App.context';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectCurrentScene, selectDisplayingCutScene, selectCurrentCutScenePart } from '../../state/selectors';
import { setMusicEnabled, setMusicVolume } from '../../state/slices/settingsSlice';
import { trackEvent } from '../../libs/analytics';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

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
  const [rangeVisible, setRangeVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { assetLinkLoader } = useAppContext();
  const volume = useAppSelector((state) => state.settings.music.volume);
  const enabled = useAppSelector((state) => state.settings.music.enabled);
  const novelFetching = useAppSelector((state) => !state.novel.starts.length);
  const songs = useAppSelector((state) => state.novel.songs);
  const scene = useAppSelector(selectCurrentScene);
  const displayingCutscene = useAppSelector(selectDisplayingCutScene);
  const currentCutScenePart = useAppSelector(selectCurrentCutScenePart);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const battles = useAppSelector((state) => state.novel.battles || []);
  const audioRef = useRef<HTMLAudioElement>(null);

  let _src = '';
  if (displayingCutscene && currentCutScenePart?.music) {
    _src = songs.find((s) => s.id === currentCutScenePart.music)?.source || currentCutScenePart.music;
  } else if (
    currentBattle?.isActive &&
    currentBattle.state.status !== 'victory-cutscene' &&
    currentBattle.state.status !== 'defeat-cutscene'
  ) {
    const battleId = currentBattle.state.battleId;
    const battleConfig = battles.find((b) => b.battleId === battleId);
    if (battleConfig?.music?.battleId) {
      _src = songs.find((s) => s.id === battleConfig.music.battleId)?.source || battleConfig.music.battleId;
    }
  } else if (scene?.musicId) {
    _src = songs.find((s) => s.id === scene?.musicId)?.source || scene?.musicId;
  }

  const src = _src ? assetLinkLoader(_src, AssetDisplayPrefix.MUSIC) : '';

  const togglePlay = () => {
    if (audioRef.current) {
      if (enabled) {
        audioRef.current.pause();
        dispatch(setMusicEnabled(false));
      } else {
        audioRef.current.play();
        dispatch(setMusicEnabled(true));
      }
    }
    trackEvent('music-toggle-click', { enabledMusic: enabled });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setMusicVolume(newVolume));
  };

  useEffect(() => {
    if (!novelFetching) {
      setTimeout(() => {
        if (audioRef.current?.paused) {
          dispatch(setMusicEnabled(false));
        }
      }, 200);
    }
  }, [novelFetching]);

  if (audioRef.current) audioRef.current.volume = volume;

  return (
    <div
      className={`MusicPlayer ${rangeVisible ? 'range-visible' : ''}`}
      onMouseEnter={() => {
        setRangeVisible(true);
      }}
      onMouseLeave={() => {
        setRangeVisible(false);
      }}
    >
      <audio ref={audioRef} src={src} autoPlay={enabled} loop />
      <button onClick={togglePlay} className="MusicPlayer__icon icon-button">
        {enabled ? <Music /> : <MusicNegated />}
      </button>
      <div className="MusicPlayer__range">
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
      </div>
    </div>
  );
};

export default MusicPlayer;
