import { DEFAULT_MUSIC } from "@mikugg/bot-utils";
import "./MusicSelector.scss";
import { Button, Modal } from "@mikugg/ui-kit";
import { useState } from "react";

export const ASSETS_ENDPOINT =
  import.meta.env.VITE_ASSETS_ENDPOINT || "https://assets.miku.gg";

interface Music {
  name: string;
  source: string;
}

const DEFAULT_MUSIC_ITEM: Music[] = DEFAULT_MUSIC.sort().map((_name) => ({
  name: _name,
  source: `${ASSETS_ENDPOINT}/${_name}`,
}));

const MusicSelector = ({
  selectedMusic,
  onChange,
}: {
  selectedMusic: Music;
  onChange: (music: Music, isDefault: boolean) => void;
}): JSX.Element => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [currentPlaying, setCurrentPlaying] = useState<string>("");

  const handlePlay = (source: string) => {
    setCurrentPlaying(source);
  };

  return (
    <div className="MusicSelector">
      <div className="MusicSelector__title">Scene Music</div>
      <div className="MusicSelector__form">
        <div className="MusicSelector__selected">
          <div className="MusicSelector__selected-name">
            {selectedMusic.name || "No music selected"}
          </div>
          <div className="MusicSelector__selected-source">
            {selectedMusic.source ? (
              <audio
                src={selectedMusic.source}
                className="MusicSelector__player"
                controls
              />
            ) : null}
          </div>
        </div>
        <div className="MusicSelector__actions">
          <Button theme="gradient" onClick={() => setExpanded(true)}>
            Select another
          </Button>
          {selectedMusic.name ? (
            <Button
              theme="primary"
              onClick={() =>
                onChange(
                  {
                    name: "",
                    source: "",
                  },
                  false
                )
              }
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <Modal
        title="Select music"
        opened={expanded}
        onCloseModal={() => {
          setExpanded(false);
          setCurrentPlaying("");
        }}
        shouldCloseOnOverlayClick
      >
        <div className="MusicSelector__defaults-selector">
          <div className="MusicSelector__defaults scrollbar">
            {DEFAULT_MUSIC_ITEM.map((music, index) => (
              <div
                key={`music-list-${music.name}-${index}`}
                className="MusicSelector__default"
              >
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
                    setCurrentPlaying("");
                  }}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
          {currentPlaying ? (
            <audio
              src={currentPlaying}
              className="MusicSelector__player"
              controls
              autoPlay
            />
          ) : null}
          <div className="MusicSelector__custom">
            <div className="MusicSelector__custom-title">
              Custom music from file
            </div>
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
                      // if size is more than 5MB, reject
                      if (result.length > 5 * 1024 * 1024) {
                        alert("File size is larger than 5MB");
                        return;
                      }

                      onChange(
                        {
                          name: file.name,
                          source: result,
                        },
                        false
                      );
                      setExpanded(false);
                      setCurrentPlaying("");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MusicSelector;
