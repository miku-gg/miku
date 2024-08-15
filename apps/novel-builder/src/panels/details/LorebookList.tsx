import { Button, Tooltip } from '@mikugg/ui-kit';
import { FaPencil } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { v4 as randomUUID } from 'uuid';
import { openModal } from '../../state/slices/inputSlice';
import { createLorebook, updateLorebook } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './LorebookList.scss';
import { FaCheckCircle } from 'react-icons/fa';
import classNames from 'classnames';

interface LorebookListProps {
  onSelectLorebook?: (id: string) => void;
  selectedLorebookId?: string[];
  tooltipText?: string;
}

export const LorebookList = ({ onSelectLorebook, selectedLorebookId, tooltipText }: LorebookListProps) => {
  const dispatch = useAppDispatch();
  const lorebooks = useAppSelector((state) => state.novel.lorebooks);

  const createNewLorebook = () => {
    const id = randomUUID();
    dispatch(createLorebook(id));
    dispatch(openModal({ modalType: 'lorebookEdit', editId: id }));
  };

  const isSelected = (id: string) => {
    if (!selectedLorebookId) return false;
    return selectedLorebookId.includes(id);
  };

  return (
    <div className="lorebookList">
      <div className="lorebookList__header">
        <div className="lorebookList__header__title">
          <h2>Lorebooks</h2>
          {tooltipText && (
            <>
              <IoInformationCircleOutline
                className="lorebookList__header__title__infoIcon"
                data-tooltip-id="Info"
                data-tooltip-content={tooltipText}
              />
              <Tooltip id="Info" place="top" />
            </>
          )}
        </div>
        <Button theme="gradient" onClick={() => createNewLorebook()}>
          New Lorebook
        </Button>
      </div>
      {lorebooks && (
        <div className="lorebookList__container">
          {lorebooks.map((lorebook) => {
            const { id, name, description } = lorebook;
            return (
              <div key={id} className="lorebookList__box">
                <div
                  className={`lorebookList__lorebook ${selectedLorebookId?.length ? 'selector' : ''}${
                    isSelected(id) ? '__selected' : ''
                  }`}
                  onClick={() => {
                    if (!lorebook.isGlobal) {
                      onSelectLorebook?.(id);
                    }
                  }}
                >
                  <FaPencil
                    className="lorebookList__lorebook__edit"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(openModal({ modalType: 'lorebookEdit', editId: id }));
                    }}
                  />

                  <h3 className="lorebookList__lorebook__name">{name}</h3>
                  <p className="lorebookList__lorebook__description">{description}</p>
                  {isSelected(id) || lorebook.isGlobal ? (
                    <div
                      className={classNames(
                        'lorebookList__lorebook__selected-badge',
                        lorebook.isGlobal ? 'global-lorebook' : '',
                      )}
                    >
                      <FaCheckCircle />
                      {lorebook.isGlobal ? 'Global' : 'Selected'}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
