import { NovelV3 } from '@mikugg/bot-utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
  showItemModal: 'initial' | 'open' | 'closed';
  showInventory: 'initial' | 'open' | 'closed';
  selectedItem: NovelV3.InventoryItem | null;
  items: NovelV3.InventoryItem[];
}

export const initialState: InventoryState = {
  showItemModal: 'initial',
  showInventory: 'initial',
  selectedItem: null,
  items: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryVisibility: (state, action) => {
      state.showInventory = action.payload;

      if (action.payload === 'closed') {
        if (state.showItemModal === 'open') {
          state.showItemModal = 'closed';
        } else if (state.showItemModal === 'closed') {
          state.showItemModal = 'initial';
        }
      } else if (action.payload === 'open') {
        state.showItemModal = 'initial';
        state.selectedItem = null;
      }
    },
    setItemModalVisibility: (state, action) => {
      state.showItemModal = action.payload;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    addItem: (state, action: PayloadAction<NovelV3.InventoryItem>) => {
      state.items.push(action.payload);
    },
    toggleItemVisibility: (
      state,
      action: PayloadAction<{
        itemId: string;
        hidden: boolean;
      }>,
    ) => {
      state.items = state.items.map((item) => {
        if (item.id === action.payload.itemId) {
          item.hidden = action.payload.hidden;
        }
        return item;
      });
      if (state.selectedItem?.id === action.payload.itemId) {
        state.selectedItem = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.inventory;
    });
  },
});

export const { setInventoryVisibility, setItemModalVisibility, setSelectedItem, addItem, toggleItemVisibility } =
  inventorySlice.actions;

export default inventorySlice.reducer;
