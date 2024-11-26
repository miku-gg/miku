import { Modal } from '@mikugg/ui-kit';
import classNames from 'classnames';
import config from '../../config';
import { selectScenes } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import './SceneSelector.scss';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

interface SceneSelectorProps {
  opened: boolean;
  onCloseModal: () => void;
  selectedSceneId?: string;
  onSelectScene: (sceneId: string) => void;
  selectedScenes?: string[];
}

export const SceneSelectorModal = ({
  opened,
  onCloseModal,
  onSelectScene,
  selectedSceneId,
  selectedScenes,
}: SceneSelectorProps) => {
  const scenes = useAppSelector(selectScenes);
  const isSelected = (sceneId: string) => {
    return selectedScenes?.includes(sceneId);
  };

  return (
    <Modal title="Select a Scene" opened={opened} onCloseModal={onCloseModal} className="SceneSelectorModal">
      <div className="SceneSelectorModal__scene-selection">
        <IoIosCloseCircleOutline className="SceneSelectorModal__closeModal" onClick={onCloseModal} />
        <div className="SceneSelectorModal__scene-selection-list">
          {scenes.map((scene) => (
            <div
              className={classNames({
                'SceneSelectorModal__scene-selection-item': true,
                'SceneSelectorModal__scene-selection-item--selected': selectedScenes
                  ? isSelected(scene.id)
                  : scene.id === selectedSceneId,
              })}
              key={scene.id}
              onClick={() => {
                if (!selectedScenes?.includes(scene.id)) {
                  onSelectScene(scene.id);
                }
                onCloseModal();
              }}
            >
              <div
                className="SceneNode"
                style={{
                  backgroundImage: `url(${config.genAssetLink(
                    scene.background?.source.jpg || '',
                    AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL,
                  )})`,
                }}
              >
                <div className="SceneNode__title">{scene.name}</div>
                <div className="SceneNode__characters">
                  {scene.characters.map((character, index) => (
                    <img
                      key={index}
                      src={config.genAssetLink(character.profile_pic || '', AssetDisplayPrefix.PROFILE_PIC)}
                      alt={`Character ${index}`}
                      className="SceneNode__character"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default function SceneSelector({
  value: _value,
  multiSelect,
  nonDeletable,
  title,
  onChange,
}:
  | {
      multiSelect: true;
      value: string[];
      onChange: (sceneIds: string[]) => void;
      title?: string;
      nonDeletable?: boolean;
    }
  | {
      multiSelect: false;
      value: string | null;
      onChange: (sceneId: string | null) => void;
      title?: string;
      nonDeletable?: boolean;
    }) {
  const [opened, setOpened] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const scenes = useAppSelector(selectScenes);
  const value = multiSelect ? _value : _value ? [_value] : [];
  const selectedScenes = scenes.filter((scene) => value.includes(scene.id));
  const selectedSceneId = editingIndex !== null ? value[editingIndex] : undefined;

  return (
    <div className="SceneSelector">
      <div className="SceneSelector__content">
        {title && <div className="SceneSelector__title">{title}</div>}
        <div className="SceneSelector__selected-scenes">
          {selectedScenes.map((scene, index) => (
            <div
              className="SceneNode"
              tabIndex={0}
              key={`scene-selector-${scene.id}`}
              onClick={() => {
                setOpened(true);
                setEditingIndex(index);
              }}
              style={{
                backgroundImage: `url(${config.genAssetLink(
                  scene.background?.source.jpg || '',
                  AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL,
                )})`,
              }}
            >
              <div className="SceneNode__title">{scene.name}</div>
              {!nonDeletable && (
                <FaTrashAlt
                  className="SceneNode__delete"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (multiSelect) {
                      onChange(value.filter((sceneId) => sceneId !== scene.id));
                    } else {
                      onChange(null);
                    }
                  }}
                />
              )}
              <div className="SceneNode__characters">
                {scene.characters.map((character, index) => (
                  <img
                    key={index}
                    src={config.genAssetLink(character.profile_pic || '', AssetDisplayPrefix.PROFILE_PIC)}
                    alt={`Character ${index}`}
                    className="SceneNode__character"
                  />
                ))}
              </div>
            </div>
          ))}
          {(multiSelect && value.length < 3) || (!multiSelect && value.length === 0) ? (
            <div
              className="SceneNode"
              tabIndex={0}
              onClick={() => {
                setOpened(true);
                setEditingIndex(value.length);
              }}
              style={{
                backgroundImage: `url(${config.genAssetLink('add_item.jpg', AssetDisplayPrefix.ITEM_IMAGE)})`,
              }}
            ></div>
          ) : null}
        </div>
      </div>
      <SceneSelectorModal
        opened={opened}
        onCloseModal={() => setOpened(false)}
        selectedScenes={value}
        selectedSceneId={selectedSceneId}
        onSelectScene={(sceneId) => {
          if (multiSelect) {
            if (editingIndex !== null) {
              const newValue = [...value];
              newValue[editingIndex] = sceneId;
              onChange(newValue);
            }
          } else {
            onChange(sceneId);
          }
          setOpened(false);
        }}
      />
    </div>
  );
}
