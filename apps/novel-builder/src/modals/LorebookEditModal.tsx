import { AreYouSure, Button, CheckBox, Input, Modal, TagAutocomplete, Tooltip } from '@mikugg/ui-kit';
import { useCallback, useEffect, useRef } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { selectEditingLorebook } from '../state/selectors';
import { closeModal } from '../state/slices/inputSlice';
import {
  createEntry,
  deleteEntry,
  deleteLorebook,
  updateCharacter,
  updateEntry,
  updateLorebook,
  updateScene,
} from '../state/slices/novelFormSlice';
import { useAppSelector } from '../state/store';
import './LorebookEditModal.scss';

export default function LorebookEditModal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevEntriesLength = useRef(0);
  const dispatch = useDispatch();
  const lorebook = useAppSelector(selectEditingLorebook);
  const { openModal } = AreYouSure.useAreYouSure();
  const characters = useAppSelector((state) => state.novel.characters);
  const scenes = useAppSelector((state) => state.novel.scenes);

  const handleScrollToTop = useCallback(() => {
    if (containerRef.current) {
      if (lorebook?.entries && lorebook?.entries?.length > prevEntriesLength.current) {
        scrollToTop();
        prevEntriesLength.current = lorebook.entries.length;
      }
    }
  }, [lorebook?.entries]);

  useEffect(() => {
    handleScrollToTop();
  }, [handleScrollToTop]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: -containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const removeIdsFromCharacters = (id: string) => {
    const charactersWithLorebook = characters.filter((character) => character.lorebookIds?.includes(id));

    charactersWithLorebook.forEach((character) => {
      const updatedCharacter = {
        ...character,
        lorebookIds: character.lorebookIds?.filter((_id) => _id !== id),
      };
      dispatch(updateCharacter(updatedCharacter));
    });
  };

  const removeIdsFromScenes = (id: string) => {
    const scenesWithLorebook = scenes.filter((scene) => scene.lorebookIds?.includes(id));
    scenesWithLorebook.forEach((scene) => {
      const updatedScene = {
        ...scene,
        lorebookIds: scene.lorebookIds?.filter((_id) => _id !== id),
      };
      dispatch(updateScene(updatedScene));
    });
  };

  const handleDeleteLorebook = (id: string) => {
    openModal({
      title: 'Are you sure?',
      description: 'This action cannot be undone',
      onYes: () => {
        dispatch(closeModal({ modalType: 'lorebookEdit' }));
        removeIdsFromCharacters(id);
        removeIdsFromScenes(id);
        dispatch(deleteLorebook({ lorebookId: id }));
      },
    });
  };

  return (
    <Modal
      opened={!!lorebook}
      shouldCloseOnOverlayClick
      className="LorebookEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'lorebookEdit' }))}
    >
      {lorebook ? (
        <div className="CharacterLorebooks scrollbar">
          <h2 className="CharacterLorebooks__title">Edit Lorebook</h2>
          <Tooltip id="delete-tooltip" place="bottom" />
          <FaTrashAlt
            className="CharacterLorebooks__removeLorebook"
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Delete lorebook"
            onClick={() => {
              handleDeleteLorebook(lorebook.id);
            }}
          />
          <div className="CharacterLorebooks__form-top">
            <div className="CharacterLorebooks__form-top__name">
              <Input
                label="Lorebook name"
                placeHolder="Name for your memory book"
                value={lorebook?.name}
                onChange={(e) =>
                  dispatch(
                    updateLorebook({
                      lorebookId: lorebook.id,
                      lorebook: { ...lorebook, name: e.target.value },
                    }),
                  )
                }
              />
            </div>
            <div className="CharacterLorebooks__form-top__global">
              <CheckBox
                label="Global lorebook"
                value={lorebook?.isGlobal}
                onChange={(e) =>
                  dispatch(
                    updateLorebook({
                      lorebookId: lorebook.id,
                      lorebook: { ...lorebook, isGlobal: e.target.checked },
                    }),
                  )
                }
              />
            </div>
          </div>
          <div>
            <label>Lorebook description</label>
            <Input
              placeHolder="Description of your memory book"
              value={lorebook?.description}
              onChange={(e) =>
                dispatch(
                  updateLorebook({
                    lorebookId: lorebook.id,
                    lorebook: {
                      ...lorebook!,
                      description: e.target.value,
                    },
                  }),
                )
              }
            />
          </div>
          <div className="CharacterLorebooks__createEntry">
            <label>Entries</label>
            <Button
              theme="gradient"
              onClick={() => {
                dispatch(
                  createEntry({
                    lorebookId: lorebook.id,
                  }),
                );
              }}
            >
              + Entry
            </Button>
          </div>
          <div className="CharacterLorebooks__entriesContainer scrollbar" ref={containerRef}>
            {lorebook?.entries &&
              lorebook?.entries.map((entry, index) => (
                <div className="CharacterLorebooks__entries" key={`entry-${index + 1}`}>
                  <div className="CharacterLorebooks__entries__form">
                    <FaTrashAlt
                      className="CharacterLorebooks__removeEntry"
                      onClick={() => {
                        dispatch(
                          deleteEntry({
                            entryIndex: index,
                            lorebookId: lorebook.id,
                          }),
                        );
                      }}
                    />
                    <div className="CharacterLorebooks__entries__input">
                      <Input
                        label="Entry name"
                        placeHolder="Entry name. E.g. Food memories."
                        value={entry.name}
                        onChange={(e) => {
                          dispatch(
                            updateEntry({
                              entryIndex: index,
                              lorebookId: lorebook.id,
                              entry: { ...entry, name: e.target.value },
                            }),
                          );
                        }}
                      />
                    </div>
                    <div className="CharacterLorebooks__entries__tags">
                      <TagAutocomplete
                        label="Keywords"
                        description="Trigger this entry when mentioned"
                        value={entry.keys.map((_key) => ({
                          label: _key,
                          value: _key,
                        }))}
                        onChange={(e) => {
                          dispatch(
                            updateEntry({
                              entryIndex: index,
                              lorebookId: lorebook.id,
                              entry: { ...entry, keys: e.target.value },
                            }),
                          );
                        }}
                        tags={[]}
                      />
                    </div>
                  </div>
                  <Input
                    isTextArea
                    label="Content"
                    description="This text will be added when this entry is triggered"
                    placeHolder="Memory entry. E.g. {{user}} likes a lot of coffee."
                    value={entry.content}
                    onChange={(e) => {
                      dispatch(
                        updateEntry({
                          entryIndex: index,
                          lorebookId: lorebook.id,
                          entry: { ...entry, content: e.target.value },
                        }),
                      );
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
