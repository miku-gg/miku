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
import { ResponseSuggestionPromptStrategy } from '../../libs/prompts/strategies/suggestion/ResponseSuggestionPromptStrategy';
import textCompletion from '../../libs/textCompletion';
import {
  ModelType,
  ResponseFormat,
  setDebugModal,
  setModel,
  setModelSelectorModal,
  userDataFetchStart,
} from '../../state/slices/settingsSlice';
import { Loader } from '../common/Loader';
import './InputBox.scss';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import { useI18n } from '../../libs/i18n';

const InputBox = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint, isInteractionDisabled, apiEndpoint } = useAppContext();

  const textAreaRef: RefObject<HTMLTextAreaElement> = useRef(null);
  const [textAreaRows, setTextAreaRows] = useState<number>(1);

  const { text, disabled } = useAppSelector((state) => state.narration.input);
  const { isMobileApp } = useAppContext();
  const isTesterUser = useAppSelector((state) => state.settings.user.isTester);

  const isPremium = useAppSelector((state) => state.settings.user.isPremium);
  const model = useAppSelector((state) => state.settings.model);
  const state = useAppSelector((state) => state);
  const scene = useAppSelector(selectCurrentScene);
  const lastResponse = useAppSelector(selectLastLoadedResponse);
  const suggestions = useAppSelector((state) => state.narration.input.suggestions);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState<boolean>(false);
  const displayingLastSentence = useAppSelector(
    (state) => state.settings.displayingLastSentence && state.settings.text.responseFormat === ResponseFormat.VNStyle,
  );
  const { i18n } = useI18n();

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
        isNewScene: false,
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

    if (text === '/test') {
      dispatch(setInputText(''));
      if (isTesterUser) {
        dispatch(setModelSelectorModal(true));
      }
      return;
    }

    if (text === '/model' || text === '/nemo') {
      dispatch(setInputText(''));

      // eslint-disable-next-line
      // @ts-ignore
      if (model !== 'RP_TEST' && model !== 'RP_TEST_SMART') {
        // eslint-disable-next-line
        // @ts-ignore
        dispatch(setModel(isPremium ? 'RP_TEST' : 'RP_TEST_SMART'));
        toast.success(`${isPremium ? 'TEST 32K' : 'TEST 4K'} model selected`);
      } else {
        dispatch(setModel(isPremium ? ModelType.RP_SMART : ModelType.RP));
        toast.info('TEST model unselected');
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
      TextAreaRowCalculator(newSuggestions[0]);
      return;
    }
    setIsAutocompleteLoading(true);
    try {
      const modelMetadata = await retrieveModelMetadata(servicesEndpoint, state.settings.model);
      const promptBuilder = new PromptBuilder<ResponseSuggestionPromptStrategy>({
        maxNewTokens: 35,
        strategy: new ResponseSuggestionPromptStrategy(modelMetadata.strategy),
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
      TextAreaRowCalculator(response[0]);
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

  useEffect(() => {
    dispatch(userDataFetchStart({ apiEndpoint }));
  }, [apiEndpoint]);

  useEffect(() => {
    if (!text.length) {
      TextAreaRowCalculator(text);
    }
  }, [text]);

  return (
    <div
      className={classNames({
        InputBox: true,
        'InputBox--disabled': disabled || displayingLastSentence,
        isMobileApp: isMobileApp,
      })}
    >
      <form className="InputBox__form" onSubmit={onSubmit}>
        <button
          className={classNames({
            'InputBox__suggestion-trigger': true,
            'InputBox__suggestion-trigger--disabled': disabled || displayingLastSentence,
            'InputBox__suggestion-trigger--generated': suggestions.length > 0,
          })}
          disabled={disabled || displayingLastSentence || isAutocompleteLoading}
          data-tooltip-id={`suggestion-tooltip`}
          data-tooltip-html={!suggestions.length && !isMobileApp ? 'Autocomplete' : ''}
          data-tooltip-varaint="light"
          onClick={onAutocomplete}
        >
          {isAutocompleteLoading ? <Loader /> : <GiFeather />}
        </button>

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
          placeholder={i18n('type_a_message')}
          ref={textAreaRef}
          disabled={disabled || displayingLastSentence}
        />

        <button className="InputBox__submit" disabled={disabled || displayingLastSentence}>
          <FaPaperPlane />
        </button>
      </form>
      <Tooltip id="inventory-tooltip" place="top" />
      <Tooltip id="suggestion-tooltip" place="top" />
    </div>
  );
};

export default InputBox;
