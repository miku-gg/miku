import { AreYouSure, Input, Modal } from "@mikugg/ui-kit";

import { useDispatch } from "react-redux";
import { selectEditingObjective } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  deleteObjective,
  updateObjective,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import {
  NovelObjectiveAction,
  NovelObjectiveActionType,
} from "@mikugg/bot-utils/dist/lib/novel/NovelV3";
import { FaTrashAlt } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import ButtonGroup from "../../components/ButtonGroup";
import "./ObjectiveEditModal.scss";
import { ObjectiveMutationForm } from "./ObjectiveMutationForm";

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

  const getMutationTrigger = (value: string) => {
    switch (value) {
      case "ADD_CHILDREN":
        return {
          type: NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE,
          params: {
            sceneId: "",
          },
        } as NovelObjectiveAction;

      case "SUGGEST_ADVANCE_SCENE":
        return {
          type: NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE,
          params: {
            sceneId: "",
          },
        } as NovelObjectiveAction;
      default:
        return {
          type: NovelObjectiveActionType.ITEM_RECEIVE,
          params: {
            item: {},
          },
        } as NovelObjectiveAction;
    }
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
            <div className="ObjectiveEdit__content__mutation">
              <h3>Condition mutation</h3>
              <ButtonGroup
                buttons={[
                  {
                    content: "Add children scene",
                    value: "ADD_CHILDREN",
                  },

                  {
                    content: "Suggest advance scene",
                    value: "SUGGEST_ADVANCE_SCENE",
                  },
                  {
                    content: "Add item",
                    value: "ADD_ITEM",
                  },
                  {
                    content: "Remove item",
                    value: "REMOVE_ITEM",
                  },
                ]}
                selected={objective.action.type}
                onButtonClick={(value) => {
                  dispatch(
                    updateObjective({
                      id: objective.id,
                      objective: {
                        ...objective,
                        action: getMutationTrigger(value),
                      },
                    })
                  );
                }}
              />
              <ObjectiveMutationForm />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
