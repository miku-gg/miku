import { createSlice } from '@reduxjs/toolkit'

export interface InventoryAction {
  name: string
  prompt: string
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  image: string
  actions: InventoryAction[]
}

interface InventoryState {
  showItemModal: 'initial' | 'open' | 'closed'
  showInventory: 'initial' | 'open' | 'closed'
  selectedItem: InventoryItem | null
}

export const initialState: InventoryState = {
  showItemModal: 'initial',
  showInventory: 'initial',
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
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload
    },
  },
})

export const {
  setInventoryVisibility,
  setItemModalVisibility,
  setSelectedItem,
} = inventorySlice.actions

export default inventorySlice.reducer
