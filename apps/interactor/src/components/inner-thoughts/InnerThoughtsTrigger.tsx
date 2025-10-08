import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Tooltip } from '@mikugg/ui-kit';
import { useAppContext } from '../../App.context';
import { useAppDispatch, useAppSelector } from '../../state/store';
import {
  selectLastLoadedResponse,
  selectInnerThoughtsForCharacter,
  selectIsCurrentlyAtStart,
} from '../../state/selectors';
import { updateResponse, setFreeThoughtUsed } from '../../state/slices/narrationSlice';
import { setInnerThoughtsModal } from '../../state/slices/settingsSlice';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { RoleplayPromptStrategy } from '../../libs/prompts/strategies/roleplay/RoleplayPromptStrategy';
import textCompletion from '../../libs/textCompletion';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { useI18n } from '../../libs/i18n';
import { toast } from 'react-toastify';
import './InnerThoughtsTrigger.scss';

export const ThoughtBalloon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M15.995 2a4.63 4.63 0 0 0-3.607 1.725a5.517 5.517 0 0 0-2.59-.649c-3.273 0-5.707 2.773-5.652 5.845C2.286 9.858 1 11.769 1 14.005c0 2.227.96 3.609 1.974 4.416c.416.331.828.557 1.161.709c-.028 3.053 2.4 5.794 5.653 5.794c.946 0 1.824-.238 2.595-.647a4.63 4.63 0 0 0 7.208-.002a5.517 5.517 0 0 0 2.59.649c3.272 0 5.706-2.77 5.653-5.84c1.87-.93 3.166-2.84 3.166-5.079c0-2.227-.96-3.609-1.974-4.416a5.579 5.579 0 0 0-1.161-.709c.028-3.053-2.4-5.794-5.653-5.794a5.51 5.51 0 0 0-2.596.648A4.639 4.639 0 0 0 15.995 2Zm-2.397 3.534A2.645 2.645 0 0 1 15.995 4c1.062 0 1.976.62 2.421 1.554a1 1 0 0 0 1.53.348a3.582 3.582 0 0 1 2.266-.816c2.245 0 3.95 2.084 3.61 4.304a1.002 1.002 0 0 0 .392.955c.083.062.158.098.178.107c.053.025.1.042.116.048l.094.032l.024.008c.076.026.176.06.294.11c.24.1.552.258.86.503c.582.464 1.22 1.29 1.22 2.852c0 1.62-1.056 2.993-2.54 3.487a1 1 0 0 0-.671 1.107c.354 2.225-1.354 4.325-3.607 4.325c-.849 0-1.626-.309-2.273-.82a1 1 0 0 0-1.527.361A2.645 2.645 0 0 1 15.985 24c-1.052 0-1.964-.621-2.4-1.54a1 1 0 0 0-1.53-.352a3.582 3.582 0 0 1-2.267.816c-2.245 0-3.95-2.084-3.61-4.304a1.002 1.002 0 0 0-.392-.955a1.016 1.016 0 0 0-.178-.107a1.287 1.287 0 0 0-.116-.048l-.094-.032l-.024-.008a4.314 4.314 0 0 1-.294-.11a3.62 3.62 0 0 1-.86-.503C3.639 16.392 3 15.567 3 14.005c0-1.624 1.05-2.997 2.526-3.5a1 1 0 0 0 .665-1.103c-.354-2.226 1.353-4.326 3.607-4.326c.849 0 1.626.309 2.273.82a1 1 0 0 0 1.527-.362ZM4.5 24a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7ZM3 27.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0Z"
      clipRule="evenodd"
    ></path>
  </svg>
);

interface InnerThoughtsTriggerProps {
  characterId: string;
}

