import { CheckBox, Dropdown, Modal, Slider, TextEditable } from '@mikugg/ui-kit'
import { MdRecordVoiceOver } from 'react-icons/md'
import { SlSettings } from 'react-icons/sl'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  FontSize,
  Speed,
  Voices,
  setFontSize,
  setName,
  setSettingsModal,
  setSpeed,
  setVoiceAutoplay,
  setVoiceId,
  setVoiceSpeed,
  setStrategy
} from '../../state/slices/settingsSlice'
import './Settings.scss'
import { strategySlugs } from '../../libs/memory/strategies'

const audio = new Audio()

const Settings = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)

  const strategyItems = [
    {
      name: 'Alapca Roleplay (Default)',
      value: strategySlugs[0],
    },
    {
      name: 'Metharme Roleplay',
      value: strategySlugs[1],
    },
  ]

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
        onClick={() => dispatch(setSettingsModal(true))}
      >
        <SlSettings />
      </button>
      <Modal
        opened={settings.modals.settings}
        onCloseModal={() => dispatch(setSettingsModal(false))}
        shouldCloseOnOverlayClick
      >
        <div className="SettingsModal scrollbar">
          <div className="SettingsModal__header">Settings</div>
          <div className="SettingsModal__name">
            <TextEditable
              label="Your name"
              value={settings.user.name}
              onChange={(event) => dispatch(setName(event.target.value))}
            />
          </div>
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
          <div className="SettingsModal__prompt-strategy">
            <p>Prompt Strategy</p>
            <Dropdown
              selectedIndex={strategyItems.findIndex(
                (item) => item.value === settings.strategy
              )}
              onChange={(index) =>
                dispatch(setStrategy(strategyItems[index].value))
              }
              items={strategyItems}
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
                <div className="SettingsModal__voice-title">
                  Narration Voice
                </div>
                <div className="SettingsModal__voice-description">
                  Enhances the experience by adding a narration voice audio to
                  every response. This feature is only avalable for premium
                  users.
                </div>
              </div>
              <div className="SettingsModal__voice-enabled">
                <CheckBox
                  label="Autoplay"
                  value={settings.voice.autoplay}
                  onChange={(event) =>
                    dispatch(setVoiceAutoplay(event.target.checked))
                  }
                />
              </div>
            </div>
            <div className="SettingsModal__voice-id">
              <p>Voice ID</p>
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
        </div>
      </Modal>
    </div>
  )
}

export default Settings
