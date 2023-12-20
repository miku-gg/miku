import { createContext, useContext } from 'react'
import { NovelState } from './state/slices/novelSlice'
import { NarrationState } from './state/slices/narrationSlice'

export interface AppProps {
  isProduction: boolean
  novelLoader: () => Promise<{
    novel: NovelState
    narration: NarrationState
  }>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
}

const AppContext = createContext<AppProps>({
  isProduction: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  assetLinkLoader: (_asset: string, _lowres?: boolean) => '',
  novelLoader: () =>
    Promise.resolve({
      novel: {} as NovelState,
      narration: {} as NarrationState,
    }),
})

export const AppProvider = AppContext.Provider

export const useAppContext = () => useContext(AppContext)
