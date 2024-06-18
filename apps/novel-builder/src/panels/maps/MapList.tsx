import { Button } from "@mikugg/ui-kit";
import { FaPencil } from "react-icons/fa6";
import { v4 as randomUUID } from "uuid";
import config from "../../config";
import { openModal } from "../../state/slices/inputSlice";
import { createMap } from "../../state/slices/novelFormSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import "./MapList.scss";

export const MapList = () => {
  const dispatch = useAppDispatch();
  const maps = useAppSelector((state) => state.novel.maps);
  const createNewMap = () => {
    const id = randomUUID();
    dispatch(createMap({ id: id }));
    dispatch(openModal({ modalType: "mapEdit", editId: id }));
  };
  return (
    <div className="MapList">
      <div className="MapList__header">
        <h2>Maps</h2>
        <Button theme="gradient" onClick={() => createNewMap()}>
          Create new map
        </Button>
      </div>

      {maps && (
        <div className="MapList__container">
          {maps.map((map) => {
            const { id, name, description } = map;
            return (
              <div
                key={id}
                className="MapList__container__map"
                style={{
                  backgroundImage: config.genAssetLink(map.source.png, true),
                  
                }}
              >
                <FaPencil
                  className="MapList__container__edit"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(openModal({ modalType: "mapEdit", editId: id }));
                  }}
                />
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
