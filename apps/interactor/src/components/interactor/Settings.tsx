import { CheckBox, Dropdown, Input, Modal, Slider } from '@mikugg/ui-kit'
import { MdRecordVoiceOver } from 'react-icons/md'
import { SlSettings } from 'react-icons/sl'
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
} from '../../state/slices/settingsSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import './Settings.scss'
import { trackEvent } from '../../libs/analytics'
import { _i18n } from '../../libs/lang/i18n'
const audio = new Audio()

const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const settingsTab = useAppSelector(
    (state) => state.settings.modals.settingsTab
  )
  const currentSystemPromptLenght = useAppSelector(
    (state) => state.settings.prompt.systemPrompt.length
  )
  const systemPromptMaxLenght = 800

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
  ]

  return (
    <div className="Settings">
      <button
        className="Settings__button icon-button"
        onClick={() => {
          dispatch(setSettingsModal(true))
          trackEvent('settings-click')
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
          <div className="SettingsModal__title">{_i18n('SETTINGS')}</div>
          <div className="SettingsModal__navigation">
            <button
              className={`SettingsModal__navigation__button ${
                settingsTab === 'general' ? 'selected' : ''
              }`}
              onClick={() => dispatch(setSettingsTab('general'))}
            >
              {_i18n('SETTINGS__GENERAL_SETTINGS')}
            </button>
            <button
              className={`SettingsModal__navigation__button ${
                settingsTab === 'prompt' ? 'selected' : ''
              }`}
              onClick={() => dispatch(setSettingsTab('prompt'))}
            >
              {_i18n('SETTINGS__PROMPT_SETTINGS')}
            </button>
          </div>
        </div>
        <div className="SettingsModal scrollbar">
          {settingsTab === 'prompt' && (
            <>
              <div className="SettingsModal__name">
                <Input
                  label={_i18n('SETTINGS__YOUR_NAME')}
                  value={settings.user.name}
                  onChange={(event) => dispatch(setName(event.target.value))}
                />
              </div>
              <div className="SettingsModal__systemPrompt">
                <Input
                  className="SettingsModal__systemPrompt__input"
                  isTextArea
                  maxLength={systemPromptMaxLenght}
                  label={_i18n('SETTINGS__CUSTOM_SYSTEM_PROMPT')}
                  placeHolder={_i18n(
                    'SETTINGS__CUSTOM_SYSTEM_PROMPT_PLACEHOLDER'
                  )}
                  value={settings.prompt.systemPrompt}
                  onChange={(event) =>
                    dispatch(setSystemPrompt(event.target.value))
                  }
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
                <p>{_i18n('SETTINGS__TEXT_ANIMATION_SPEED')}</p>
                <Slider
                  value={settings.text.speed}
                  onChange={(value) => dispatch(setSpeed(value as Speed))}
                  steps={[
                    {
                      label: _i18n('SETTINGS__SLOW'),
                      value: Speed.Slow,
                    },
                    {
                      label: _i18n('SETTINGS__NORMAL'),
                      value: Speed.Normal,
                    },
                    {
                      label: _i18n('SETTINGS__FAST'),
                      value: Speed.Fast,
                    },
                    {
                      label: _i18n('SETTINGS__PRESTO'),
                      value: Speed.Presto,
                    },
                  ]}
                />
              </div>
              <div className="SettingsModal__text-font-size">
                <p>{_i18n('SETTINGS__TEXT_FONT_SIZE_LABEL')}</p>
                <Slider
                  value={settings.text.fontSize}
                  onChange={(value) => dispatch(setFontSize(value as FontSize))}
                  steps={[
                    {
                      label: _i18n('SETTINGS__SMALL_FONT_SIZE'),
                      value: FontSize.Small,
                    },
                    {
                      label: _i18n('SETTINGS__MEDIUM_FONT_SIZE'),
                      value: FontSize.Medium,
                    },
                    {
                      label: _i18n('SETTINGS__LARGE_FONT_SIZE'),
                      value: FontSize.Large,
                    },
                  ]}
                />
              </div>
              <div className="SettingsModal__voice">
                <div className="SettingsModal__voice-header">
                  <div className="SettingsModal__voice-header-title">
                    <div className="SettingsModal__voice-title">
                      {_i18n('SETTINGS__NARRATION_VOICE_LABEL')}
                    </div>
                    <div className="SettingsModal__voice-description">
                      {_i18n('SETTINGS__VOICE_DESCRIPTION_LABEL')}
                    </div>
                  </div>
                  <div className="SettingsModal__voice-enabled">
                    <CheckBox
                      label={_i18n('SETTINGS__AUTOPLAY')}
                      value={settings.voice.autoplay}
                      onChange={(event) =>
                        dispatch(setVoiceAutoplay(event.target.checked))
                      }
                    />
                  </div>
                </div>
                <div className="SettingsModal__voice-id">
                  <p>{_i18n('SETTINGS__VOICE_ID')}</p>
                  <div className="SettingsModal__voice-id-input">
                    <div
                      className="SettingsModal__voice-id-listen"
                      onClick={() => {
                        audio.src = `https://assets.miku.gg/${settings.voice.voiceId}.mp3`
                        audio.play()
                      }}
                      tabIndex={0}
                    >
                      <MdRecordVoiceOver />
                    </div>
                    <Dropdown
                      selectedIndex={voiceItems.findIndex(
                        (item) => item.value === settings.voice.voiceId
                      )}
                      onChange={(index) =>
                        dispatch(setVoiceId(voiceItems[index].value))
                      }
                      items={voiceItems}
                    />
                  </div>
                </div>
                <div className="SettingsModal__voice-speed">
                  <p>{_i18n('SETTINGS__READING_SPEED')}</p>
                  <Slider
                    value={settings.voice.speed}
                    onChange={(value) =>
                      dispatch(setVoiceSpeed(value as Speed))
                    }
                    steps={[
                      {
                        label: _i18n('SETTINGS__SLOW'),
                        value: Speed.Slow,
                      },
                      {
                        label: _i18n('SETTINGS__NORMAL'),
                        value: Speed.Normal,
                      },
                      {
                        label: _i18n('SETTINGS__FAST'),
                        value: Speed.Fast,
                      },
                      {
                        label: _i18n('SETTINGS__PRESTO'),
                        value: Speed.Presto,
                      },
                    ]}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Settings
