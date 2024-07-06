import { NovelV3 } from "@mikugg/bot-utils";
import { Button } from "@mikugg/ui-kit";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import ButtonGroup from "../../components/ButtonGroup";
import config from "../../config";
import InventoryItems from "../../panels/assets/inventory/InventoryItems";
import { selectEditingInventoryItem } from "../../state/selectors";
import { useAppSelector } from "../../state/store";
import "./NovelActionForm.scss";
import SceneSelector from "./SceneSelector";

export const getDefaultAction = (
  actionType: NovelV3.NovelActionType
): NovelV3.NovelAction => {
  switch (actionType) {
    case NovelV3.NovelActionType.ADD_CHILD_SCENES:
      return {
        type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
        params: {
          sceneId: "",
          children: [],
        },
      };
    case NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE:
      return {
        type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
        params: {
          sceneId: "",
        },
      };
    case NovelV3.NovelActionType.SHOW_ITEM:
      return {
        type: NovelV3.NovelActionType.SHOW_ITEM,
        params: {
          itemId: "",
        },
      };
    case NovelV3.NovelActionType.HIDE_ITEM:
      return {
        type: NovelV3.NovelActionType.HIDE_ITEM,
        params: {
          itemId: "",
        },
      };
    default:
      return {
        type: NovelV3.NovelActionType.HIDE_ITEM,
        params: {
          itemId: "",
        },
      };
  }
};

