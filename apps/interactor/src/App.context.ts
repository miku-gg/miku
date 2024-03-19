import { createContext, useContext } from 'react'
import { RootState } from './state/store'
import { BackgroundResult, CharacterResult } from './libs/listSearch'

export interface AppProps {
  isProduction: boolean
  isInteractionDisabled: boolean
  cardEndpoint: string
  servicesEndpoint: string
  freeTTS: boolean
  freeSmart: boolean
  novelLoader: () => Promise<RootState>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
  assetUploader: (data: File) => Promise<{
    fileName: string
    fileSize: number
  }>
  characterSearcher: (params: {
    search: string
    take: number
    skip: number
  }) => Promise<CharacterResult[]>
  backgroundSearcher: (params: {
    search: string
    take: number
    skip: number
  }) => Promise<BackgroundResult[]>
}

const AppContext = createContext<AppProps>({
  isProduction: false,
  isInteractionDisabled: false,
  cardEndpoint: '',
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
  characterSearcher: () => Promise.resolve([]),
  backgroundSearcher: () => Promise.resolve([]),
})

export const AppProvider = AppContext.Provider

export const useAppContext = () => useContext(AppContext)
