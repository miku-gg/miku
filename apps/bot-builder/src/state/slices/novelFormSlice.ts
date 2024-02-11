import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NovelBackground, NovelFormState } from "../NovelFormState";
/*
const initialState: NovelFormState = {
  title: "",
  description: "",
  logoPic: "",
  author: "",
  tags: [],
  characters: [],
  backgrounds: [],
  songs: [],
  maps: [],
  scenes: [],
  starts: [],
};
*/
const initialState: NovelFormState = {
  title: "",
  description: "",
  logoPic: "",
  author: "",
  tags: [],
  characters: [],
  backgrounds: [
    {
      id: "bg-1",
      attributes: [],
      description: "A beautiful forest",
      name: "Forest",
      source: {
        jpg: "QmUdzioMR7UBC7qGAaFvsN1FyLujeHSqcsc4LAj3paYpFC.png",
      },
    },
  ],
  songs: [],
  maps: [],
  scenes: [],
  starts: [],
};

const novelFormSlice = createSlice({
  name: "novel",
  initialState,
  reducers: {
    addBackground: (state, action: PayloadAction<NovelBackground>) => {
      state.backgrounds.push(action.payload);
    },
    updateBackground: (state, action: PayloadAction<NovelBackground>) => {
      const index = state.backgrounds.findIndex(
        (background) => background.id === action.payload.id
      );
      if (index === -1) return;
      state.backgrounds[index] = action.payload;
    },
    deleteBackground: (state, action: PayloadAction<string>) => {
      const index = state.backgrounds.findIndex(
        (background) => background.id === action.payload
      );
      if (index === -1) return;
      state.backgrounds.splice(index, 1);
    },
  },
});

export const { addBackground, updateBackground, deleteBackground } =
  novelFormSlice.actions;

export default novelFormSlice.reducer;
