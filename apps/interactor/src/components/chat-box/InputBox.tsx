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
  selectLastLoadedResponse,
} from '../../state/selectors'
import { useAppContext } from '../../App.context'

import './InputBox.scss'
import { toast } from 'react-toastify'
import classNames from 'classnames'
import { Tooltip } from '@mikugg/ui-kit'
import { AlpacaSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSuggestionStrategy'
import textCompletion from '../../libs/textCompletion'
import React, { useState } from 'react'
import { Loader } from '../common/Loader'
import PromptBuilder from '../../libs/prompts/PromptBuilder'
import { FaStore } from 'react-icons/fa6'
import { setInventoryVisibility } from '../../state/slices/inventorySlice'

import { _i18n } from '../../libs/lang/i18n'

const InputBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const { servicesEndpoint, isInteractionDisabled, apiEndpoint } =
    useAppContext()
  const { text, disabled } = useAppSelector((state) => state.narration.input)
  const state = useAppSelector((state) => state)
  const scene = useAppSelector(selectCurrentScene)
  const lastResponse = useAppSelector(selectLastLoadedResponse)
  const suggestions = useAppSelector(
    (state) => state.narration.input.suggestions
  )
  const showInventory = useAppSelector((state) => state.inventory.showInventory)
  const [isAutocompleteLoading, setIsAutocompleteLoading] =
    useState<boolean>(false)

  const interactionsCount = Object.keys(state.narration.interactions).length

  const sendMessage = (text: string) => {
    if (isInteractionDisabled) {
      toast.warn(_i18n('WARNING__PLEASE_LOG_IN'), {
        position: 'top-center',
        style: {
          top: 10,
        },
      })
      return
    }
    dispatch(
      interactionStart({
        text,
        sceneId: scene?.id || '',
        characters: scene?.characters.map((r) => r.characterId) || [],
        servicesEndpoint,
        apiEndpoint,
        selectedCharacterId: lastResponse?.selectedCharacterId || '',
      })
    )
  }

  const onSubmit = (e: React.FormEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (!text || disabled) return

    sendMessage(text)
  }

  const onAutocomplete = async (e: React.MouseEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()
    if (isInteractionDisabled) {
      toast.warn(_i18n('WARNING__PLEASE_LOG_IN'), {
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
        identifier: `${Date.now()}`,
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

  const onInventory = (e: React.MouseEvent<unknown>) => {
    e.stopPropagation()
    e.preventDefault()

    dispatch(
      setInventoryVisibility(
        showInventory === 'initial' || showInventory === 'closed'
          ? 'open'
          : 'closed'
      )
    )
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
          placeholder={_i18n('INPUT_BOX_PLACE_HOLDER')}
        />
        {interactionsCount ? (
          <button
            className="InputBox__inventory"
            data-tooltip-id="inventory-tooltip"
            data-tooltip-content="Inventory"
            data-tooltip-varaint="light"
            disabled={disabled}
            onClick={onInventory}
          >
            <FaStore />
          </button>
        ) : null}
        <button
          className={classNames({
            'InputBox__suggestion-trigger': true,
            'InputBox__suggestion-trigger--disabled': disabled,
            'InputBox__suggestion-trigger--generated': suggestions.length > 0,
          })}
          disabled={disabled || isAutocompleteLoading}
          data-tooltip-id={`suggestion-tooltip`}
          data-tooltip-html={
            !suggestions.length ? _i18n('TOOLTIP_AUTOCOMPLETE') : ''
          }
          data-tooltip-varaint="light"
          onClick={onAutocomplete}
        >
          {isAutocompleteLoading ? <Loader /> : <GiFeather />}
        </button>
        <button className="InputBox__submit" disabled={disabled}>
          <FaPaperPlane />
        </button>
      </form>
      <Tooltip id="inventory-tooltip" place="top" />
      <Tooltip id="suggestion-tooltip" place="top" />
    </div>
  )
}

export default InputBox
