import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Tooltip } from '@mikugg/ui-kit';
import { FaCheckCircle } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { v4 as randomUUID } from 'uuid';
import { openModal } from '../../state/slices/inputSlice';
import { createObjective } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import './NovelObjectives.scss';

interface NovelObjectiveProps {
  selectedObjectiveIds?: string[];
  onSelectObjective?: (id: string) => void;
  tooltipText?: string;
}
export const getTextFromActionType = (type: NovelV3.NovelActionType) => {
  switch (type) {
    case NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE:
      return 'Suggest advance scene';
    case NovelV3.NovelActionType.SUGGEST_CREATE_SCENE:
      return 'Suggest create scene';
    case NovelV3.NovelActionType.HIDE_ITEM:
      return 'Hide item';
    case NovelV3.NovelActionType.SHOW_ITEM:
      return 'Show item';
    case NovelV3.NovelActionType.ADD_CHILD_SCENES:
      return 'Add child scenes';
    default:
      return 'No selected';
  }
};

export const NovelObjectives = ({ selectedObjectiveIds, onSelectObjective, tooltipText }: NovelObjectiveProps) => {
  const dispatch = useAppDispatch();
  const objectives = useAppSelector((state) => state.novel.objectives);

  const handleCreateObjective = () => {
    const id = randomUUID();
    dispatch(createObjective({ id: id }));
    dispatch(openModal({ modalType: 'objectiveEdit', editId: id }));
  };
  const isSelected = (id: string) => {
    if (!selectedObjectiveIds) return false;
    return selectedObjectiveIds.includes(id);
  };

  return (
    <div className="NovelObjectives">
      <div className="NovelObjectives__header">
        <div className="NovelObjectives__header__title">
          <h2>Novel objectives</h2>
          {tooltipText ? (
            <IoInformationCircleOutline
              data-tooltip-id="Info-objective"
              className="NovelObjectives__header__title__infoIcon"
              data-tooltip-content={tooltipText}
            />
          ) : null}
          <Tooltip id="Info-objective" place="top" />
        </div>
        <Button
          theme="gradient"
          onClick={() => {
            handleCreateObjective();
          }}
        >
          Create new objective
        </Button>
      </div>

      {objectives ? (
        <div className={`NovelObjectives__container ${onSelectObjective ? 'ObjectiveSelection' : ''}`}>
          {objectives.map((objective) => {
            const { id, name, description, actions } = objective;
            return (
              <div key={id} className="NovelObjectives__container__box">
                <div
                  className={`NovelObjectives__container__objective ${
                    selectedObjectiveIds?.includes(id) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    onSelectObjective && onSelectObjective(id);
                  }}
                >
                  <FaPencil
                    className="NovelObjectives__container__edit"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(openModal({ modalType: 'objectiveEdit', editId: id }));
                    }}
                  />
                  <p>{name}</p>
                  <p>{description}</p>
                  <p>Action: {actions.length > 0 ? getTextFromActionType(actions[0].type) : 'No selected'}</p>
                  {isSelected(id) && (
                    <div className="selected__badge">
                      <FaCheckCircle />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Don't have any objective created.</p>
      )}
    </div>
  );
};
