import { CheckBox, Dropdown, Input, Modal, Slider } from '@mikugg/ui-kit';
import { MdRecordVoiceOver } from 'react-icons/md';
import { SlSettings } from 'react-icons/sl';
import {
  FontSize,
  Speed,
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
  getVoiceItems,
  setReasoningEnabled,
} from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './Settings.scss';
import { trackEvent } from '../../libs/analytics';
import { useI18n } from '../../libs/i18n';
import { useEffect } from 'react';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { useAppContext } from '../../App.context';
const audio = new Audio();

const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { isPublishedDemo } = useAppContext();
  const language = useAppSelector((state) => state.novel.language);
  const settings = useAppSelector((state) => state.settings);
  const settingsTab = useAppSelector((state) => state.settings.modals.settingsTab);
  const currentSystemPromptLenght = useAppSelector((state) => state.settings.prompt.systemPrompt.length);
  const systemPromptMaxLenght = 800;
  const { i18n } = useI18n();

  const voiceItems = getVoiceItems(language || 'en');

  const voiceSelected = voiceItems.find((item) => item.value === settings.voice.voiceId) || voiceItems[0];

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
          <div className="SettingsModal__title">{i18n('settings')}</div>
          <div className="SettingsModal__navigation">
            <button
              className={`SettingsModal__navigation__button ${settingsTab === 'general' ? 'selected' : ''}`}
              onClick={() => dispatch(setSettingsTab('general'))}
            >
              {i18n('general_settings')}
            </button>
            <button
              className={`SettingsModal__navigation__button ${settingsTab === 'prompt' ? 'selected' : ''}`}
              onClick={() => dispatch(setSettingsTab('prompt'))}
            >
              {i18n('prompt_settings')}
            </button>
          </div>
        </div>
        <div className="SettingsModal scrollbar">
          {settingsTab === 'prompt' && (
            <>
              <div className="SettingsModal__name">
                <Input
                  label={i18n('your_name')}
                  value={settings.user.name}
                  onChange={(event) => dispatch(setName(event.target.value))}
                />
              </div>
              <div className="SettingsModal__systemPrompt">
                <Input
                  className="SettingsModal__systemPrompt__input"
                  isTextArea
                  maxLength={systemPromptMaxLenght}
                  label={i18n('custom_system_prompt')}
                  placeHolder={i18n('custom_system_prompt_placeholder')}
                  value={settings.prompt.systemPrompt}
                  onChange={(event) => dispatch(setSystemPrompt(event.target.value))}
                />
                <p className="SettingsModal__systemPrompt__count">
                  {currentSystemPromptLenght}/{systemPromptMaxLenght}
                </p>
              </div>
              {settings.user.isTester ? (
                <div className={`SettingsModal__reasoning ${!settings.user.isTester ? 'disabled' : ''}`}>
                  <div className="SettingsModal__reasoning-header">
                    <div className="SettingsModal__reasoning-header-title">
                      <div className="SettingsModal__reasoning-title">{i18n('enable_reasoning_title')}</div>
                      <div className="SettingsModal__reasoning-description">{i18n('enable_reasoning_description')}</div>
                    </div>
                    <div className="SettingsModal__reasoning-checkbox">
                      <CheckBox
                        value={settings.prompt.reasoningEnabled}
                        onChange={(event) => dispatch(setReasoningEnabled(!!event.target.checked))}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
          {settingsTab === 'general' && (
            <>
              <div className="SettingsModal__text-speed">
                <p>{i18n('text_animation_speed')}</p>
                <Slider
                  value={settings.text.speed}
                  onChange={(value) => dispatch(setSpeed(value as Speed))}
                  steps={[
                    { label: i18n('slow'), value: Speed.Slow },
                    { label: i18n('normal'), value: Speed.Normal },
                    { label: i18n('fast'), value: Speed.Fast },
                    { label: i18n('presto'), value: Speed.Presto },
                  ]}
                />
              </div>
              <div className="SettingsModal__text-font-size">
                <p>{i18n('text_font_size')}</p>
                <Slider
                  value={settings.text.fontSize}
                  onChange={(value) => dispatch(setFontSize(value as FontSize))}
                  steps={[
                    { label: i18n('small'), value: FontSize.Small },
                    { label: i18n('medium'), value: FontSize.Medium },
                    { label: i18n('large'), value: FontSize.Large },
                  ]}
                />
              </div>
              {!isPublishedDemo ? (
                <div className="SettingsModal__voice">
                  <div className="SettingsModal__voice-header">
                    <div className="SettingsModal__voice-header-title">
                      <div className="SettingsModal__voice-title">{i18n('narration_voice')}</div>
                      <div className="SettingsModal__voice-description">{i18n('narration_voice_description')}</div>
                    </div>
                    <div className="SettingsModal__voice-enabled">
                      <CheckBox
                        label={i18n('autoplay')}
                        value={settings.voice.autoplay}
                        onChange={(event) => dispatch(setVoiceAutoplay(event.target.checked))}
                      />
                    </div>
                  </div>
                  <div className="SettingsModal__voice-id">
                    <p>{i18n('voice_id')}</p>
                    <div className="SettingsModal__voice-id-input">
                      <div
                        className="SettingsModal__voice-id-listen"
                        onClick={() => {
                          audio.src = `https://assets.miku.gg/${voiceSelected.value}.mp3`;
                          audio.play();
                        }}
                        tabIndex={0}
                      >
                        <MdRecordVoiceOver />
                      </div>
                      <Dropdown
                        selectedIndex={voiceItems.findIndex((item) => item.value === voiceSelected.value)}
                        onChange={(index) => dispatch(setVoiceId(voiceItems[index].value))}
                        items={voiceItems}
                      />
                    </div>
                  </div>
                  <div className="SettingsModal__voice-speed">
                    <p>{i18n('reading_speed')}</p>
                    <Slider
                      value={settings.voice.speed}
                      onChange={(value) => dispatch(setVoiceSpeed(value as Speed))}
                      steps={[
                        { label: i18n('slow'), value: Speed.Slow },
                        { label: i18n('normal'), value: Speed.Normal },
                        { label: i18n('fast'), value: Speed.Fast },
                        { label: i18n('presto'), value: Speed.Presto },
                      ]}
                    />
                  </div>
                </div>
              ) : null}
              <div className="SettingsModal__response-format">
                <p>{i18n('response_format')}</p>
                <div className="SettingsModal__response-format-buttons">
                  <button
                    className={settings.text.responseFormat === ResponseFormat.FullText ? 'selected' : ''}
                    onClick={() => dispatch(setResponseFormat(ResponseFormat.FullText))}
                  >
                    {i18n('full_text')}
                  </button>
                  <button
                    className={settings.text.responseFormat === ResponseFormat.VNStyle ? 'selected' : ''}
                    onClick={() => dispatch(setResponseFormat(ResponseFormat.VNStyle))}
                  >
                    {i18n('vn_style')}
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
