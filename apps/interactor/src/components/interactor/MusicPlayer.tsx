import { useEffect, useRef } from 'react'
import './MusicPlayer.scss'
import { useAppContext } from '../../App.context'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { selectCurrentScene } from '../../state/selectors'
import {
  setMusicEnabled,
  setMusicVolume,
} from '../../state/slices/settingsSlice'

export const Music = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
    </svg>
  )
}

export const MusicNegated = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
      <line
        x1="0"
        y1="0"
        x2="16"
        y2="16"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

const MusicPlayer: React.FC = () => {
  const dispatch = useAppDispatch()
  const { assetLinkLoader } = useAppContext()
  const _volume = useAppSelector((state) => state.settings.music.volume)
  const enabled = useAppSelector((state) => state.settings.music.enabled)
  const songs = useAppSelector((state) => state.novel.songs)
  const scene = useAppSelector(selectCurrentScene)
  const audioRef = useRef<HTMLAudioElement>(null)
  const _src =
    songs.find((s) => s.id === scene?.musicId)?.source || scene?.musicId
  const src = _src ? assetLinkLoader(_src) : ''

  const volume = enabled ? _volume : 0

  const togglePlay = () => {
    if (volume) {
      dispatch(setMusicEnabled(false))
    } else {
      dispatch(setMusicEnabled(true))
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    dispatch(setMusicVolume(newVolume))
  }

  if (audioRef.current) audioRef.current.volume = volume

  useEffect(() => {
    if (audioRef.current && volume > 0) {
      audioRef.current.play().catch((error) => {
        console.error('Autoplay error:', error)
      })
    }
  }, [src, volume])

  return (
    <div className="MusicPlayer">
      <audio
        ref={audioRef}
        src={src}
        autoPlay
        loop
        onPause={() => dispatch(setMusicEnabled(false))}
        onPlay={() => dispatch(setMusicEnabled(true))}
      />
      <button onClick={togglePlay} className="MusicPlayer__icon icon-button">
        {volume ? <Music /> : <MusicNegated />}
      </button>
      <div className="MusicPlayer__range">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={_volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  )
}

export default MusicPlayer