const ActionParamsForm = ({
  action,
  onChange,
  availableActionTypes,
}: {
  action: NovelV3.NovelAction;
  onChange: (action: NovelV3.NovelAction) => void;
  availableActionTypes?: NovelV3.NovelActionType[];
}) => {
  const scenes = useAppSelector((state) => state.novel.scenes);
  const editingItem = useAppSelector(selectEditingInventoryItem);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const [isSceneSelectorOpened, setIsSceneSelectorOpened] = useState(false);
  const [childSceneSelectorId, setChildSceneSelectorId] = useState<
    "parent" | "children" | null
  >(null);

  const getSceneData = (sceneId: string) => {
    return scenes.find((scene) => scene.id === sceneId);
  };

  const getBackgroundSource = (backgroundId: string) => {
    const background = backgrounds.find(
      (background) => background.id === backgroundId
    );
    if (background) {
      return background.source.jpg;
    } else return "";
  };

  //suggest-advance-scene
  if (action.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE) {
    const sceneData = getSceneData(action.params.sceneId);
    return (
      <div className="SuggestScene">
        <div className="SuggestScene__header">
          <h3 className="SuggestScene__header__title">Select the scene</h3>
          <Button
            theme="gradient"
            onClick={() => {
              setIsSceneSelectorOpened(true);
            }}
          >
            Select the scene
          </Button>
        </div>
        {action.params.sceneId && sceneData ? (
          <div className="scene">
            <div className="scene__header">
              <p className="scene__header__name">{sceneData?.name}</p>
              <FaTrashAlt
                className="scene__header__edit"
                onClick={() => {
                  onChange({
                    type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
                    params: {
                      sceneId: "",
                    },
                  });
                }}
              />
            </div>
            <img
              className="scene__background"
              src={config.genAssetLink(
                getBackgroundSource(sceneData.backgroundId) || ""
              )}
            />
          </div>
        ) : null}
        <SceneSelector
          opened={isSceneSelectorOpened}
          onCloseModal={() => setIsSceneSelectorOpened(false)}
          onSelectScene={(id) =>
            onChange({
              type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
              params: {
                sceneId: id,
              },
            })
          }
          selectedSceneId={action.params.sceneId}
        />
      </div>
    );
  }

  //add-item
  else if (action.type === NovelV3.NovelActionType.SHOW_ITEM) {
    return (
      <InventoryItems
        skipItemIds={editingItem ? [editingItem.id] : []}
        tooltipText="Select the item that will unlock this condition."
        selectedItemIds={[action.params.itemId]}
        onSelect={(itemId) => {
          onChange({
            ...action,
            params: {
              itemId,
            },
          });
        }}
      />
    );
  }

  //remove-item
  else if (action.type === NovelV3.NovelActionType.HIDE_ITEM) {
    return (
      <InventoryItems
        tooltipText="Select the item that will be hidden by this condition."
        selectedItemIds={[action.params.itemId]}
        onSelect={(itemId) => {
          onChange({
            ...action,
            params: {
              itemId,
            },
          });
        }}
      />
    );
  }

  //add-child-scenes
  else if (action.type === NovelV3.NovelActionType.ADD_CHILD_SCENES) {
    const sceneData = getSceneData(action.params.sceneId);
    return (
      <div className="ChildScenes">
        <div className="ChildScenes__parent">
          <div className="ChildScenes__parent__header">
            <h3 className="ChildScenes__parent__header__title">Parent scene</h3>
            {!action.params.sceneId && (
              <Button
                theme="gradient"
                onClick={() => {
                  setChildSceneSelectorId("parent");
                }}
              >
                Select scene
              </Button>
            )}
          </div>
          {action.params.sceneId && sceneData ? (
            <div className="scene">
              <div className="scene__header">
                <p className="scene__header__name">{sceneData.name}</p>
                <FaTrashAlt
                  className="scene__header__edit"
                  onClick={() => {
                    onChange({
                      type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                      params: {
                        ...action.params,
                        sceneId: "",
                      },
                    });
                  }}
                />
              </div>
              <img
                className="scene__background"
                src={config.genAssetLink(
                  getBackgroundSource(sceneData.backgroundId)
                )}
              />
            </div>
          ) : null}
        </div>
        <div className="ChildScenes__childrens">
          <div className="ChildScenes__childrens__header">
            <h3 className="ChildScenes__childrens__header__title">
              Select the children scenes
            </h3>
            <Button
              theme="gradient"
              onClick={() => {
                setChildSceneSelectorId("children");
              }}
            >
              Select scenes
            </Button>
          </div>
          <div className="ChildScenes__childrens__scenes">
            {action.params.children.length > 0
              ? action.params.children.map((sceneId) => {
                  const scene = getSceneData(sceneId);
                  return (
                    <div key={sceneId} className="scene">
                      <div className="scene__header">
                        <p className="scene__header__name">{scene?.name}</p>
                        <FaTrashAlt
                          className="scene__header__edit"
                          onClick={() => {
                            onChange({
                              type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                              params: {
                                ...action.params,
                                children: action.params.children.filter(
                                  (id) => id !== sceneId
                                ),
                              },
                            });
                          }}
                        />
                      </div>
                      <img
                        className="scene__background"
                        src={config.genAssetLink(
                          getBackgroundSource(scene?.backgroundId || "") || ""
                        )}
                      />
                    </div>
                  );
                })
              : null}
          </div>
        </div>

        <SceneSelector
          opened={!!childSceneSelectorId}
          onCloseModal={() => setChildSceneSelectorId(null)}
          onSelectScene={(sceneId) => {
            if (childSceneSelectorId === "children") {
              onChange({
                type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                params: {
                  ...action.params,
                  children: action.params.children.includes(sceneId)
                    ? action.params.children.filter((id) => id !== sceneId)
                    : [...action.params.children, sceneId],
                },
              });
            } else {
              onChange({
                type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                params: {
                  ...action.params,
                  sceneId: action.params.sceneId === sceneId ? "" : sceneId,
                },
              });
            }
          }}
          selectedScenes={
            childSceneSelectorId === "children"
              ? action.params.children
              : [action.params.sceneId]
          }
        />
      </div>
    );
  } else {
    return null;
  }
};

export default function NovelActionForm({
  action,
  onChange,
  onDelete,
  availableActionTypes,
}: {
  action: NovelV3.NovelAction;
  onChange: (action: NovelV3.NovelAction) => void;
  onDelete: () => void;
  availableActionTypes?: NovelV3.NovelActionType[];
}) {
  return (
    <div className="NovelActionForm">
      <div className="NovelActionForm__action-type">
        <ButtonGroup<NovelV3.NovelActionType>
          buttons={[
            {
              content: "Add children scenes",
              value: NovelV3.NovelActionType.ADD_CHILD_SCENES,
            },
            {
              content: "Suggest advance scene",
              value: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
            },
            {
              content: "Add item",
              value: NovelV3.NovelActionType.SHOW_ITEM,
            },
            {
              content: "Remove item",
              value: NovelV3.NovelActionType.HIDE_ITEM,
            },
          ]}
          selected={action.type}
          onButtonClick={(value) => {
            onChange(getDefaultAction(value));
          }}
        />
      </div>
      <div className="NovelActionForm__action-params">
        <ActionParamsForm
          action={action}
          onChange={(action) => onChange(action)}
          availableActionTypes={availableActionTypes}
        />
      </div>
    </div>
  );
}
