import { NovelV3 } from '@mikugg/bot-utils';
import {
  addChildrenScenes,
  changeSceneCharacterOutfit,
  changeVisibilityOfPlaceInMap,
  addAbilityToCharacter,
  addCharacterToParty,
  changeCharacterBattleOutfit,
  changeCutscenePartBackground,
} from './slices/novelSlice';
import { toggleItemVisibility } from './slices/inventorySlice';
import { setNextSceneToCurrentResponse, setSceneCreationSuggestionToCurrentResponse } from './slices/narrationSlice';
import { Action } from '@reduxjs/toolkit';
import { setModalOpened } from './slices/creationSlice';

export const novelActionToStateAction = (action: NovelV3.NovelAction): Action[] => {
  switch (action.type) {
    case NovelV3.NovelActionType.ADD_CHILD_SCENES:
      return [
        addChildrenScenes({
          parentId: action.params.sceneId,
          childIds: action.params.children,
        }),
      ];
    case NovelV3.NovelActionType.HIDE_ITEM:
      return [
        toggleItemVisibility({
          itemId: action.params.itemId,
          hidden: true,
        }),
      ];
    case NovelV3.NovelActionType.SHOW_ITEM:
      return [
        toggleItemVisibility({
          itemId: action.params.itemId,
          hidden: false,
        }),
      ];
    case NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE:
      return [
        setNextSceneToCurrentResponse(action.params.sceneId),
        setModalOpened({
          id: 'scene-preview',
          opened: true,
          itemId: action.params.sceneId,
        }),
      ];
    case NovelV3.NovelActionType.SUGGEST_CREATE_SCENE:
      return [setSceneCreationSuggestionToCurrentResponse()];
    case NovelV3.NovelActionType.CHANGE_SCENE_CHARACTER_OUTFIT:
      return [
        changeSceneCharacterOutfit({
          sceneId: action.params.sceneId,
          characterId: action.params.characterId,
          outfitId: action.params.outfitId,
        }),
      ];
    case NovelV3.NovelActionType.CHANGE_VISIBILITY_OF_PLACE_IN_MAP:
      return [
        changeVisibilityOfPlaceInMap({
          mapId: action.params.mapId,
          placeId: action.params.placeId,
          hidden: action.params.hidden,
        }),
      ];
    case NovelV3.NovelActionType.RPG_ADD_ABILITY_TO_CHARACTER:
      return [
        addAbilityToCharacter({
          characterId: action.params.characterId,
          abilityId: action.params.abilityId,
        }),
      ];
    case NovelV3.NovelActionType.RPG_ADD_CHARACTER_TO_PARTY:
      return [
        addCharacterToParty({
          characterId: action.params.characterId,
        }),
      ];
    case NovelV3.NovelActionType.RPG_CHANGE_BATTLE_OUTFIT:
      return [
        changeCharacterBattleOutfit({
          characterId: action.params.characterId,
          outfitId: action.params.outfitId,
        }),
      ];
    case NovelV3.NovelActionType.CHANGE_CUTSCENE_PART_BACKGROUND:
      return [
        changeCutscenePartBackground({
          cutsceneId: action.params.cutsceneId,
          partId: action.params.partId,
          backgroundId: action.params.backgroundId,
        }),
      ];
  }
  return [];
};
