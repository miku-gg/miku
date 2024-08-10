import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import './MusicSelector.scss';

interface Music {
  name: string;
  source: string;
}

const MusicSelector = ({
  selectedMusic,
  onChange,
  musicList,
  hideUpload,
}: {
  selectedMusic: Music;
  onChange: (music: Music, isDefault: boolean) => void;
  musicList: Music[];
  hideUpload?: boolean;
}): JSX.Element => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [currentPlaying, setCurrentPlaying] = useState<string>('');

  const handlePlay = (source: string) => {
    setCurrentPlaying(source);
  };

  return (
    <div className="MusicSelector">
      <div className="MusicSelector__form">
        <div className="MusicSelector__selected">
          <div className="MusicSelector__selected-name">{selectedMusic.name || 'No music selected'}</div>
        </div>
        <div className="MusicSelector__actions">
          <Button theme="secondary" onClick={() => setExpanded(true)}>
            {selectedMusic.name ? 'Change' : 'Select'}
          </Button>
          {selectedMusic.name ? (
            <Button
              theme="transparent"
              onClick={() =>
                onChange(
                  {
                    name: '',
                    source: '',
                  },
                  false,
                )
              }
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      {selectedMusic.source ? (
        <div className="MusicSelector__selected-source">
          <audio src={selectedMusic.source} className="MusicSelector__player" controls />
        </div>
      ) : null}
      <Modal
        title="Select music"
        opened={expanded}
        onCloseModal={() => {
          setExpanded(false);
          setCurrentPlaying('');
        }}
        shouldCloseOnOverlayClick
      >
        <div className="MusicSelector__defaults-selector">
          <div className="MusicSelector__defaults scrollbar">
            {musicList.map((music, index) => (
              <div key={`music-list-${music.name}-${index}`} className="MusicSelector__default">
                <div className="MusicSelector__default-name">{music.name}</div>
                <Button
                  theme="transparent"
                  onClick={() => {
                    handlePlay(music.source);
                  }}
                >
                  Play
                </Button>
                <Button
                  theme="transparent"
                  onClick={() => {
                    onChange(music, true);
                    setExpanded(false);
                    setCurrentPlaying('');
                  }}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
          {currentPlaying ? <audio src={currentPlaying} className="MusicSelector__player" controls autoPlay /> : null}
          {!hideUpload ? (
            <div className="MusicSelector__custom">
              <div className="MusicSelector__custom-title">Custom music from file</div>
              <div className="MusicSelector__custom-input">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        // if size is more than 15MB, reject
                        if (file.size > 19.5 * 1024 * 1024) {
                          alert('File size is larger than 15MB');
                          return;
                        }

                        onChange(
                          {
                            name: file.name,
                            source: result,
                          },
                          false,
                        );
                        setExpanded(false);
                        setCurrentPlaying('');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default MusicSelector;
