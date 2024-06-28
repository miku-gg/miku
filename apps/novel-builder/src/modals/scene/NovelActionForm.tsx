import { NovelV3 } from "@mikugg/bot-utils";
import { Button } from "@mikugg/ui-kit";
import { useState } from "react";
import config from "../../config";
import InventoryItems from "../../panels/assets/inventory/InventoryItems";
import { useAppSelector } from "../../state/store";
import "./NovelActionForm.scss";
import SceneSelector from "./SceneSelector";
import { NovelAction } from "@mikugg/bot-utils/dist/lib/novel/NovelV3";
import ButtonGroup from "../../components/ButtonGroup";

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
  action: NovelAction;
  onChange: (action: NovelAction) => void;
  availableActionTypes?: NovelV3.NovelActionType[];
}) => {
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

  //suggest-advance-scene
  if (action.type === NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE) {
    const sceneData = getSceneData(action.params.sceneId);
    return (
      <div className="SuggestScene">
        {action.params.sceneId && sceneData ? (
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
        selectedItemIds={[action.params.itemId]}
        onSelect={(itemId) => {
          handleSelectItem(itemId);
        }}
      />
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
