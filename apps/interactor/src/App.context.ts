import { createContext, useContext } from 'react'

import { RootState } from './state/store'

import { PersonaResult } from './libs/listSearch'
import { i18nLanguage } from './libs/lang/i18n'

export interface AppProps {
  isProduction: boolean
  isInteractionDisabled: boolean
  apiEndpoint: string
  isMobileApp: boolean
  cardEndpoint: string
  language: i18nLanguage
  servicesEndpoint: string
  freeTTS: boolean
  freeSmart: boolean
  persona: PersonaResult
  novelLoader: () => Promise<RootState>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
  assetUploader: (data: File) => Promise<{
    fileName: string
    fileSize: number
  }>
}

const AppContext = createContext<AppProps>({
  isProduction: false,
  isInteractionDisabled: false,
  apiEndpoint: '',
  cardEndpoint: '',
  isMobileApp: false,
  servicesEndpoint: '',
  language: 'en',
  freeTTS: false,
  freeSmart: false,
  persona: {} as PersonaResult,
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
