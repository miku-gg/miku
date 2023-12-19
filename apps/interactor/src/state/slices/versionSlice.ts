import { createSlice } from '@reduxjs/toolkit'
import { VersionId } from '../versioning'

const initialState: string = VersionId

export const versionSlice = createSlice({
  name: 'version',
  initialState,
  reducers: {},
})

export default versionSlice.reducer
