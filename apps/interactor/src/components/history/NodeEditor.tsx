import { Button, Dropdown } from '@mikugg/ui-kit';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../App.context';
import { selectCharacterOutfits, selectSceneFromResponse } from '../../state/selectors';
import { selectCharacterOfResponse, updateInteraction, updateResponse } from '../../state/slices/narrationSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../state/versioning';
import './NodeEditor.scss';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

const TextEditor = ({
  text,
  onChange,
  onCancel,
}: {
  text: string;
  onChange: (text: string) => void;
  onCancel: () => void;
}) => {
  const [_text, _setText] = useState(text);

  useEffect(() => {
    _setText(text);
  }, [text]);

  return (
    <form
      className="NodeEditor__text-editor"
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(_text);
      }}
    >
      <textarea className="NodeEditor__textarea scrollbar" value={_text} onChange={(e) => _setText(e.target.value)} />
      <div className="NodeEditor__actions">
        <Button theme="secondary" type="submit">
          Update
        </Button>
        <Button
          theme="transparent"
          onClick={() => {
            _setText(text);
            onCancel();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ResponseEditor = ({ response, onClose }: { response: NarrationResponse; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader } = useAppContext();
  const characterId = response.selectedCharacterId || '';
  const charResponse = response.characters.find((_charResponse) => _charResponse.characterId === characterId);
  const scene = useAppSelector((state) => selectSceneFromResponse(state, response));
  const outfits = useAppSelector((state) => selectCharacterOutfits(state, characterId));
  const characters = useAppSelector((state) => state.novel.characters);
  const characterOutfitId = scene?.characters.find((c) => c.characterId === characterId)?.outfit || '';
  const emotions = outfits.find((o) => o.id === characterOutfitId)?.emotions || [];
  const [_emotion, _setEmotion] = useState(charResponse?.emotion || '');

  if (!charResponse || !characterOutfitId) return null;

  const handleChange = (text: string) => {
    dispatch(
      updateResponse({
        id: response.id,
        characterId,
        emotion: _emotion,
        text,
      }),
    );
    onClose();
  };

  return (
    <div>
      {scene?.characters.length ? (
        <div className="NodeEditor__characters">
          {response.characters.map((_charResponse) => {
            const character = characters.find((c) => c.id === _charResponse.characterId);
            return (
              <button
                key={response.id}
                className={classNames({
                  NodeEditor__character: true,
                  'NodeEditor__character--selected': _charResponse.characterId === characterId,
                })}
                onClick={() =>
                  dispatch(
                    selectCharacterOfResponse({
                      responseId: response.id,
                      characterId: _charResponse.characterId,
                    }),
                  )
                }
              >
                <img
                  className="NodeEditor__character-img"
                  src={assetLinkLoader(character?.profile_pic || '', AssetDisplayPrefix.CHARACTER_PIC_SMALL)}
                  alt={character?.name}
                />
              </button>
            );
          })}
        </div>
      ) : null}
      <TextEditor text={charResponse.text} onChange={handleChange} onCancel={onClose} />
      <Dropdown
        items={emotions.map((emotion) => ({
          name: emotion.id,
          value: emotion.id,
        }))}
        selectedIndex={emotions.findIndex((emotion) => emotion.id === _emotion)}
        onChange={(index) => _setEmotion(emotions[index].id)}
      />
    </div>
  );
};

const InteractionEditor = ({ interaction, onClose }: { interaction: NarrationInteraction; onClose: () => void }) => {
  const dispatch = useAppDispatch();

  const handleChange = (text: string) => {
    dispatch(
      updateInteraction({
        id: interaction.id,
        text,
      }),
    );
    onClose();
  };

  return <TextEditor text={interaction.query} onChange={handleChange} onCancel={onClose} />;
};

export const NodeEditor = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const response = useAppSelector((state) => state.narration.responses[id]);
  const interaction = useAppSelector((state) => state.narration.interactions[id]);
  const { isMobileApp } = useAppContext();
  const mobileWidth = window.innerWidth < 450;
  let content: JSX.Element | null = null;

  if (response) {
    content = <ResponseEditor response={response} onClose={onClose} />;
  } else if (interaction) {
    content = <InteractionEditor interaction={interaction} onClose={onClose} />;
  }

  return <div className={`NodeEditor ${isMobileApp || mobileWidth ? 'NodeEditor__mobile-app' : ''}`}>{content}</div>;
};
