import { Button, Modal } from '@mikugg/ui-kit';
 
import './CustomPersonaEditModal.scss';
import { AreYouSure } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { closeModal } from '../../state/slices/inputSlice';
import { deleteCustomPersona } from '../../state/slices/novelFormSlice';
import CustomPersonaDescriptionEdit from './CustomPersonaDescriptionEdit';

export default function CustomPersonaEditModal() {
  const { openModal } = AreYouSure.useAreYouSure();
  const dispatch = useAppDispatch();
  const customPersona = useAppSelector((state) => state.novel.customPersona);
  const { opened, editId } = useAppSelector((state) => state.input.modals.customPersona);
 
  return (
    <Modal
      opened={opened}
      onCloseModal={() => {
        dispatch(closeModal({ modalType: 'customPersona' }));
      }}
      shouldCloseOnOverlayClick
      className="CustomPersonaEditModal"
    >
          <CustomPersonaDescriptionEdit personaId={editId} />
          {customPersona ? (
            <div className="CustomPersonaEditModal__delete">
              <Button
                theme="primary"
                onClick={() =>
                  openModal({
                    description: 'Are you sure you want to delete this persona?',
                    onYes: () => {
                      dispatch(deleteCustomPersona(''));
                      dispatch(closeModal({ modalType: 'customPersona' }));
                    },
                    yesLabel: 'Delete',
                  })
                }
              >
                Delete persona
              </Button>
            </div>
          ) : null}
    </Modal>
  );
}
