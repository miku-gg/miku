import { Button } from "@mikugg/ui-kit";
import { FaPencil } from "react-icons/fa6";
import { v4 as randomUUID } from "uuid";
import { openModal } from "../../state/slices/inputSlice";
import { createLorebook } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import "./LorebookList.scss";

export const LorebookList = () => {
  const dispatch = useAppDispatch();
  const lorebooks = useAppSelector((state) => state.novel.lorebooks);

  const createNewLorebook = () => {
    const id = randomUUID();
    dispatch(createLorebook(id));
    dispatch(openModal({ modalType: "lorebookEdit", editId: id }));
  };

  return (
    <div className="lorebookList">
      <div className="lorebookList__header">
        <h2>Lorebooks</h2>
        <Button theme="gradient" onClick={() => createNewLorebook()}>
          Create new Book
        </Button>
      </div>
      {lorebooks && (
        <div className="lorebookList__container">
          {lorebooks.map((lorebook) => {
            const { id, name, description } = lorebook;
            return (
              <div key={id} className="lorebookList__box">
                <div className="lorebookList__lorebook">
                  <FaPencil
                    className="lorebookList__lorebook__edit"
                    onClick={() => {
                      dispatch(
                        openModal({ modalType: "lorebookEdit", editId: id })
                      );
                    }}
                  />

                  <h3 className="lorebookList__lorebook__name">{name}</h3>
                  <p className="lorebookList__lorebook__description">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
