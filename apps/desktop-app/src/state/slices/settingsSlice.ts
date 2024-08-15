import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
};

const settings = createSlice({
  name: "settings",
  initialState,
  reducers: {},
});

export const {} = settings.actions;

export default settings.reducer;
