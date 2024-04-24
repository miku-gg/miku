import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  showInventory: false,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryVisibility: (state, action) => {
      state.showInventory = action.payload
    },
  },
})

export const { setInventoryVisibility } = inventorySlice.actions

export default inventorySlice.reducer
