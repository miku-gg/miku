import { CheckBox, Input, Modal, Slider } from '@mikugg/ui-kit'
import { SlSettings } from 'react-icons/sl'
import {
  Speed,
  setName,
  setReadAsteriks,
  setSettingsModal,
  setSettingsTab,
  setSystemPrompt,
  setVoiceSpeed,
} from '../../state/slices/settingsSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import './Settings.scss'

const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const settingsTab = useAppSelector(
    (state) => state.settings.modals.settingsTab
  )
  const currentSystemPromptLenght = useAppSelector(
    (state) => state.settings.prompt.systemPrompt.length
  )
  const systemPromptMaxLength = 800

  return (
    <div className="Settings">
      <button
        className="Settings__button icon-button"
        onClick={() => dispatch(setSettingsModal(true))}
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
              className={`SettingsModal__navigation__button ${
                settingsTab === 'general' ? 'selected' : ''
              }`}
              onClick={() => dispatch(setSettingsTab('general'))}
            >
              General Settings
            </button>
            <button
              className={`SettingsModal__navigation__button ${
                settingsTab === 'prompt' ? 'selected' : ''
              }`}
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
                  maxLength={systemPromptMaxLength}
                  label="Custom system prompt"
                  placeHolder={`Add information to always be remembered. For Example: Anon is Miku's student.`}
                  value={settings.prompt.systemPrompt}
                  onChange={(event) =>
                    dispatch(setSystemPrompt(event.target.value))
                  }
                />
                <p className="SettingsModal__systemPrompt__count">
                  {currentSystemPromptLenght}/{systemPromptMaxLength}
                </p>
              </div>
            </>
          )}
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
          <div className="SettingsModal__voice-readAsteriks">
            <p>Read Text Between Asteriks</p>
            <CheckBox
              value={settings.voice.readAsteriks}
              onChange={(event) =>
                dispatch(setReadAsteriks(event.target.checked))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
