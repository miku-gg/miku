import { AreYouSure, Button, Input, Modal, Tooltip } from '@mikugg/ui-kit';

import { useDispatch } from 'react-redux';
import { selectEditingObjective } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import { deleteObjective, updateObjective } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { NovelV3 } from '@mikugg/bot-utils';
import { FaTrashAlt } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import NovelActionForm from './NovelActionForm';
import './ObjectiveEditModal.scss';

export default function ObjectiveEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const objective = useAppSelector(selectEditingObjective);

  const handleDeleteObjective = () => {
    if (!objective) return;
    areYouSure.openModal({
      title: 'Are you sure?',
      description: 'This map will be deleted. This action cannot be undone.',
      onYes: () => {
        dispatch(closeModal({ modalType: 'objectiveEdit' }));
        dispatch(deleteObjective({ id: objective.id }));
      },
    });
  };

  return (
    <Modal
      opened={!!objective}
      shouldCloseOnOverlayClick
      className="ObjectiveEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'objectiveEdit' }))}
    >
      {objective ? (
        <div className="ObjectiveEdit scrollbar">
          <div className="ObjectiveEdit__buttons">
            <FaTrashAlt
              className="MapEdit__buttons__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDeleteObjective();
              }}
            />
            <IoIosCloseCircleOutline
              className="MapEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: 'objectiveEdit' }));
              }}
            />
          </div>
          <div className="ObjectiveEdit__content">
            <div className="ObjectiveEdit__content__form">
              <Input
                label="Name"
                value={objective.name || ''}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        name: e.target.value,
                      },
                    }),
                  );
                }}
              />
              <Input
                label="Description"
                value={objective.description || ''}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        description: e.target.value,
                      },
                    }),
                  );
                }}
              />
              <Input
                label="Hint"
                description="[OPTIONAL] Give a hint to the player to help them achieve the objective."
                placeHolder="Try to find the key in the room."
                value={objective.hint || ''}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        hint: e.target.value,
                      },
                    }),
                  );
                }}
                maxLength={34}
              />
              <Input
                label="Condition"
                isTextArea
                description="Condition to be met to trigger the actions. Must be a YES/NO condition."
                placeHolder="{{user}} found the door's key."
                value={objective.condition || ''}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        condition: e.target.value,
                      },
                    }),
                  );
                }}
              />
            </div>
            <div className="ObjectiveEdit__content__actions">
              <div className="ObjectiveEdit__header">
                <div className="ObjectiveEdit__header__title">
                  <h3>Condition actions</h3>
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-actions"
                    className="ObjectiveEdit__header__title__infoIcon"
                    data-tooltip-content="If the condition is met, these actions are triggered."
                  />

                  <Tooltip id="Info-actions" place="top" />
                </div>
                {objective.actions.length < 1 && (
                  <Button
                    theme="secondary"
                    onClick={() => {
                      dispatch(
                        updateObjective({
                          id: objective.id,
                          objective: {
                            ...objective,
                            actions: [
                              ...(objective.actions || []),
                              {
                                type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
                                params: {
                                  sceneId: '',
                                },
                              },
                            ],
                          },
                        }),
                      );
                    }}
                  >
                    Add action
                  </Button>
                )}
              </div>
              {objective.actions.length > 0 && (
                <div className="">
                  {objective.actions.map((action, index) => {
                    return (
                      <NovelActionForm
                        action={action}
                        onChange={(novelAction) => {
                          dispatch(
                            updateObjective({
                              id: objective.id,
                              objective: {
                                ...objective,
                                actions: [
                                  ...objective.actions.slice(0, index),
                                  novelAction,
                                  ...objective.actions.slice(index + 1),
                                ],
                              },
                            }),
                          );
                        }}
                        onDelete={() => {
                          dispatch(
                            updateObjective({
                              id: objective.id,
                              objective: {
                                ...objective,
                                actions: [...objective.actions.slice(0, index), ...objective.actions.slice(index + 1)],
                              },
                            }),
                          );
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
