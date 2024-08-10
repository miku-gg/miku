import { Button, Modal } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import CharacterDescriptionEdit from './CharacterDescriptionEdit';
import { closeModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { useEffect, useState } from 'react';
import CharacterOutfitsEdit from './CharacterOutfitsEdit';
import './CharacterEditModal.scss';
import { AreYouSure } from '@mikugg/ui-kit';
import { deleteCharacter } from '../../state/slices/novelFormSlice';

export default function CharacterEditModal() {
  const { openModal } = AreYouSure.useAreYouSure();
  const { opened, editId } = useAppSelector((state) => state.input.modals.character);
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>('prompt');

  useEffect(() => {
    if (opened) {
      setSelected('prompt');
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(closeModal({ modalType: 'character' }))}
      shouldCloseOnOverlayClick
      className="CharacterEditModal"
    >
      <div className="CharacterEditModal__header">
        <ButtonGroup
          selected={selected}
          onButtonClick={(value) => setSelected(value)}
          buttons={[
            {
              content: 'Description',
              value: 'prompt',
            },
            {
              content: 'Outfits',
              value: 'outfits',
            },
          ]}
        />
      </div>
      {selected === 'prompt' ? (
        <>
          <CharacterDescriptionEdit characterId={editId} />
          <div className="CharacterEditModal__delete">
            <Button
              theme="primary"
              onClick={() =>
                openModal({
                  description: 'Are you sure you want to delete this character?',
                  onYes: () => {
                    dispatch(closeModal({ modalType: 'character' }));
                    dispatch(deleteCharacter(editId || ''));
                  },
                  yesLabel: 'Delete',
                })
              }
            >
              Delete character
            </Button>
          </div>
        </>
      ) : null}
      {selected === 'outfits' ? <CharacterOutfitsEdit characterId={editId} /> : null}
    </Modal>
  );
}
