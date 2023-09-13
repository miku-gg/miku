import { useEffect, useState, useRef } from "react";
import { Music, MusicNegated } from "../../assets/icons/svg";
import './MusicPlayer.css';

interface MusicPlayerProps {
  src: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Autoplay error:", error);
        setPlaying(false);
      });
    }
  }, [src]);

  return (
    <div className="MusicPlayer">
      <audio ref={audioRef} src={src} autoPlay loop onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button onClick={togglePlay} className="MusicPlayer__icon">
        {playing ? <Music /> : <MusicNegated />}
      </button>
      <div className="MusicPlayer__range">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;