import {
  NovelSellerInvetoryItem,
  NovelSellerInvetoryItemAction,
} from '@mikugg/bot-utils/dist/lib/novel/NovelV3'
import { createSlice } from '@reduxjs/toolkit'

interface InventoryState {
  showItemModal: 'initial' | 'open' | 'closed'
  showInventory: 'initial' | 'open' | 'closed'
  triggeredAction: {
    item: NovelSellerInvetoryItem
    action: NovelSellerInvetoryItemAction
  } | null
  selectedItem: NovelSellerInvetoryItem | null
}

const initialState: InventoryState = {
  showItemModal: 'initial',
  showInventory: 'initial',
  triggeredAction: null,
  selectedItem: null,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryVisibility: (state, action) => {
      state.showInventory = action.payload

      if (action.payload === 'closed') {
        if (state.showItemModal === 'open') {
          state.showItemModal = 'closed'
        } else if (state.showItemModal === 'closed') {
          state.showItemModal = 'initial'
        }
      } else if (action.payload === 'open') {
        state.showItemModal = 'initial'
        state.selectedItem = null
      }
    },
    setItemModalVisibility: (state, action) => {
      state.showItemModal = action.payload
    },
    setTriggeredAction: (state, action) => {
      state.triggeredAction = action.payload
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload
    },
  },
})

export const {
  setInventoryVisibility,
  setItemModalVisibility,
  setTriggeredAction,
  setSelectedItem,
} = inventorySlice.actions

export default inventorySlice.reducer
