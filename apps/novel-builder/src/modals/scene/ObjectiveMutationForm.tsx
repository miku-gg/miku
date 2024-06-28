import { NovelObjectiveActionType } from "@mikugg/bot-utils/dist/lib/novel/NovelV3";
import { Button } from "@mikugg/ui-kit";
import { useState } from "react";
import { useDispatch } from "react-redux";
import config from "../../config";
import InventoryItems from "../../panels/assets/inventory/InventoryItems";
import { selectEditingObjective } from "../../state/selectors";
import { useAppSelector } from "../../state/store";
import "./ObjectiveMutationForm.scss";
import SceneSelector from "./SceneSelector";

export const ObjectiveMutationForm = () => {
  const dispatch = useDispatch();
  const objective = useAppSelector(selectEditingObjective);
  const selectedAction = objective?.action;
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

  const handleSelectScene = (id: string) => {};

  //suggest-advance-scene
  if (selectedAction?.type === NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE) {
    const sceneData = getSceneData(selectedAction.params.sceneId);
    return (
      <div className="SuggestScene">
        {selectedAction.params.sceneId && sceneData ? (
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
          selectedSceneId={selectedAction.params.sceneId}
        />
      </div>
    );
  }

  //add-item
  else if (selectedAction?.type === NovelObjectiveActionType.ITEM_RECEIVE) {
    const getItems = (itemId: string) => {
      if (!items) return [];
      return items.filter((item) => item.id === itemId);
    };

    const handleSelectItem = (itemId: string) => {
      const item = getItems(itemId)[0];
      console.log(item);
    };

    return (
      <InventoryItems
        tooltipText="Select the item that will unlock this condition."
        selectedItemIds={[selectedAction.params.item.id]}
        onSelect={(itemId) => {
          handleSelectItem(itemId);
        }}
      />
    );
  } else {
    return null;
  }
};
