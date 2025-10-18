import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Tooltip } from '@mikugg/ui-kit';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { v4 as randomUUID } from 'uuid';
import { openModal } from '../../state/slices/inputSlice';
import { addObjectiveToCharacter, deleteObjectiveFromCharacter } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import './CharacterObjectivesEdit.scss';

interface CharacterObjectivesProps {
  characterId: string;
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

export const CharacterObjectives = ({ characterId }: CharacterObjectivesProps) => {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === characterId));
  const objectives = character?.objectives || [];

  const handleCreateObjective = () => {
    const id = randomUUID();
    const newObjective: NovelV3.NovelObjective = {
      id,
      name: 'New Objective',
      description: 'Objective description',
      singleUse: true,
      stateCondition: {
        type: 'IN_SCENE',
        config: {
          sceneIds: [],
        },
      },
      condition: '',
      actions: [],
    };
    dispatch(addObjectiveToCharacter({ characterId, objective: newObjective }));
    dispatch(openModal({ modalType: 'objectiveEdit', editId: id }));
  };

  const handleEditObjective = (objectiveId: string) => {
    dispatch(openModal({ modalType: 'objectiveEdit', editId: objectiveId }));
  };

  const handleDeleteObjective = (objectiveId: string) => {
    dispatch(deleteObjectiveFromCharacter({ characterId, objectiveId }));
  };

  return (
    <div className="CharacterObjectivesEdit">
      <div className="CharacterObjectivesEdit__header">
        <div className="CharacterObjectivesEdit__header__title">
          <h2>Character Objectives</h2>
          <IoInformationCircleOutline
            data-tooltip-id="Info-character-objective"
            className="CharacterObjectivesEdit__header__title__infoIcon"
            data-tooltip-content="Objectives specific to this character that define their goals and behaviors."
          />
          <Tooltip id="Info-character-objective" place="top" />
        </div>
        <Button theme="gradient" onClick={handleCreateObjective}>
          Add Objective
        </Button>
      </div>

      {objectives.length > 0 ? (
        <div className="CharacterObjectivesEdit__container">
          {objectives.map((objective) => {
            const { id, name, description, actions } = objective;
            return (
              <div key={id} className="CharacterObjectivesEdit__container__box">
                <div className="CharacterObjectivesEdit__container__objective">
                  <div className="CharacterObjectivesEdit__container__actions">
                    <FaEdit
                      className="CharacterObjectivesEdit__container__edit"
                      onClick={() => handleEditObjective(id)}
                      title="Edit objective"
                    />
                    <FaTrash
                      className="CharacterObjectivesEdit__container__delete"
                      onClick={() => handleDeleteObjective(id)}
                      title="Delete objective"
                    />
                  </div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <p>Action: {actions.length > 0 ? getTextFromActionType(actions[0].type) : 'No action'}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="CharacterObjectivesEdit__empty">No objectives created for this character.</p>
      )}
    </div>
  );
};
