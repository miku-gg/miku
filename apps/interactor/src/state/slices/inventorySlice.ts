import {
  NovelSellerInvetoryItem,
  NovelSellerInvetoryItemAction,
} from '@mikugg/bot-utils/dist/lib/novel/NovelV3'
import { createSlice } from '@reduxjs/toolkit'

interface InventoryState {
  showInventory: 'initial' | 'open' | 'closed'
  triggeredAction: {
    item: NovelSellerInvetoryItem
    action: NovelSellerInvetoryItemAction
  } | null
}

const initialState: InventoryState = {
  showInventory: 'initial',
  triggeredAction: null,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryVisibility: (state, action) => {
      state.showInventory = action.payload
    },
    setTriggeredAction: (state, action) => {
      state.triggeredAction = action.payload
    },
  },
})

export const { setInventoryVisibility, setTriggeredAction } =
  inventorySlice.actions

export default inventorySlice.reducer
