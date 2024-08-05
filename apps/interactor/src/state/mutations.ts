import { NovelV3 } from '@mikugg/bot-utils';
import { addChildrenScenes } from './slices/novelSlice';
import { toggleItemVisibility } from './slices/inventorySlice';
import { setNextSceneToCurrentResponse, setSceneCreationSuggestionToCurrentResponse } from './slices/narrationSlice';
import { Action } from '@reduxjs/toolkit';

export const novelActionToStateAction = (action: NovelV3.NovelAction): Action | undefined => {
  switch (action.type) {
    case NovelV3.NovelActionType.ADD_CHILD_SCENES:
      return addChildrenScenes({
        parentId: action.params.sceneId,
        childIds: action.params.children,
      });
    case NovelV3.NovelActionType.HIDE_ITEM:
      return toggleItemVisibility({
        itemId: action.params.itemId,
        hidden: true,
      });
    case NovelV3.NovelActionType.SHOW_ITEM:
      return toggleItemVisibility({
        itemId: action.params.itemId,
        hidden: false,
      });
    case NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE:
      return setNextSceneToCurrentResponse(action.params.sceneId);
    case NovelV3.NovelActionType.SUGGEST_CREATE_SCENE:
      return setSceneCreationSuggestionToCurrentResponse();
  }
};
