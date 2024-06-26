import { NovelInventoryItem } from "@mikugg/bot-utils/dist/lib/novel/NovelV3";
import { Button } from "@mikugg/ui-kit";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import config from "../../config";
import InventoryItems from "../../panels/assets/inventory/InventoryItems";
import { selectEditingCondition } from "../../state/selectors";
import { updateCondition } from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";
import "./SceneMutationForm.scss";
import SceneSelector from "./SceneSelector";

export const SceneMutationForm = () => {
  const dispatch = useDispatch();
  const condition = useAppSelector(selectEditingCondition);
  const selectedMutation = condition?.mutationTrigger;
  const scenes = useAppSelector((state) => state.novel.scenes);
  const items = useAppSelector((state) => state.novel.inventory);

  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const [isSceneSelectorOpened, setIsSceneSelectorOpened] = useState(false);

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

  const handleSelectScene = (selectedSceneId: string) => {
    if (condition && selectedMutation?.type === "ADD_CHILDREN") {
      dispatch(
        updateCondition({
          conditionId: condition.id,
          sceneId: condition.sceneId,
          condition: {
            ...condition,
            mutationTrigger: {
              ...selectedMutation,
              config: {
                ...selectedMutation.config,
                sceneId: condition.sceneId,
                children: selectedMutation.config.children.includes(
                  selectedSceneId
                )
                  ? selectedMutation.config.children.filter(
                      (id) => id !== selectedSceneId
                    )
                  : [...selectedMutation.config.children, selectedSceneId],
              },
            },
          },
        })
      );
    } else if (
      condition &&
      selectedMutation?.type === "SUGGEST_ADVANCE_SCENE"
    ) {
      dispatch(
        updateCondition({
          conditionId: condition.id,
          sceneId: condition.sceneId,
          condition: {
            ...condition,
            mutationTrigger: {
              ...selectedMutation,
              config: {
                ...selectedMutation.config,
                sceneId:
                  selectedSceneId === selectedMutation.config.sceneId
                    ? ""
                    : selectedSceneId,
              },
            },
          },
        })
      );
    }
  };

  //suggest-advance-scene
  if (selectedMutation?.type === "SUGGEST_ADVANCE_SCENE") {
    const sceneData = getSceneData(selectedMutation.config.sceneId);
    return (
      <div className="SuggestScene">
        {selectedMutation.config.sceneId && sceneData ? (
          <div className="scene">
            <div className="scene__header">
              <p className="scene__header__name">{sceneData?.name}</p>
            </div>
            <img
              className="scene__background"
              src={config.genAssetLink(
                getBackgroundSource(sceneData.backgroundId) || ""
              )}
            />
          </div>
        ) : null}
        <Button
          theme="gradient"
          onClick={() => {
            setIsSceneSelectorOpened(true);
          }}
        >
          Select the scene
        </Button>
        <SceneSelector
          opened={isSceneSelectorOpened}
          onCloseModal={() => setIsSceneSelectorOpened(false)}
          onSelectScene={(id) => handleSelectScene(id)}
          selectedSceneId={selectedMutation.config.sceneId}
        />
      </div>
    );
  }
  //add-children
  else if (selectedMutation?.type === "ADD_CHILDREN") {
    const sceneData = selectedMutation.config.children.map((sceneId) => {
      return getSceneData(sceneId);
    });

    const handleRemoveScene = (sceneId: string) => {
      if (condition && selectedMutation?.type === "ADD_CHILDREN") {
        dispatch(
          updateCondition({
            conditionId: condition.id,
            sceneId: condition.sceneId,
            condition: {
              ...condition,
              mutationTrigger: {
                ...selectedMutation,
                config: {
                  ...selectedMutation.config,
                  children: selectedMutation.config.children.filter(
                    (id) => id !== sceneId
                  ),
                },
              },
            },
          })
        );
      }
    };
    return (
      <div className="AddChildren">
        {selectedMutation.config.children.length > 0 ? (
          <div className="AddChildren__childrenScenes">
            {sceneData.map((scene) => {
              return (
                <div className="scene">
                  <div className="scene__header">
                    <p className="scene__header__name">{scene?.name}</p>
                    <FaTrashAlt
                      className="scene__header__remove"
                      onClick={() => {
                        handleRemoveScene(scene?.id || "");
                      }}
                    />
                  </div>
                  <img
                    className="scene__background"
                    src={config.genAssetLink(
                      getBackgroundSource(scene?.backgroundId || "")
                    )}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
        <Button
          theme="gradient"
          onClick={() => {
            setIsSceneSelectorOpened(true);
          }}
        >
          Select the scene
        </Button>
        <SceneSelector
          opened={isSceneSelectorOpened}
          onCloseModal={() => setIsSceneSelectorOpened(false)}
          onSelectScene={(id) => handleSelectScene(id)}
          selectedScenes={selectedMutation.config.children}
        />
      </div>
    );
  } else if (selectedMutation?.type === "ADD_ITEM") {
    const getItems = (itemId: string) => {
      if (!items) return [];
      return items.filter((item) => item.id === itemId);
    };

    const handleSelectItem = (itemId: string) => {
      if (!condition) return null;
      dispatch(
        updateCondition({
          conditionId: condition.id,
          sceneId: condition.sceneId,
          condition: {
            ...condition,
            mutationTrigger: {
              ...selectedMutation,
              config: {
                ...selectedMutation.config,
                item:
                  selectedMutation.config.item.id === itemId
                    ? ({} as NovelInventoryItem)
                    : getItems(itemId)[0],
              },
            },
          },
        })
      );
    };

    return (
      <InventoryItems
        selectedItemIds={[selectedMutation.config.item.id]}
        onSelect={(itemId) => {
          handleSelectItem(itemId);
        }}
      />
    );
  } else if (selectedMutation?.type === "REMOVE_ITEM") {
    return <div>remove item</div>;
  } else {
    return null;
  }
};
