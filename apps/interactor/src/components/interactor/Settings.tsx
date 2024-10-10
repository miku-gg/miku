import { CheckBox, Dropdown, Input, Modal, Slider } from '@mikugg/ui-kit';
import { MdRecordVoiceOver } from 'react-icons/md';
import { SlSettings } from 'react-icons/sl';
import {
  FontSize,
  Speed,
  Voices,
  setFontSize,
  setName,
  setSettingsModal,
  setSettingsTab,
  setSpeed,
  setSystemPrompt,
  setVoiceAutoplay,
  setVoiceId,
  setVoiceSpeed,
  ResponseFormat,
  setResponseFormat,
} from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './Settings.scss';
import { trackEvent } from '../../libs/analytics';
import { useEffect } from 'react';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
const audio = new Audio();

const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const settingsTab = useAppSelector((state) => state.settings.modals.settingsTab);
  const currentSystemPromptLenght = useAppSelector((state) => state.settings.prompt.systemPrompt.length);
  const systemPromptMaxLenght = 800;

  const voiceItems = [
    {
      name: 'Sara',
      value: Voices.Sara,
    },
    {
      name: 'Sara - Whispering',
      value: Voices.SaraWhispering,
    },
    {
      name: 'Sonia',
      value: Voices.Sonia,
    },
    {
      name: 'Jane',
      value: Voices.Jane,
    },
    {
      name: 'Maisie',
      value: Voices.Maisie,
    },
    {
      name: 'Davis',
      value: Voices.Davis,
    },
    {
      name: 'Tony',
      value: Voices.Tony,
    },
  ];

  useEffect(() => {
    postMessage(CustomEventType.SETTINGS_UPDATE, settings);
  }, [settings]);

  return (
    <div className="Settings">
      <button
        className="Settings__button icon-button"
        onClick={() => {
          dispatch(setSettingsModal(true));
          trackEvent('settings-click');
        }}
      >
        <SlSettings />
      </button>
      <Modal
        opened={settings.modals.settings}
        onCloseModal={() => dispatch(setSettingsModal(false))}
        shouldCloseOnOverlayClick
      >
        <div className="SettingsModal__header">
          <div className="SettingsModal__title">Settings</div>
          <div className="SettingsModal__navigation">
            <button
              className={`SettingsModal__navigation__button ${settingsTab === 'general' ? 'selected' : ''}`}
              onClick={() => dispatch(setSettingsTab('general'))}
            >
              General Settings
            </button>
            <button
              className={`SettingsModal__navigation__button ${settingsTab === 'prompt' ? 'selected' : ''}`}
              onClick={() => dispatch(setSettingsTab('prompt'))}
            >
              Prompt Settings
            </button>
          </div>
        </div>
        <div className="SettingsModal scrollbar">
          {settingsTab === 'prompt' && (
            <>
              <div className="SettingsModal__name">
                <Input
                  label="Your name"
                  value={settings.user.name}
                  onChange={(event) => dispatch(setName(event.target.value))}
                />
              </div>
              <div className="SettingsModal__systemPrompt">
                <Input
                  className="SettingsModal__systemPrompt__input"
                  isTextArea
                  maxLength={systemPromptMaxLenght}
                  label="Custom system prompt"
                  placeHolder={`Add information to always be remembered. For Example: Anon is Miku's student.`}
                  value={settings.prompt.systemPrompt}
                  onChange={(event) => dispatch(setSystemPrompt(event.target.value))}
                />
                <p className="SettingsModal__systemPrompt__count">
                  {currentSystemPromptLenght}/{systemPromptMaxLenght}
                </p>
              </div>
            </>
          )}
          {settingsTab === 'general' && (
            <>
              <div className="SettingsModal__text-speed">
                <p>Text Animation Speed</p>
                <Slider
                  value={settings.text.speed}
                  onChange={(value) => dispatch(setSpeed(value as Speed))}
                  steps={[
                    {
                      label: 'Slow',
                      value: Speed.Slow,
                    },
                    {
                      label: 'Normal',
                      value: Speed.Normal,
                    },
                    {
                      label: 'Fast',
                      value: Speed.Fast,
                    },
                    {
                      label: 'Presto',
                      value: Speed.Presto,
                    },
                  ]}
                />
              </div>
              <div className="SettingsModal__text-font-size">
                <p>Text Font Size</p>
                <Slider
                  value={settings.text.fontSize}
                  onChange={(value) => dispatch(setFontSize(value as FontSize))}
                  steps={[
                    {
                      label: 'Small',
                      value: FontSize.Small,
                    },
                    {
                      label: 'Normal',
                      value: FontSize.Medium,
                    },
                    {
                      label: 'Large',
                      value: FontSize.Large,
                    },
                  ]}
                />
              </div>
              <div className="SettingsModal__voice">
                <div className="SettingsModal__voice-header">
                  <div className="SettingsModal__voice-header-title">
                    <div className="SettingsModal__voice-title">Narration Voice</div>
                    <div className="SettingsModal__voice-description">
                      Enhances the experience by adding a narration voice audio to every response. This feature is only
                      avalable for premium users.
                    </div>
                  </div>
                  <div className="SettingsModal__voice-enabled">
                    <CheckBox
                      label="Autoplay"
                      value={settings.voice.autoplay}
                      onChange={(event) => dispatch(setVoiceAutoplay(event.target.checked))}
                    />
                  </div>
                </div>
                <div className="SettingsModal__voice-id">
                  <p>Voice ID</p>
                  <div className="SettingsModal__voice-id-input">
                    <div
                      className="SettingsModal__voice-id-listen"
                      onClick={() => {
                        audio.src = `https://assets.miku.gg/${settings.voice.voiceId}.mp3`;
                        audio.play();
                      }}
                      tabIndex={0}
                    >
                      <MdRecordVoiceOver />
                    </div>
                    <Dropdown
                      selectedIndex={voiceItems.findIndex((item) => item.value === settings.voice.voiceId)}
                      onChange={(index) => dispatch(setVoiceId(voiceItems[index].value))}
                      items={voiceItems}
                    />
                  </div>
                </div>
                <div className="SettingsModal__voice-speed">
                  <p>Reading speed</p>
                  <Slider
                    value={settings.voice.speed}
                    onChange={(value) => dispatch(setVoiceSpeed(value as Speed))}
                    steps={[
                      {
                        label: 'Slow',
                        value: Speed.Slow,
                      },
                      {
                        label: 'Normal',
                        value: Speed.Normal,
                      },
                      {
                        label: 'Fast',
                        value: Speed.Fast,
                      },
                      {
                        label: 'Presto',
                        value: Speed.Presto,
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="SettingsModal__response-format">
                <p>Response Format</p>
                <div className="SettingsModal__response-format-buttons">
                  <button
                    className={settings.text.responseFormat === ResponseFormat.FullText ? 'selected' : ''}
                    onClick={() => dispatch(setResponseFormat(ResponseFormat.FullText))}
                  >
                    Full Text
                  </button>
                  <button
                    className={settings.text.responseFormat === ResponseFormat.VNStyle ? 'selected' : ''}
                    onClick={() => dispatch(setResponseFormat(ResponseFormat.VNStyle))}
                  >
                    VN Style
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
