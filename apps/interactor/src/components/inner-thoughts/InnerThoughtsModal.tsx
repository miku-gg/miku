import React from 'react';
import InnerThoughtsBox from './InnerThoughtsBox';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { setInnerThoughtsModal } from '../../state/slices/settingsSlice';
import { selectInnerThoughtsForCharacter } from '../../state/selectors';
import './InnerThoughtsModal.scss';

const InnerThoughtsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.settings.modals.innerThoughts?.opened);
  const characterId = useAppSelector((state) => state.settings.modals.innerThoughts?.characterId || '');
  const innerThoughts = useAppSelector((state) => selectInnerThoughtsForCharacter(state, characterId));

  const handleClose = () => {
    dispatch(setInnerThoughtsModal({ opened: false }));
  };

  if (!isOpen || !characterId || innerThoughts === undefined) {
    return null;
  }

  return (
    <div className="InnerThoughtsModal">
      <div className="InnerThoughtsModal__overlay" onClick={handleClose} />
      <div className="InnerThoughtsModal__content">
        <InnerThoughtsBox
          className="InnerThoughtsBox--modal"
          isVisible={true}
          onClose={handleClose}
          thoughts={innerThoughts}
        />
      </div>
    </div>
  );
};

export default InnerThoughtsModal;
