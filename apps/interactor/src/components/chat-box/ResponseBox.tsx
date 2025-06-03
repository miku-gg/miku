import { Tooltip, Loader } from '@mikugg/ui-kit';

import { useEffect, useRef, useState } from 'react';

import { FaDice, FaForward } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { IoIosBookmarks, IoIosMove } from 'react-icons/io';
import {
  selectCurrentScene,
  selectCurrentSwipeResponses,
  selectDisplayingCutScene,
  selectLastLoadedCharacters,
  selectLastLoadedResponse,
  selectLastSelectedCharacter,
} from '../../state/selectors';

import classNames from 'classnames';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { useFillTextTemplate } from '../../libs/hooks';
import {
  characterResponseStart,
  continueResponse,
  selectCharacterOfResponse,
  swipeResponse,
} from '../../state/slices/narrationSlice';
import {
  ResponseFormat,
  setEditModal,
  setIsDraggable,
  setRegenerateEmotionModal,
} from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { TextFormatter } from '../common/TextFormatter';
import './ResponseBox.scss';
import TTSPlayer from './TTSPlayer';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useI18n } from '../../libs/i18n';
import { GiBrain } from 'react-icons/gi';

const ReasoningText = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ResponseBox__reasoning-wrapper">
      <button className="ResponseBox__reasoning-toggle" onClick={() => setOpen(!open)}>
        <GiBrain className="ResponseBox__brain-icon-small" />
        <span className="ResponseBox__reasoning-toggle-text">{open ? 'Hide reasoning' : 'Show reasoning'}</span>
      </button>
      <div className={classNames('ResponseBox__reasoning-content', { open })}>So,{text}</div>
    </div>
  );
};

const TextToSpanPerLetter = ({ text }: { text: string }) => {
  return text.split('').map((letter, index) => <span key={index}>{letter}</span>);
};

// Indicator shown when the response is loading: thinking or reasoning
const ThinkingIndicator = ({ reasoningEnabled }: { reasoningEnabled: boolean }) => (
  <div className={classNames('ResponseBox__thinking', { 'ResponseBox__thinking--reasoning': reasoningEnabled })}>
    <Loader />
    <span className="ResponseBox__thinking-text">
      <TextToSpanPerLetter text="Thinking..." />
    </span>
  </div>
);

