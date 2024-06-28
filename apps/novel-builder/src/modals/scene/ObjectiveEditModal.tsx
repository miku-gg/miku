import { AreYouSure, Button, Input, Modal } from "@mikugg/ui-kit";

import { useDispatch } from "react-redux";
import { selectEditingObjective } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  deleteObjective,
  updateObjective,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { FaTrashAlt } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import "./ObjectiveEditModal.scss";
import NovelActionForm from "./NovelActionForm";
import { NovelV3 } from "@mikugg/bot-utils";

export default function ObjectiveEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const objective = useAppSelector(selectEditingObjective);

  const handleDeleteObjective = () => {
    if (!objective) return;
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This map will be deleted. This action cannot be undone.",
      onYes: () => {
        dispatch(closeModal({ modalType: "objectiveEdit" }));
        dispatch(deleteObjective({ id: objective.id }));
      },
    });
  };

  return (
    <Modal
      opened={!!objective}
      shouldCloseOnOverlayClick
      className="ObjectiveEditModal"
      title="Edit condition"
      onCloseModal={() => dispatch(closeModal({ modalType: "objectiveEdit" }))}
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
                dispatch(closeModal({ modalType: "objectiveEdit" }));
              }}
            />
          </div>
          <div className="ObjectiveEdit__content">
            <div className="ObjectiveEdit__content__form">
              <Input
                label="Name"
                value={objective.name || ""}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        name: e.target.value,
                      },
                    })
                  );
                }}
              />
              <Input
                label="Description"
                value={objective.description || ""}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        description: e.target.value,
                      },
                    })
                  );
                }}
              />
              <Input
                label="Condition Prompt"
                isTextArea
                description="The answer of the condition prompt always have to be YES or NO."
                placeHolder="E.g. Do {{CHAR}} have the key for the door?"
                value={objective.condition || ""}
                onChange={(e) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        condition: e.target.value,
                      },
                    })
                  );
                }}
              />
            </div>
            <h3>Condition actions</h3>
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
                            sceneId: "",
                          },
                        },
                      ],
                    },
                  })
                );
              }}
            >
              Add action
            </Button>
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
                      })
                    );
                  }}
                  onDelete={() => {
                    dispatch(
                      updateObjective({
                        id: objective.id,
                        objective: {
                          ...objective,
                          actions: [
                            ...objective.actions.slice(0, index),
                            ...objective.actions.slice(index + 1),
                          ],
                        },
                      })
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
