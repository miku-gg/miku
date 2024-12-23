import { Button, Tooltip } from '@mikugg/ui-kit';
import { FaCheckCircle } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { v4 as randomUUID } from 'uuid';
import config from '../../config';
import { openModal } from '../../state/slices/inputSlice';
import { createMap } from '../../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MapList.scss';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

interface MapListProps {
  onSelectMap?: (mapId: string) => void;
  tooltipText?: string;
  selectedMapId?: string[];
}

export const MapList = ({ onSelectMap, tooltipText, selectedMapId }: MapListProps) => {
  const dispatch = useAppDispatch();
  const maps = useAppSelector((state) => state.novel.maps);
  const createNewMap = () => {
    const id = randomUUID();
    dispatch(createMap({ id: id }));
    onSelectMap && onSelectMap(id);
    dispatch(openModal({ modalType: 'mapEdit', editId: id }));
  };

  const isSelected = (id: string) => {
    if (!selectedMapId) return false;
    return selectedMapId.includes(id);
  };

  return (
    <div className={`MapList ${onSelectMap ? 'MapSelection' : ''}`}>
      <div className="MapList__header">
        <div className="MapList__header__title">
          <h2>Maps</h2>
          {tooltipText && (
            <>
              <IoInformationCircleOutline
                className="MapList__header__title__infoIcon"
                data-tooltip-id="Info-maps"
                data-tooltip-content={tooltipText}
              />
              <Tooltip id="Info-maps" place="top" />
            </>
          )}
        </div>
        <Button theme="gradient" onClick={() => createNewMap()}>
          Create new map
        </Button>
      </div>

      {maps.length > 0 ? (
        <div className="MapList__container">
          {maps.map((map) => {
            const { id, name, description } = map;
            return (
              <div className="MapList__container__box" key={`map-${id}`}>
                <div
                  key={id}
                  className={`MapList__container__map ${isSelected(id) ? 'selected' : ''}`}
                  onClick={() => onSelectMap && onSelectMap(id)}
                >
                  <h3>{name}</h3>
                  <p>{description}</p>
                  {map.source.png && (
                    <img
                      className="MapList__container__map__preview"
                      src={config.genAssetLink(map.source.png, AssetDisplayPrefix.MAP_IMAGE)}
                      alt="map"
                    />
                  )}
                  {isSelected(id) && (
                    <div className="selected__badge">
                      <FaCheckCircle />
                      Selected
                    </div>
                  )}
                  <FaPencil
                    className="MapList__container__edit"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(openModal({ modalType: 'mapEdit', editId: id }));
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Don't have maps created.</p>
      )}
    </div>
  );
};
