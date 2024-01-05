import { createContext, useContext } from 'react'
import { RootState } from './state/store'

export interface AppProps {
  isProduction: boolean
  isInteractionDisabled: boolean
  servicesEndpoint: string
  freeTTS: boolean
  freeSmart: boolean
  novelLoader: () => Promise<RootState>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
  assetUploader: (data: string) => Promise<{
    fileName: string
    fileSize: number
  }>
}

const AppContext = createContext<AppProps>({
  isProduction: false,
  isInteractionDisabled: false,
  servicesEndpoint: '',
  freeTTS: false,
  freeSmart: false,
  novelLoader: () => Promise.resolve({} as RootState),
  assetLinkLoader: () => '',
  assetUploader: () =>
    Promise.resolve({
      fileName: '',
      fileSize: 0,
    }),
})

export const AppProvider = AppContext.Provider

export const useAppContext = () => useContext(AppContext)
