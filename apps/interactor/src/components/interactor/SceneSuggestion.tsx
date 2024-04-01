import { GiFallingStar } from 'react-icons/gi'
import { useSwipeable } from 'react-swipeable'
import './SceneSuggestion.scss'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  backgroundInferenceStart,
  setModalOpened,
} from '../../state/slices/creationSlice'
import { Button, Loader, Modal } from '@mikugg/ui-kit'
import { GEN_BACKGROUND_COST } from '../scenarios/CreateScene'
import { FaCoins } from 'react-icons/fa'
import { sceneSuggestionsStart } from '../../state/slices/narrationSlice'
import { useAppContext } from '../../App.context'
import { userDataFetchStart } from '../../state/slices/settingsSlice'
import CreditsDisplayer from '../scenarios/CreditsDisplayer'
import { NarrationSceneSuggestion } from '../../state/versioning/v3.state'

export default function SceneSuggestion() {
  const [buttonOpened, setButtonOpened] = useState<boolean>(false)
  const { servicesEndpoint, apiEndpoint } = useAppContext()
  const dispatch = useAppDispatch()
  const { suggestedScenes, fetchingSuggestions, shouldSuggestScenes } =
    useAppSelector(
      (state) => state.narration.responses[state.narration.currentResponseId]!
    )
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setButtonOpened(false)
    },
  })

  useEffect(() => {
    if (shouldSuggestScenes) {
      setButtonOpened(true)
    }
  }, [shouldSuggestScenes])

  return (
    <>
      <div
        className={classNames(
          'SceneSuggestion',
          !buttonOpened ? 'SceneSuggestion--button-hidden' : ''
        )}
      >
        <div className="SceneSuggestion__button-container">
          <button
            {...swipeHandlers}
            className="SceneSuggestion__button"
            onClick={async () => {
              dispatch(
                setModalOpened({
                  id: 'scene-suggestions',
                  opened: true,
                })
              )
              if (!fetchingSuggestions && !suggestedScenes.length) {
                dispatch(sceneSuggestionsStart({ servicesEndpoint }))
                dispatch(userDataFetchStart({ apiEndpoint }))
              }
            }}
          >
            <div className="SceneSuggestion__text">
              <span>Generate next scene</span>
            </div>
            <GiFallingStar />
          </button>
        </div>
      </div>
      <SceneSuggestionModal />
    </>
  )
}

const SceneSuggestionModal = () => {
  const dispatch = useAppDispatch()
  const { opened } = useAppSelector(
    (state) => state.creation.scene.sceneSugestions
  )
  const { suggestedScenes, fetchingSuggestions } = useAppSelector(
    (state) => state.narration.responses[state.narration.currentResponseId]!
  )
  const lastSuggestedIndex = !fetchingSuggestions
    ? suggestedScenes.length
    : [...suggestedScenes, { actionText: '' }].findIndex((suggestion) => {
        return !suggestion.actionText.length
      }) - 1
  const { credits } = useAppSelector((state) => state.settings.user)
  const { apiEndpoint, servicesEndpoint } = useAppContext()
  const { fetching: fetchingBackground, backgrounds } = useAppSelector(
    (state) => state.creation.inference
  )
  const fetchingScene =
    fetchingBackground &&
    !!suggestedScenes.find((s) => s.sceneId === backgrounds[0]?.id)

  const generateScene = (sceneSuggestion: NarrationSceneSuggestion) => {
    dispatch(
      backgroundInferenceStart({
        id: sceneSuggestion.sceneId,
        prompt: sceneSuggestion.sdPrompt,
        apiEndpoint,
        servicesEndpoint,
      })
    )
  }

  return (
    <Modal
      opened={opened}
      onCloseModal={() => {
        dispatch(
          setModalOpened({
            id: 'scene-suggestions',
            opened: false,
          })
        )
      }}
      shouldCloseOnOverlayClick
    >
      <div className="SceneSuggestionModal">
        <div className="SceneSuggestionModal__header">
          <h2>Scene suggestions</h2>
          <CreditsDisplayer />
        </div>
        <div className="SceneSuggestionModal__content">
          {fetchingScene ? (
            <div className="SceneSuggestionModal__loading">
              Generating background...
            </div>
          ) : fetchingSuggestions && !suggestedScenes.length ? (
            <div className="SceneSuggestionModal__loading">
              Fetching suggestions...
            </div>
          ) : (
            <div className="SceneSuggestionModal__suggestions">
              {suggestedScenes.map((suggestion, index) => {
                const loading = index >= lastSuggestedIndex
                return (
                  <div key={index} className="SceneSuggestionModal__suggestion">
                    <div className="SceneSuggestionModal__suggestion-header">
                      <h3>{suggestion.actionText}</h3>
                    </div>
                    <div className="SceneSuggestionModal__suggestion-prompt scrollbar">
                      <p>{suggestion.textPrompt}</p>
                    </div>
                    <div className="SceneSuggestionModal__suggestion-button">
                      <Button
                        theme="gradient"
                        disabled={loading || credits < GEN_BACKGROUND_COST}
                        onClick={() => generateScene(suggestion)}
                      >
                        {loading ? (
                          <Loader />
                        ) : (
                          <>
                            Generate Scene{' '}
                            <span>
                              {GEN_BACKGROUND_COST} <FaCoins />
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
