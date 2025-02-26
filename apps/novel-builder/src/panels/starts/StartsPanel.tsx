import { Button, Dropdown, Input, AreYouSure, CheckBox } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import {
  createStart,
  deleteStart,
  updateStart,
  reorderStart,
  updateUseModalStartSelection,
} from '../../state/slices/novelFormSlice';
import { selectScenes } from '../../state/selectors';
import './StartsPanel.scss';
import { useState } from 'react';
import { TokenDisplayer } from '../../components/TokenDisplayer';
import { TOKEN_LIMITS } from '../../data/tokenLimits';
import SceneSelector, { SceneSelectorModal } from '../../modals/scene/SceneSelector';
import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';
import { IoMdArrowUp, IoMdArrowDown } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { CutScenePartsRenderForGlobal } from '../../modals/cutscenes/CutScenePartsRenderForGlobal';

export default function StartsPanel() {
  const dispatch = useAppDispatch();
  const useModalForStartSelection = useAppSelector((state) => state.novel.useModalForStartSelection);
  const starts = useAppSelector((state) => state.novel.starts);
  const characters = useAppSelector((state) => state.novel.characters);
  const scenes = useAppSelector(selectScenes);
  const { openModal: openAreYouSureModal } = AreYouSure.useAreYouSure();
  const [newStartOpened, setNewStartOpened] = useState<boolean>(false);

  const getSceneCharactersStartResponse = (sceneId: string) => {
    const scene = scenes.find((scene) => scene.id === sceneId);
    return (
      scene?.characters.map((character) => {
        const outfit = character.card?.data.extensions.mikugg_v2.outfits.find(
          (outfit) => outfit.id === character.outfit,
        );
        return {
          characterId: character.id || '',
          emotion: outfit?.emotions[0]?.id || '',
          text: '',
          pose: 'standing',
        };
      }) || []
    );
  };

  return (
    <div className="StartsPanel">
      <h1 className="StartsPanel__title">Starts</h1>
      <div className="StartsPanel__description">
        List all possible starting points for your novel. For each, indicate the start scene and character's message.
      </div>
      <div className="StartsPanel__use-modal-checkbox">
        <CheckBox
          value={!!useModalForStartSelection}
          onChange={(e) => dispatch(updateUseModalStartSelection(e.target.checked))}
          label="Use carousel for start selection"
        />
      </div>

      <div className="StartsPanel__list">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <AnimatePresence>
          {starts.map((start, index) => {
            const scene = scenes.find((scene) => scene.id === start.sceneId);
            return (
              <motion.div
                layout
                key={start.id}
                className="StartsPanel__item"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="StartsPanel__item-reorder">
                  {index > 0 && (
                    <Button
                      theme="transparent"
                      onClick={() => dispatch(reorderStart({ startId: start.id, direction: 'up' }))}
                    >
                      <IoMdArrowUp />
                    </Button>
                  )}
                  {index < starts.length - 1 && (
                    <Button
                      theme="transparent"
                      onClick={() => dispatch(reorderStart({ startId: start.id, direction: 'down' }))}
                    >
                      <IoMdArrowDown />
                    </Button>
                  )}
                </div>
                <div className="StartsPanel__item-spec">
                  <div className="StartsPanel__item-scene">
                    <SceneSelector
                      multiSelect={false}
                      nonDeletable
                      value={start.sceneId}
                      onChange={(sceneId) => {
                        if (sceneId) {
                          dispatch(
                            updateStart({
                              ...start,
                              sceneId,
                              characters: getSceneCharactersStartResponse(sceneId),
                            }),
                          );
                        }
                      }}
                    />
                  </div>

                  <div className="StartsPanel__item-docs">
                    <Input
                      label="Title"
                      placeHolder="Title of this starting point..."
                      value={start.title || ''}
                      maxLength={30}
                      onChange={(e) =>
                        dispatch(
                          updateStart({
                            ...start,
                            title: e.target.value,
                          }),
                        )
                      }
                    />
                    <Input
                      label="Description"
                      placeHolder="Description of this starting point..."
                      value={start.description || ''}
                      maxLength={60}
                      onChange={(e) =>
                        dispatch(
                          updateStart({
                            ...start,
                            description: e.target.value,
                          }),
                        )
                      }
                    />
                  </div>
                </div>
                <div className="StartsPanel__item-prompt">
                  {start.characters.map((_character, index) => {
                    const character = characters.find((char) => char.id === _character.characterId);
                    const characterSceneOutfit = scene?.characters.find((char) => char.id === character?.id)?.outfit;
                    const outfit = character?.card.data.extensions.mikugg_v2.outfits.find(
                      (outfit) => outfit.id === characterSceneOutfit,
                    );

                    const emotionsToUse =
                      outfit?.template === 'single-emotion'
                        ? EMOTION_GROUP_TEMPLATES['base-emotions'].emotionIds
                        : outfit?.emotions.map((emotion) => emotion.id) || [];

                    const selectedEmotionIndex = Math.max(
                      emotionsToUse.findIndex((emotionId) => emotionId === _character.emotion) || 0,
                      0,
                    );

                    return (
                      <div
                        className="StartsPanel__item-prompt-character"
                        key={`start-message-${start.id}-${character?.id}`}
                      >
                        <div className="StartsPanel__item-prompt-character-header">
                          <div className="StartsPanel__item-prompt-character-title">
                            {character?.name} first message
                          </div>
                          <div className="StartsPanel__item-prompt-character-title-right">
                            <div className="StartsPanel__item-prompt-character-emotion">
                              <Dropdown
                                items={emotionsToUse.map((emotionId) => ({
                                  name: emotionId,
                                  value: emotionId,
                                }))}
                                selectedIndex={selectedEmotionIndex}
                                onChange={(indexEmotion) => {
                                  dispatch(
                                    updateStart({
                                      ...start,
                                      characters: start.characters.map((char, i) =>
                                        i === index
                                          ? {
                                              ...char,
                                              emotion: emotionsToUse[indexEmotion] || '',
                                            }
                                          : char,
                                      ),
                                    }),
                                  );
                                }}
                              />
                            </div>
                            <TokenDisplayer text={_character.text || ''} limits={TOKEN_LIMITS.STARTS_FIRST_MESSAGE} />
                          </div>
                        </div>
                        <Input
                          value={_character.text || ''}
                          isTextArea
                          placeHolder="Type the character's first message here..."
                          onChange={(e) =>
                            dispatch(
                              updateStart({
                                ...start,
                                characters: start.characters.map((char, i) =>
                                  i === index ? { ...char, text: e.target.value } : char,
                                ),
                              }),
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="StartsPanel__item-remove">
                  <Button
                    theme="primary"
                    onClick={() => {
                      openAreYouSureModal({
                        onYes: () => {
                          dispatch(deleteStart(start.id));
                        },
                        description: 'Are you sure you want to remove this start?',
                        yesLabel: 'Remove',
                      });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="StartsPanel__add-button">
        <Button theme="secondary" onClick={() => setNewStartOpened(true)}>
          Add Start
        </Button>
      </div>
      <div className="StartsPanel__global-cutscene">
        <CutScenePartsRenderForGlobal />
      </div>
      <SceneSelectorModal
        opened={newStartOpened}
        onCloseModal={() => setNewStartOpened(false)}
        onSelectScene={(sceneId) => {
          dispatch(createStart(sceneId));
          setNewStartOpened(false);
        }}
      />
    </div>
  );
}
