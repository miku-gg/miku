import { Button, Modal } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import CharacterDescriptionEdit from './CharacterDescriptionEdit';
import { closeModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { useEffect, useState } from 'react';
import CharacterOutfitsEdit from './CharacterOutfitsEdit';
import NovelVariableList from '../NovelVariableList';
import VariableBankList from '../../components/VariableBankList';
import './CharacterEditModal.scss';
import { AreYouSure } from '@mikugg/ui-kit';
import { deleteCharacter, updateCharacter } from '../../state/slices/novelFormSlice';

export default function CharacterEditModal() {
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();
  const { opened, editId } = useAppSelector((state) => state.input.modals.character);
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === editId));
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string>('prompt');

  useEffect(() => {
    if (opened) {
      setSelected('prompt');
    }
  }, [opened]);

  const handleSelectVariableBank = (bankId: string) => {
    if (!character) return;

    const currentBankIds = character.variableBankIds || [];
    const isSelected = currentBankIds.includes(bankId);

    const updatedBankIds = isSelected ? currentBankIds.filter((id) => id !== bankId) : [...currentBankIds, bankId];

    dispatch(
      updateCharacter({
        ...character,
        variableBankIds: updatedBankIds,
      }),
    );
  };

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
            {
              content: 'Variables',
              value: 'variables',
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
                openAreYouSure({
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
      {selected === 'variables' ? (
        <VariableBankList
          selectedBankIds={character?.variableBankIds || []}
          onSelectBank={handleSelectVariableBank}
          tooltipText="Select variable banks accessible for this character"
        />
      ) : null}
    </Modal>
  );
}
