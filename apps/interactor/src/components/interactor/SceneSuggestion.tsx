import { GiFallingStar } from 'react-icons/gi'
import { useSwipeable } from 'react-swipeable'
import './SceneSuggestion.scss'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { setModalOpened } from '../../state/slices/creationSlice'
import { Button, Loader, Modal } from '@mikugg/ui-kit'
import { GEN_BACKGROUND_COST } from '../scenarios/CreateScene'
import { FaCoins } from 'react-icons/fa'
import { sceneSuggestionsStart } from '../../state/slices/narrationSlice'
import { useAppContext } from '../../App.context'

export default function SceneSuggestion() {
  const [buttonOpened, setButtonOpened] = useState<boolean>(false)
  const { servicesEndpoint } = useAppContext()
  const dispatch = useAppDispatch()
  const shouldSuggestScenes = useAppSelector(
    (state) =>
      state.narration.responses[state.narration.currentResponseId]
        ?.shouldSuggestScenes
  )
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('Swiped left')
      setButtonOpened(false)
    },
  })
  console.log('shouldSuggestScenes', shouldSuggestScenes)

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
              dispatch(
                sceneSuggestionsStart({
                  servicesEndpoint,
                })
              )
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
  const { opened } = useAppSelector(
    (state) => state.creation.scene.sceneSugestions
  )
  const { suggestedScenes, fetchingSuggestions } = useAppSelector(
    (state) => state.narration.responses[state.narration.currentResponseId]!
  )
  console.log('fetchingSuggestions', fetchingSuggestions)
  const lastSuggestedIndex = !fetchingSuggestions
    ? suggestedScenes.length
    : [...suggestedScenes, { actionText: '' }].findIndex((suggestion) => {
        return !suggestion.actionText.length
      }) - 1
  console.log('lastSuggestedIndex', lastSuggestedIndex)

  return (
    <Modal
      opened={opened}
      onCloseModal={() =>
        setModalOpened({
          id: 'scene-suggestions',
          opened: false,
        })
      }
      shouldCloseOnOverlayClick
    >
      <div className="SceneSuggestionModal">
        <div className="SceneSuggestionModal__header">
          <h2>Scene suggestions</h2>
        </div>
        <div className="SceneSuggestionModal__content">
          {fetchingSuggestions && !suggestedScenes.length ? (
            <div className="SceneSuggestionModal__loading">Loading...</div>
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
                      <Button theme="gradient" disabled={loading}>
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
