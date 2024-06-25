import { Button } from "@mikugg/ui-kit";
import { FaPencil } from "react-icons/fa6";
import { v4 as randomUUID } from "uuid";
import { selectEditingScene } from "../../state/selectors";
import { openModal } from "../../state/slices/inputSlice";
import { createCondition } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";

export const SceneConditions = () => {
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectEditingScene);
  if (!scene) return;

  const handleCreateCondition = () => {
    const id = randomUUID();
    dispatch(createCondition({ sceneId: scene.id, conditionId: id }));
    dispatch(openModal({ modalType: "conditionEdit", editId: id }));
  };

  return (
    <div className="MapList_">
      <div className="MapList__header">
        <div className="MapList__header__title">
          <h2>Scene conditions.</h2>
        </div>
        <Button
          theme="gradient"
          onClick={() => {
            handleCreateCondition();
          }}
        >
          Create new condition
        </Button>
      </div>

      {scene.sceneConditions ? (
        <div className="MapList__container">
          {scene.sceneConditions.map((condition) => {
            const { id, name, description } = condition;
            return (
              <div key={id} className="MapList__container__box">
                <div className="MapList__container__map">
                  <FaPencil
                    className="MapList__container__edit"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(
                        openModal({ modalType: "conditionEdit", editId: id })
                      );
                    }}
                  />
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <p>Reward: {condition.mutationTrigger.type}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Don't have any conditions created.</p>
      )}
    </div>
  );
};
