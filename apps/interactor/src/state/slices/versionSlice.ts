import { createSlice } from '@reduxjs/toolkit';
import { VersionId } from '../versioning';

const initialState: string = VersionId;

export const versionSlice = createSlice({
  name: 'version',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.version;
    });
  },
});

export default versionSlice.reducer;
