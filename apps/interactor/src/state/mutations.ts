import { NovelV3 } from '@mikugg/bot-utils'
import { addChildrenScenes } from './slices/novelSlice'
import { removeItem } from './slices/inventorySlice'
import { setNextSceneToCurrentResponse } from './slices/narrationSlice'
import { Action } from '@reduxjs/toolkit'

export const mutationToAction = (mutation: NovelV3.StateMutation): Action => {
  switch (mutation.type) {
    case 'ADD_CHILDREN':
      return addChildrenScenes({
        parentId: mutation.config.sceneId,
        childIds: mutation.config.children,
      })
    case 'REMOVE_ITEM':
      return removeItem(mutation.config.itemId)
    case 'SUGGEST_ADVANCE_SCENE':
      return setNextSceneToCurrentResponse(mutation.config.sceneId)
  }
}
