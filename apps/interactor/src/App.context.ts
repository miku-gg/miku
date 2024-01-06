import { createContext, useContext } from 'react'
import { RootState } from './state/store'
import { BackgroundResult } from './libs/backgroundSearch'

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
  backgroundSearcher: (params: {
    search: string
    take: number
    skip: number
  }) => Promise<BackgroundResult[]>
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
  backgroundSearcher: () => Promise.resolve([]),
})

export const AppProvider = AppContext.Provider

export const useAppContext = () => useContext(AppContext)
