import { FaPaperPlane } from 'react-icons/fa';
import { GiFeather } from 'react-icons/gi';
import { useAppContext } from '../../App.context';
import { selectCurrentScene, selectLastLoadedResponse } from '../../state/selectors';
import { interactionStart, setInputText, setSuggestions } from '../../state/slices/narrationSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import { Tooltip } from '@mikugg/ui-kit';
import classNames from 'classnames';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { AlpacaSuggestionStrategy } from '../../libs/prompts/strategies/suggestion/AlpacaSuggestionStrategy';
import textCompletion from '../../libs/textCompletion';
import { setDebugModal, setModelSelectorModal, userDataFetchStart } from '../../state/slices/settingsSlice';
import { Loader } from '../common/Loader';
import './InputBox.scss';

const InputBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint, isInteractionDisabled, apiEndpoint } = useAppContext();

  const textAreaRef: RefObject<HTMLTextAreaElement> = useRef(null);
  const [textAreaRows, setTextAreaRows] = useState<number>(1);

  const { text, disabled } = useAppSelector((state) => state.narration.input);
  const { isMobileApp } = useAppContext();
  const isTesterUser = useAppSelector((state) => state.settings.user.isTester);

  const state = useAppSelector((state) => state);
  const scene = useAppSelector(selectCurrentScene);
  const lastResponse = useAppSelector(selectLastLoadedResponse);
  const suggestions = useAppSelector((state) => state.narration.input.suggestions);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState<boolean>(false);

  useEffect(() => {
    dispatch(userDataFetchStart({ apiEndpoint }));
  }, [apiEndpoint]);

  const sendMessage = (text: string) => {
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }
    dispatch(
      interactionStart({
        text,
        sceneId: scene?.id || '',
        characters: scene?.characters.map((r) => r.characterId) || [],
        servicesEndpoint,
        apiEndpoint,
        selectedCharacterId: lastResponse?.selectedCharacterId || '',
      }),
    );
  };

  const onSubmit = (e: React.FormEvent<unknown>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!text || disabled) return;

    if (text === '/debug') {
      dispatch(setInputText(''));
      dispatch(setDebugModal(true));
      return;
    }

    if (text === '/model') {
      dispatch(setInputText(''));
      if (isTesterUser) {
        dispatch(setModelSelectorModal(true));
      }
      return;
    }

    sendMessage(text);
  };

  const onAutocomplete = async (e: React.MouseEvent<unknown>) => {
    e.stopPropagation();
    e.preventDefault();
    if (isInteractionDisabled) {
      toast.warn('Please log in to interact.', {
        position: 'top-center',
        style: {
          top: 10,
        },
      });
      return;
    }
    if (suggestions.length > 0) {
      const newSuggestions = [...suggestions];
      const first = newSuggestions.shift();
      if (first) newSuggestions.push(first);
      dispatch(setSuggestions(newSuggestions));
      dispatch(setInputText(newSuggestions[0]));
      return;
    }
    setIsAutocompleteLoading(true);
    try {
      const promptBuilder = new PromptBuilder<AlpacaSuggestionStrategy>({
        maxNewTokens: 35,
        strategy: new AlpacaSuggestionStrategy('llama'),
        truncationLength: 4096,
      });
      const prompt = promptBuilder.buildPrompt(state, 30);
      const stream = textCompletion({
        template: prompt.template,
        variables: prompt.variables,
        model: state.settings.model,
        serviceBaseUrl: servicesEndpoint,
        identifier: `${Date.now()}`,
      });

      let response: string[] = [];
      for await (const result of stream) {
        response = promptBuilder.completeResponse(response, result, state);
      }
      dispatch(setInputText(response[0]));
      dispatch(setSuggestions(response));
      setIsAutocompleteLoading(false);
    } catch (err) {
      setIsAutocompleteLoading(false);
      console.error(err);
    }
  };

  const TextAreaRowCalculator = (value: string) => {
    if (textAreaRef.current) {
      const newRows = Math.ceil(value.length / 2 / (textAreaRef.current.offsetWidth / textAreaRef.current.cols));
      setTextAreaRows(newRows === 0 || value.length === 0 ? 1 : newRows);
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    !disabled && dispatch(setInputText(value));
    TextAreaRowCalculator(value);
  };

  return (
    <div className={`InputBox ${isMobileApp ? 'IsMobileApp' : ''}`}>
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
          onChange={handleTextAreaChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              onSubmit(e);
            }
          }}
          autoComplete="off"
          rows={textAreaRows <= 3 ? textAreaRows : 3}
          placeholder="Type a message..."
          ref={textAreaRef}
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
      <Tooltip id="inventory-tooltip" place="top" />
      <Tooltip id="suggestion-tooltip" place="top" />
    </div>
  );
};

export default InputBox;
