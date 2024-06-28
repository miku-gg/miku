import { Button } from "@mikugg/ui-kit";
import { FaPencil } from "react-icons/fa6";
import { v4 as randomUUID } from "uuid";
import { openModal } from "../../state/slices/inputSlice";
import { createObjective } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import "./NovelObjectives.scss";

export const NovelObjectives = () => {
  const dispatch = useAppDispatch();
  const objectives = useAppSelector((state) => state.novel.objectives);

  const handleCreateObjective = () => {
    const id = randomUUID();
    dispatch(createObjective({ id: id }));
    dispatch(openModal({ modalType: "objectiveEdit", editId: id }));
  };

  return (
    <div className="MapList_">
      <div className="MapList__header">
        <div className="MapList__header__title">
          <h2>Novel objectives.</h2>
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
        <div className="MapList__container">
          {objectives.map((objective) => {
            const { id, name, description, action } = objective;
            return (
              <div key={id} className="MapList__container__box">
                <div className="MapList__container__map">
                  <FaPencil
                    className="MapList__container__edit"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(
                        openModal({ modalType: "objectiveEdit", editId: id })
                      );
                    }}
                  />
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <p>Reward: {action.type}</p>
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
