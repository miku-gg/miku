import { useState } from 'react';
import { FaExpand } from 'react-icons/fa6';
import { LuMinimize } from 'react-icons/lu';

const ScreenSizer = () => {
  const [fullscreen, setFullscreen] = useState<boolean>(!!document.fullscreenElement);

  return (
    <button
      className="ScreenSizer icon-button"
      onClick={() => {
        if (document?.fullscreenElement) {
          document?.exitFullscreen();
          setFullscreen(false);
        } else if (document?.documentElement?.requestFullscreen) {
          document?.documentElement?.requestFullscreen();
          setFullscreen(true);
        }
      }}
    >
      {fullscreen ? <LuMinimize /> : <FaExpand />}
    </button>
  );
};

export default ScreenSizer;
