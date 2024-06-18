import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import novel from "./slices/novelFormSlice";
import input from "./slices/inputSlice";
import token from "./slices/tokensSlice";

export const store = configureStore({
  reducer: {
    novel,
    input,
    token
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