const InnerThoughtsTrigger: React.FC<InnerThoughtsTriggerProps> = ({ characterId }) => {
  const { servicesEndpoint, isProduction } = useAppContext();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const lastResponse = useAppSelector(selectLastLoadedResponse);
  const { disabled: isCurrentResponseFetching } = useAppSelector((state) => state.narration.input);
  const isPremium = useAppSelector((state) => state.settings.user.isPremium);
  const freeThoughtUsed = useAppSelector((state) => state.narration.freeThoughtUsed);
  const isCurrentlyAtStart = useAppSelector(selectIsCurrentlyAtStart);
  const existingInnerThoughts = useAppSelector((state) => selectInnerThoughtsForCharacter(state, characterId));
  const innerThoughtsModalOpen = useAppSelector((state) => state.settings.modals.innerThoughts?.opened);
  const { i18n } = useI18n();

  const [isGeneratingThoughts, setIsGeneratingThoughts] = React.useState(false);

  const { isMobileApp } = useAppContext();

  const handleClick = () => {
    // Don't allow clicking when response is fetching
    if (isCurrentResponseFetching) {
      return;
    }

    // If not premium and free thought already used, prompt upgrade
    if (!isPremium && freeThoughtUsed && !existingInnerThoughts) {
      postMessage(CustomEventType.OPEN_PREMIUM);
      return;
    }

    // If inner thoughts already exist, just show them
    if (existingInnerThoughts) {
      dispatch(setInnerThoughtsModal({ opened: true, characterId }));
      return;
    }

    // Otherwise, generate new inner thoughts
    generateInnerThoughts();
  };

  const generateInnerThoughts = async () => {
    if (isGeneratingThoughts) return;

    // Check if there's already a response from this character
    const currentCharacterResponse = lastResponse?.characters.find((char) => char.characterId === characterId);
    if (!currentCharacterResponse || !currentCharacterResponse.text) {
      return;
    }

    setIsGeneratingThoughts(true);

    try {
      const modelMetadata = await retrieveModelMetadata(servicesEndpoint, state.settings.model);
      const promptBuilder = new PromptBuilder<RoleplayPromptStrategy>({
        maxNewTokens: 100,
        strategy: new RoleplayPromptStrategy(
          modelMetadata.strategy,
          state.novel.language || 'en',
          modelMetadata.has_reasoning,
          true, // includeInnerThoughts
        ),
        truncationLength: modelMetadata.truncation_length - 150,
      });

      const prompt = promptBuilder.buildPrompt(
        {
          state,
          currentCharacterId: characterId,
        },
        30,
      );

      const stream = textCompletion({
        template: prompt.template,
        variables: prompt.variables,
        model: state.settings.model,
        serviceBaseUrl: servicesEndpoint,
        identifier: `${Date.now()}`,
      });

      let response = lastResponse;
      if (!response) {
        setIsGeneratingThoughts(false);
        return;
      }

      for await (const result of stream) {
        response = promptBuilder.completeResponse(response, result, {
          state,
          currentCharacterId: characterId,
        });
      }

      const finalCharacter = response?.characters.find((char) => char.characterId === characterId);
      const originalResponse = finalCharacter?.innerThoughts;
      const finalResponse = originalResponse?.trim();

      if (finalResponse) {
        let displayThoughts = finalResponse;
        if (displayThoughts.endsWith('"')) {
          displayThoughts = displayThoughts.slice(0, -1);
        }

        dispatch(
          updateResponse({
            id: lastResponse?.id || '',
            characterId: characterId,
            text: lastResponse?.characters.find((char) => char.characterId === characterId)?.text || '',
            emotion: lastResponse?.characters.find((char) => char.characterId === characterId)?.emotion || '',
            innerThoughts: displayThoughts,
          }),
        );

        // Show the modal
        dispatch(setInnerThoughtsModal({ opened: true, characterId }));
        if (!isPremium) dispatch(setFreeThoughtUsed(true));
      } else {
        toast.error('Failed to generate inner thoughts');
      }

      setIsGeneratingThoughts(false);
    } catch (error) {
      setIsGeneratingThoughts(false);
      console.error(error);
      toast.error('Failed to generate inner thoughts');
    }
  };

  React.useEffect(() => {
    if (isCurrentResponseFetching && innerThoughtsModalOpen) {
      dispatch(setInnerThoughtsModal({ opened: false }));
    }
  }, [isCurrentResponseFetching, innerThoughtsModalOpen, dispatch]);

  // Don't show if this is the first response (no history)
  if (isCurrentlyAtStart) {
    return null;
  }

  const currentCharacterResponse = lastResponse?.characters.find((char) => char.characterId === characterId);
  const isDisabled = !currentCharacterResponse?.text || (!isPremium && freeThoughtUsed && !existingInnerThoughts);

  return (
    <div className="InnerThoughtsTrigger">
      <div
        className={`InnerThoughtsTrigger__container ${
          isMobileApp || window.innerWidth < 768 ? 'InnerThoughtsTrigger__container--always-visible' : ''
        } ${innerThoughtsModalOpen ? 'InnerThoughtsTrigger__container--showing' : ''}`}
      >
        {isGeneratingThoughts ? (
          <FaSpinner
            className="InnerThoughtsTrigger__icon InnerThoughtsTrigger__icon--spinner"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : isCurrentResponseFetching ? null : (
          <button
            data-tooltip-id="inner-thoughts-tooltip"
            data-tooltip-html={isDisabled && !isPremium && isProduction ? i18n('this_is_a_premium_feature') : ''}
            data-tooltip-varaint="light"
          >
            <ThoughtBalloon
              className={`InnerThoughtsTrigger__icon ${isDisabled ? 'InnerThoughtsTrigger__icon--disabled' : ''}`}
              onClick={innerThoughtsModalOpen ? undefined : handleClick}
            />
          </button>
        )}
      </div>
      <Tooltip id="inner-thoughts-tooltip" place="top" />
    </div>
  );
};

export default InnerThoughtsTrigger;
