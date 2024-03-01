import {
  interactionStart,
  setInputText,
  setSuggestions,
} from '../../state/slices/narrationSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { FaPaperPlane } from 'react-icons/fa'
import { GiFeather } from 'react-icons/gi'
import {
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { useAppContext } from '../../App.context'

import './InputBox.scss'
import { toast } from 'react-toastify'
import { trackEvent } from '../../libs/analytics'
import classNames from 'classnames'
import { Tooltip } from '@mikugg/ui-kit'
import { AlpacaSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSuggestionStrategy'
import textCompletion from '../../libs/textCompletion'
import React, { useState } from 'react'
import { Loader } from '../common/Loader'
import PromptBuilder from '../../libs/prompts/PromptBuilder'

let lastInteractionTime = Date.now()
const InputBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { servicesEndpoint, isInteractionDisabled } = useAppContext()
  const { text, disabled } = useAppSelector((state) => state.narration.input)
  const novelTitle = useAppSelector((state) => state.novel.title)
  const state = useAppSelector((state) => state)
  const scene = useAppSelector(selectCurrentScene)
  const lastResponse = useAppSelector(selectLastLoadedResponse)
  const suggestions = useAppSelector(
    (state) => state.narration.input.suggestions
  )
  const [isAutocompleteLoading, setIsAutocompleteLoading] =
    useState<boolean>(false)

    const lastCharacters = useAppSelector(selectLastLoadedCharacters)
    const lastCharacter = lastCharacters.find((char) => char.selected)

  const onSubmit = (e: React.FormEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!text || disabled) return
    trackEvent('bot_interact', {
      bot: novelTitle,
      time: Date.now() - lastInteractionTime,
      prevented: isInteractionDisabled,
    })
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      })
      return
    }
    lastInteractionTime = Date.now()
    dispatch(
      interactionStart({
        text,
        sceneId: scene?.id || '',
        roles: scene?.roles.map((r) => r.role) || [],
        servicesEndpoint,
        selectedRole: lastResponse?.selectedRole || '',
        voices: lastCharacter?.voices
      })
    )
  }

  const onAutocomplete = async (e: React.MouseEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      })
      return
    }
    if (suggestions.length > 0) {
      const newSuggestions = [...suggestions]
      const first = newSuggestions.shift()
      if (first) newSuggestions.push(first)
      dispatch(setSuggestions(newSuggestions))
      dispatch(setInputText(newSuggestions[0]))
      return
    }
    setIsAutocompleteLoading(true)
    try {
      const promptBuilder = new PromptBuilder<AlpacaSuggestionStrategy>({
        maxNewTokens: 35,
        strategy: new AlpacaSuggestionStrategy('llama'),
        trucationLength: 4096,
      })
      const prompt = promptBuilder.buildPrompt(state, 30)
      const stream = textCompletion({
        template: prompt.template,
        variables: prompt.variables,
        model: state.settings.model,
        serviceBaseUrl: servicesEndpoint,
      })

      let response: string[] = []
      for await (const result of stream) {
        response = promptBuilder.completeResponse(response, result, state)
      }
      dispatch(setInputText(response[0]))
      dispatch(setSuggestions(response))
      setIsAutocompleteLoading(false)
    } catch (err) {
      setIsAutocompleteLoading(false)
      console.error(err)
    }
  }

  return (
    <div className="InputBox">
      <form
        className={classNames({
          InputBox__form: true,
          'InputBox__form--disabled': disabled,
        })}
        onSubmit={onSubmit}
      >
        <textarea
          className="InputBox__input scrollbar"
          value={text}
          onChange={(e) => !disabled && dispatch(setInputText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              onSubmit(e)
            }
          }}
          autoComplete="off"
          rows={1}
          placeholder="Type a message..."
        />
        <button
          className={classNames({
            'InputBox__suggestion-trigger': true,
            'InputBox__suggestion-trigger--disabled': disabled,
            'InputBox__suggestion-trigger--generated': suggestions.length > 0,
          })}
          disabled={disabled || isAutocompleteLoading}
          data-tooltip-id={`suggestion-tooltip`}
          data-tooltip-html={!suggestions.length ? 'Autocomplete' : ''}
          data-tooltip-varaint="light"
          onClick={onAutocomplete}
        >
          {isAutocompleteLoading ? <Loader /> : <GiFeather />}
        </button>
        <button className="InputBox__submit" disabled={disabled}>
          <FaPaperPlane />
        </button>
      </form>
      <Tooltip id="suggestion-tooltip" place="top" />
    </div>
  )
}

export default InputBox