const ResponseBox = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint, apiEndpoint, isInteractionDisabled, assetLinkLoader, isPublishedDemo } = useAppContext();
  const reasoningEnabled = useAppSelector((state) => state.settings.prompt.reasoningEnabled);
  const responseDiv = useRef<HTMLDivElement>(null);
  const lastReponse = useAppSelector(selectLastLoadedResponse);
  const isLastResponseFetching = useAppSelector(
    (state) => state.narration.responses[state.narration.currentResponseId]?.fetching || false,
  );
  const isDraggable = useAppSelector((state) => state.settings.chatBox.isDraggable);
  const scene = useAppSelector(selectCurrentScene);
  const characters = useAppSelector((state) => state.novel.characters);
  const lastCharacters = useAppSelector(selectLastLoadedCharacters);
  const swipes = useAppSelector(selectCurrentSwipeResponses);
  const { disabled } = useAppSelector((state) => state.narration.input);
  const displayCharacter = useAppSelector(selectLastSelectedCharacter);
  const displayCharacterData = characters.find((c) => c.id === displayCharacter.id);
  const displayingCutScene = useAppSelector(selectDisplayingCutScene);
  const displayText = useFillTextTemplate(
    !displayingCutScene ? displayCharacter.text : '',
    displayCharacterData?.name || '',
  );
  const { isMobileApp } = useAppContext();
  const responseFormat = useAppSelector((state) => state.settings.text.responseFormat);
  const { i18n } = useI18n();

  const handleRegenerateClick = () => {
    trackEvent('interaction_regenerate');
    dispatch(setRegenerateEmotionModal({ opened: true }));
  };

  const handleContinueClick = () => {
    trackEvent('interaction_continue');
    dispatch(
      continueResponse({
        apiEndpoint,
        servicesEndpoint,
      }),
    );
  };

  const handleEditClick = () => {
    if (lastReponse) {
      dispatch(
        setEditModal({
          opened: true,
          id: lastReponse?.id,
        }),
      );
    }
  };

  useEffect(() => {
    if (responseDiv.current) {
      responseDiv.current.scrollTop = responseDiv.current.scrollHeight;
    }
  }, [lastCharacters]);

  if (!lastCharacters.length) {
    return null;
  }

  const isCharacterGenerated = (characterId: string) =>
    !!lastReponse?.characters.find((r) => r.characterId === characterId)?.characterId;

  const isMobile = isMobileApp || window.innerWidth < 820;

  const swipeButtons = swipes?.map((swipe) => {
    if (!swipe?.id) return null;
    return (
      <button
        className={`ResponseBox__swipe ${lastReponse?.id === swipe.id ? 'selected' : ''}`}
        key={`swipe-${swipe.id}`}
        onClick={() => dispatch(swipeResponse(swipe.id))}
        disabled={disabled}
      >
        <IoIosBookmarks />
      </button>
    );
  });

  return (
    <div
      className={classNames({
        ResponseBox: true,
        MobileApp: isMobile,
        'ResponseBox--has-swipes': (swipes?.length || 0) > 1,
        'ResponseBox--vn-style': responseFormat === ResponseFormat.VNStyle,
      })}
    >
      {!isMobile ? (
        <button
          className={`ResponseBox__move ${isDraggable ? 'dragging' : ''}`}
          onClick={() => dispatch(setIsDraggable(!isDraggable))}
        >
          <IoIosMove />
        </button>
      ) : null}

      <div className={`ResponseBox__text ${isMobile ? 'MobileApp__text' : ''} scrollbar`} ref={responseDiv}>
        {isLastResponseFetching ? (
          <ThinkingIndicator reasoningEnabled={reasoningEnabled} />
        ) : (
          <>
            {displayCharacter.reasoning ? <ReasoningText text={displayCharacter.reasoning} /> : null}
            <TextFormatter
              text={displayText}
              children={
                !disabled &&
                !isInteractionDisabled &&
                displayCharacter.id === lastCharacters[lastCharacters.length - 1].id ? (
                  <button className="ResponseBox__continue" onClick={handleContinueClick}>
                    continue
                    <FaForward />
                  </button>
                ) : null
              }
            />
          </>
        )}
      </div>

      {(scene?.characters.length || 0) > 1 ? (
        <div className="ResponseBox__characters">
          {[
            ...(lastReponse?.characters.map((c) => c.characterId) || []),
            ...(scene?.characters
              .filter(({ characterId }) => !isCharacterGenerated(characterId))
              .map((c) => c.characterId) || []),
          ]
            .filter(
              (characterId) =>
                !!characters.find((c) => c.id === characterId) &&
                !!characters.find((c) => c.id === characterId)?.profile_pic,
            )
            .map((characterId) => {
              const character = characters.find((c) => c.id === characterId);
              const isGenerated = isCharacterGenerated(characterId);
              return (
                <div
                  className={classNames({
                    ResponseBox__character: true,
                    generated: isGenerated,
                    selected: displayCharacter?.id === characterId,
                  })}
                  key={`response-character-${characterId}`}
                  data-tooltip-id={`ResponseBox__character-tooltip`}
                  data-tooltip-content={character?.name || ''}
                  data-tooltip-variant="dark"
                  data-tooltip-events={['hover']}
                >
                  <button
                    className="ResponseBox__character-button"
                    onClick={() =>
                      dispatch(
                        isGenerated
                          ? selectCharacterOfResponse({
                              responseId: lastReponse?.id || '',
                              characterId,
                            })
                          : characterResponseStart({
                              apiEndpoint,
                              servicesEndpoint,
                              characterId,
                            }),
                      )
                    }
                    disabled={disabled}
                  >
                    <img src={assetLinkLoader(character?.profile_pic || '', AssetDisplayPrefix.CHARACTER_PIC_SMALL)} />
                  </button>
                  <Tooltip id="ResponseBox__character-tooltip" place="top"></Tooltip>
                </div>
              );
            })}
        </div>
      ) : null}
      <div className="ResponseBox__actions">
        {!disabled || isPublishedDemo ? <TTSPlayer /> : null}
        {!disabled && lastReponse?.parentInteractionId && (swipes?.length || 0) < 8 ? (
          <button className="ResponseBox__regenerate" onClick={handleRegenerateClick}>
            <FaDice />
            <span className="ResponseBox__action-text">{i18n('regenerate')}</span>
          </button>
        ) : null}
        {!disabled && !isInteractionDisabled ? (
          <button className="ResponseBox__edit" onClick={handleEditClick}>
            <FaPencil />
            <span className="ResponseBox__action-text">Edit</span>
          </button>
        ) : null}
      </div>
      {!disabled && (swipes?.length || 0) > 1 ? <div className="ResponseBox__swipes">{swipeButtons}</div> : null}
    </div>
  );
};

export default ResponseBox;
