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
}

const AppContext = createContext<AppProps>({
  isProduction: false,
  isInteractionDisabled: false,
  servicesEndpoint: '',
  freeTTS: false,
  freeSmart: false,
  assetLinkLoader: () => '',
  novelLoader: () => Promise.resolve({} as RootState),
})

export const AppProvider = AppContext.Provider

export const useAppContext = () => useContext(AppContext)
