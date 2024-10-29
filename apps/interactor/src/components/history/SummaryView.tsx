import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectAllSumaries, selectCurrentScene, selectAvailableSummarySentences } from '../../state/selectors';
import { Modal, Button, Slider, Input } from '@mikugg/ui-kit';
import { updateSummarySentence, deleteSummarySentence } from '../../state/slices/narrationSlice';
import { FaPencilAlt } from 'react-icons/fa';
import './SummaryView.scss';
import { useAppContext } from '../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import CharacterAvatar from './CharacterAvatar';
import { getExistingModelMetadata } from '../../libs/retrieveMetadata';
import { useI18n } from '../../libs/i18n';

const EditSentenceModal: React.FC<{
  sentence: string;
  importance: number;
  onClose: () => void;
  onSubmit: (sentence: string, importance: number) => void;
  onDelete: () => void;
  characters: { id: string; name: string; profilePic: string }[];
}> = ({ sentence, importance, onClose, onSubmit, onDelete, characters }) => {
  const [editedSentence, setEditedSentence] = useState(sentence);
  const [editedImportance, setEditedImportance] = useState(importance);
  const { i18n } = useI18n();

  const handleSubmit = () => {
    if (editedSentence.trim() === '') {
      onDelete();
    } else {
      onSubmit(editedSentence, editedImportance);
    }
  };

  return (
    <Modal opened={true} onCloseModal={onClose} title={i18n('edit_memory')}>
      <div className="EditSentenceModal">
        <Input
          value={editedSentence}
          onChange={(e) => setEditedSentence(e.target.value)}
          className="EditSentenceModal__input"
          isTextArea
        />
        <Slider
          value={editedImportance}
          onChange={(value) => setEditedImportance(value as number)}
          steps={[
            { label: i18n('not_important'), value: 1 },
            { label: '', value: 2 },
            { label: '', value: 3 },
            { label: '', value: 4 },
            { label: i18n('very_important'), value: 5 },
          ]}
        />
        <div className="EditSentenceModal__characters-container">
          <span className="EditSentenceModal__characters-label">{i18n('characters_affected')}:</span>
          <div className="EditSentenceModal__characters">
            {characters.map((character) => (
              <CharacterAvatar key={character.id} character={character} />
            ))}
          </div>
        </div>
        <div className="EditSentenceModal__actions">
          <Button theme="transparent" onClick={onClose}>
            {i18n('cancel')}
          </Button>
          <Button theme="secondary" onClick={handleSubmit}>
            {editedSentence.trim() === '' ? i18n('delete') : i18n('modify')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const CharacterSelector: React.FC<{
  characters: { id: string; name: string; profilePic: string }[];
  selectedCharacterId: string;
  onSelect: (id: string) => void;
}> = ({ characters, selectedCharacterId, onSelect }) => (
  <div className="CharacterSelector">
    {characters.map((character) => (
      <CharacterAvatar
        key={character.id}
        character={character}
        hoverable
        onClick={() => onSelect(character.id)}
        selected={character.id === selectedCharacterId}
      />
    ))}
  </div>
);

const SummaryView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader } = useAppContext();
  const { i18n } = useI18n();
  const currentScene = useAppSelector(selectCurrentScene);
  const characters = useAppSelector((state) => state.novel.characters);
  const sceneCharacters =
    currentScene?.characters.map((char) => {
      const character = characters.find((c) => c.id === char.characterId);
      return { id: char.characterId, name: character?.name || '', profilePic: character?.profile_pic || '' };
    }) || [];
  const [selectedCharacterId, setSelectedCharacterId] = useState(sceneCharacters[0]?.id || '');
  const summaries = useAppSelector((state) => selectAllSumaries(state, [selectedCharacterId]));
  const availableSentences = useAppSelector((state) =>
    selectAvailableSummarySentences(
      state,
      [selectedCharacterId],
      getExistingModelMetadata(state.settings.model)?.secondary.truncation_length,
    ),
  );
  const [activeTab, setActiveTab] = useState<'used' | 'all'>('used');
  const [editingSentence, setEditingSentence] = useState<{
    sentence: string;
    importance: number;
    responseId: string;
    index: number;
  } | null>(null);

  const responses = useAppSelector((state) => state.narration.responses);

  const handleEditSentence = (sentence: string, importance: number, responseId: string, index: number) => {
    setEditingSentence({ sentence, importance, responseId, index });
  };

  const handleSubmitEdit = (sentence: string, importance: number) => {
    if (editingSentence) {
      if (sentence.trim() === '') {
        dispatch(
          deleteSummarySentence({
            responseId: editingSentence.responseId,
            index: editingSentence.index,
          }),
        );
      } else {
        dispatch(
          updateSummarySentence({
            responseId: editingSentence.responseId,
            index: editingSentence.index,
            sentence,
            importance,
          }),
        );
      }
      setEditingSentence(null);
    }
  };

  const handleDeleteSentence = () => {
    if (editingSentence) {
      dispatch(
        deleteSummarySentence({
          responseId: editingSentence.responseId,
          index: editingSentence.index,
        }),
      );
      setEditingSentence(null);
    }
  };

  return (
    <div className="SummaryView">
      <CharacterSelector
        characters={sceneCharacters}
        selectedCharacterId={selectedCharacterId}
        onSelect={setSelectedCharacterId}
      />
      <div className="SummaryView__content">
        <div className="SummaryView__tabs">
          <button
            className={`SummaryView__tab ${activeTab === 'used' ? 'SummaryView__tab--active' : ''}`}
            onClick={() => setActiveTab('used')}
          >
            {i18n('used_memories')}
          </button>
          <button
            className={`SummaryView__tab ${activeTab === 'all' ? 'SummaryView__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {i18n('all_memories')}
          </button>
        </div>
        <div className="SummaryView__tab-content">
          <div className="SummaryView__tab-content-header">
            <p className="SummaryView__tab-description">
              {activeTab === 'used' ? i18n('memories_used_by_ai') : i18n('all_memories_available')}
            </p>
            {activeTab === 'all' && (
              <div className="SummaryView__importance-meter">
                <span className="SummaryView__importance-meter-label">{i18n('importance')}:</span>
                <div className="SummaryView__importance-meter-gradient"></div>
              </div>
            )}
          </div>
          <div className="SummaryView__cards-container">
            {activeTab === 'used' ? (
              availableSentences.length > 0 ? (
                <div className="SummaryView__card SummaryView__card--available-sentences">
                  {availableSentences.map((sentence, index) => (
                    <div key={index} className="SummaryView__sentence-container">
                      <p className="SummaryView__sentence">{sentence}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="SummaryView__card SummaryView__card--empty">
                  <p className="SummaryView__empty-message">{i18n('no_memories_yet')}</p>
                </div>
              )
            ) : summaries.length > 0 ? (
              summaries.map((summary, index) => {
                const response = responses[summary.responseId];
                const characterProfiles =
                  response?.characters.map((char) => {
                    const character = characters.find((c) => c.id === char.characterId);
                    return character?.profile_pic || '';
                  }) || [];

                return (
                  <div key={index} className="SummaryView__card">
                    <div className="SummaryView__card-characters">
                      {characterProfiles.map((profile, i) => (
                        <img
                          key={i}
                          src={assetLinkLoader(profile, AssetDisplayPrefix.CHARACTER_PIC_SMALL)}
                          alt="Character"
                          className="SummaryView__card-character-image"
                        />
                      ))}
                    </div>
                    {summary.sentences.map((sentence, sentenceIndex) => (
                      <div key={sentenceIndex} className="SummaryView__sentence-container">
                        <button
                          className="SummaryView__edit-button"
                          onClick={() =>
                            handleEditSentence(
                              sentence.sentence,
                              sentence.importance,
                              summary.responseId,
                              sentenceIndex,
                            )
                          }
                        >
                          <FaPencilAlt />
                        </button>
                        <p className={`SummaryView__sentence SummaryView__sentence--importance-${sentence.importance}`}>
                          {sentence.sentence}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <div className="SummaryView__card SummaryView__card--empty">
                <p className="SummaryView__empty-message">{i18n('no_memories_yet')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingSentence && (
        <EditSentenceModal
          sentence={editingSentence.sentence}
          importance={editingSentence.importance}
          onClose={() => setEditingSentence(null)}
          onSubmit={handleSubmitEdit}
          onDelete={handleDeleteSentence}
          characters={sceneCharacters}
        />
      )}
    </div>
  );
};

export default SummaryView;
