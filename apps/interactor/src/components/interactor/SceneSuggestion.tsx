import { GiFallingStar } from 'react-icons/gi'
import { useSwipeable } from 'react-swipeable'
import './SceneSuggestion.scss'
import { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { useAppDispatch, useAppSelector } from '../../state/store'
import textCompletion from '../../libs/textCompletion'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { AlpacaSceneSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSceneSuggestionStrategy'
import { useAppContext } from '../../App.context'
import {
  sceneSuggestionsEnd,
  sceneSuggestionsStart,
  setModalOpened,
} from '../../state/slices/creationSlice'
import { Modal } from '@mikugg/ui-kit'

export default function SceneSuggestion() {
  const [buttonOpened, setButtonOpened] = useState<boolean>(false)
  const { servicesEndpoint } = useAppContext()
  const dispatch = useAppDispatch()
  const currentRespose = useAppSelector(
    (state) => state.narration.responses[state.narration.currentResponseId]
  )
  const state = useAppSelector((state) => state)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('Swiped left')
      setButtonOpened(false)
    },
  })

  useEffect(() => {
    if (currentRespose?.suggestedScenes.length) {
      setButtonOpened(true)
    }
  }, [currentRespose?.id, currentRespose?.suggestedScenes.length])

  const inferenceSuggestions = useCallback(async (): Promise<
    {
      actionText: string
      probability: string
      prompt: string
      sdPrompt: string
    }[]
  > => {
    const promptBuilder = new PromptBuilder<AlpacaSceneSuggestionStrategy>({
      maxNewTokens: 35,
      strategy: new AlpacaSceneSuggestionStrategy('llama'),
      trucationLength: 4096,
    })
    const prompt = promptBuilder.buildPrompt(state, 6)
    const stream = textCompletion({
      template: prompt.template,
      variables: prompt.variables,
      model: state.settings.model,
      serviceBaseUrl: servicesEndpoint,
      identifier: `${Date.now()}`,
    })

    let response: {
      actionText: string
      probability: string
      prompt: string
      sdPrompt: string
    }[] = []
    for await (const result of stream) {
      response = promptBuilder.completeResponse([], result, state)
    }
    return response
  }, [servicesEndpoint, state])

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
              dispatch(sceneSuggestionsStart())
              const suggestions = await inferenceSuggestions()
              dispatch(sceneSuggestionsEnd({ suggestions }))
              console.log('suggestions', suggestions)
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
  const { opened, loading } = useAppSelector(
    (state) => state.creation.sceneSugestions
  )
  return (
    <Modal
      opened={opened}
      onCloseModal={() =>
        setModalOpened({
          id: 'scene-suggestions',
          opened: false,
        })
      }
    >
      <div className="SceneSuggestionModal">
        <div className="SceneSuggestionModal__header">
          <h2>Scene suggestions</h2>
        </div>
        <div className="SceneSuggestionModal__content">
          {loading && (
            <div className="SceneSuggestionModal__loading">Loading...</div>
          )}
          <div className="SceneSuggestionModal__suggestions"></div>
        </div>
      </div>
    </Modal>
  )
}
