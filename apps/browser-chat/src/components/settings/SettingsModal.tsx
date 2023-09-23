import { CheckBox, Dropdown, Modal, Slider, TextEditable } from "@mikugg/ui-kit"
import { useEffect, useState } from "react";
import './SettingsModal.css';
import { MuteIcon, UnmuteIcon } from "@primer/octicons-react";
const audio = new Audio();

export interface SettingsState {
  name: string;
  textSpeed: number;
  textFontSize: number;
  voiceEnabled: boolean;
  voiceEmotion?: string;
  voiceSpeed: number;
  voiceId: string;
}

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  value: SettingsState;
  onChange: (value: SettingsState) => void;
}

export const voices: {
  label: string;
  provider: 'elevenlabs_tts' | 'azure_tts';
  provider_voice_id: string;
  provider_emotion: string | undefined;
}[] = [
  {
    label: "Sara",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-SaraNeural',
    provider_emotion: undefined
  },
  {
    label: "Sara - Whispering",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-SaraNeural',
    provider_emotion: 'whispering'
  },
  {
    label: "Sonia",
    provider: 'azure_tts',
    provider_voice_id: 'en-GB-SoniaNeural',
    provider_emotion: 'sad'
  },
  {
    label: "Jane",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-JaneNeural',
    provider_emotion: 'angry'
  },
  {
    label: "Maisie",
    provider: 'azure_tts',
    provider_voice_id: 'en-GB-MaisieNeural',
    provider_emotion: undefined
  },
  {
    label: "Davis",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-DavisNeural',
    provider_emotion: undefined
  },
  {
    label: "Tony",
    provider: 'azure_tts',
    provider_voice_id: 'en-US-TonyNeural',
    provider_emotion: undefined
  },
]

const SettingsModal = (props: SettingsModalProps): JSX.Element => {
  const [settings, _setRawSettings] = useState<SettingsState>(props.value);
  const setSettings = (_settings: SettingsState) => {
    _setRawSettings(_settings);
    props.onChange(_settings);
  };

  useEffect(() => {
    _setRawSettings(props.value);
  }, [props.value]);
  return (
    <Modal opened={props.opened} onCloseModal={props.onClose} shouldCloseOnOverlayClick>
      <div className="SettingsModal scrollbar">
        <div className="SettingsModal__header">Settings</div>
        <div className="SettingsModal__name">
          <TextEditable
            label="Your name"
            value={settings.name}
            onChange={(event) => setSettings({ ...settings, name: event.target.value })}
          />
        </div>
        <div className="SettingsModal__text-speed">
          <p>Text Animation Speed</p>
          <Slider
            value={settings.textSpeed}
            onChange={(value) => {
              setSettings({ ...settings, textSpeed: value })
            }}
            steps={[
              {
                label: "Slow",
                value: 70,
              },
              {
                label: "Normal",
                value: 80,
              },
              {
                label: "Fast",
                value: 90,
              },
              {
                label: "Presto",
                value: 99,
              }
            ]}
          />
        </div>
        <div className="SettingsModal__text-font-size">
          <p>Text Font Size</p>
          <Slider
            value={settings.textFontSize}
            onChange={(value) => setSettings({ ...settings, textFontSize: value })}
            steps={[
              {
                label: "Small",
                value: 0,
              },
              {
                label: "Normal",
                value: 1,
              },
              {
                label: "Large",
                value: 2,
              }
            ]}
          />
        </div>
        <div className="SettingsModal__voice">
          <div className="SettingsModal__voice-header">
            <div className="SettingsModal__voice-header-title">
              <div className="SettingsModal__voice-title">Narration Voice</div>
              <div className="SettingsModal__voice-description">Enhances the experience by adding a narration voice audio to every response. This feature is only avalable for premium users.</div>
            </div>
            <div className="SettingsModal__voice-enabled">
              <CheckBox label="Enable voice" value={settings.voiceEnabled} onChange={(event) => setSettings({ ...settings, voiceEnabled: event.target.checked })} />
            </div>
          </div>
          <div className="SettingsModal__voice-id">
            <p>Voice ID</p>
            <div className="SettingsModal__voice-id-input">
              <div className="SettingsModal__voice-id-listen" onClick={() => {
                audio.src = `https://assets.miku.gg/azure_tts.${settings.voiceId}${settings.voiceEmotion ? '.' + settings.voiceEmotion : ''}.mp3`;
                audio.play();
              }} tabIndex={0}>
                <UnmuteIcon size={16} />
              </div>
              <Dropdown
                selectedIndex={voices.findIndex(voice => (
                  voice.provider_voice_id === settings.voiceId &&
                  voice.provider_emotion === settings.voiceEmotion
                ))}
                onChange={(index) => setSettings({
                  ...settings,
                  voiceId: voices[index].provider_voice_id,
                  voiceEmotion: voices[index].provider_emotion
                })}
                items={voices.map(voice => {
                  return {
                    value: voice.label,
                    name: voice.label,
                  }
                })}
              />
            </div>
          </div>
          <div className="SettingsModal__voice-speed">
            <p>Reading speed</p>
            <Slider
              value={settings.voiceSpeed}
              onChange={(value) => setSettings({ ...settings, voiceSpeed: value })}
              steps={[
                {
                  label: "Slow",
                  value: 0.75,
                },
                {
                  label: "Normal",
                  value: 1,
                },
                {
                  label: "Fast",
                  value: 1.25,
                },
                {
                  label: "Presto",
                  value: 1.5,
                }
              ]}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal;