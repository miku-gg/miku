import { AreYouSure, Input, Modal } from "@mikugg/ui-kit";

import { useDispatch } from "react-redux";
import { selectEditingCondition } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  deleteCondition,
  updateCondition,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { StateMutation } from "@mikugg/bot-utils/dist/lib/novel/NovelV3";
import { FaTrashAlt } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import ButtonGroup from "../../components/ButtonGroup";
import "./ConditionEditModal.scss";
import { SceneMutationForm } from "./SceneMutationForm";

export default function ConditionEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const condition = useAppSelector(selectEditingCondition);

  const handleDeleteCondition = (id: string) => {
    if (!condition) return;
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This map will be deleted. This action cannot be undone.",
      onYes: () => {
        dispatch(closeModal({ modalType: "conditionEdit" }));
        dispatch(
          deleteCondition({
            sceneId: condition.sceneId,
            conditionId: id,
          })
        );
      },
    });
  };

  const getMutationTrigger = (value: string) => {
    switch (value) {
      case "ADD_CHILDREN":
        return {
          type: "ADD_CHILDREN",
          config: {
            sceneId: "",
            children: [],
          },
        } as StateMutation;
      case "REMOVE_ITEM":
        return {
          type: "REMOVE_ITEM",
          config: {
            itemId: "",
          },
        } as StateMutation;
      case "SUGGEST_ADVANCE_SCENE":
        return {
          type: "SUGGEST_ADVANCE_SCENE",
          config: {
            sceneId: "",
          },
        } as StateMutation;
      default:
        return {
          type: "ADD_ITEM",
          config: {
            item: {},
          },
        } as StateMutation;
    }
  };

  return (
    <Modal
      opened={!!condition}
      shouldCloseOnOverlayClick
      className="ConditionEditModal"
      title="Edit condition"
      onCloseModal={() => dispatch(closeModal({ modalType: "conditionEdit" }))}
    >
      {condition ? (
        <div className="ConditionEdit scrollbar">
          <div className="ConditionEdit__buttons">
            <FaTrashAlt
              className="MapEdit__buttons__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDeleteCondition(condition.id);
              }}
            />
            <IoIosCloseCircleOutline
              className="MapEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: "conditionEdit" }));
              }}
            />
          </div>
          <div className="ConditionEdit__content">
            <div className="ConditionEdit__content__form">
              <Input
                label="Name"
                value={condition.name || ""}
                onChange={(e) => {
                  dispatch(
                    updateCondition({
                      conditionId: condition.id,
                      sceneId: condition.sceneId,
                      condition: {
                        ...condition,
                        name: e.target.value,
                      },
                    })
                  );
                }}
              />
              <Input
                label="Description"
                value={condition.description || ""}
                onChange={(e) => {
                  dispatch(
                    updateCondition({
                      conditionId: condition.id,
                      sceneId: condition.sceneId,
                      condition: {
                        ...condition,
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
                value={condition.conditionPrompt || ""}
                onChange={(e) => {
                  dispatch(
                    updateCondition({
                      conditionId: condition.id,
                      sceneId: condition.sceneId,
                      condition: {
                        ...condition,
                        conditionPrompt: e.target.value,
                      },
                    })
                  );
                }}
              />
            </div>
            <div className="ConditionEdit__content__mutation">
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
                selected={condition.mutationTrigger.type}
                onButtonClick={(value) => {
                  dispatch(
                    updateCondition({
                      conditionId: condition.id,
                      sceneId: condition.sceneId,
                      condition: {
                        ...condition,
                        mutationTrigger: getMutationTrigger(value),
                      },
                    })
                  );
                }}
              />
              <SceneMutationForm />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
