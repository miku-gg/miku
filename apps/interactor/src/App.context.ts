import { createContext, useContext } from 'react';

import { RootState } from './state/store';

import { PersonaResult } from './libs/listSearch';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';

export interface AppProps {
  botId: string;
  isProduction: boolean;
  isInteractionDisabled: boolean;
  isPublishedDemo: boolean;
  apiEndpoint: string;
  isMobileApp: boolean;
  cardEndpoint: string;
  servicesEndpoint: string;
  freeTTS: boolean;
  freeSmart: boolean;
  persona: PersonaResult;
  novelLoader: () => Promise<RootState>;
  assetLinkLoader: (asset: string, type: AssetDisplayPrefix) => string;
  assetUploader: (
    data: File,
    type: AssetType,
  ) => Promise<{
    fileName: string;
    fileSize: number;
  }>;
}

const AppContext = createContext<AppProps>({
  botId: '',
  isProduction: false,
  isInteractionDisabled: false,
  isPublishedDemo: false,
  apiEndpoint: '',
  cardEndpoint: '',
  isMobileApp: false,
  servicesEndpoint: '',
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
});

export const AppProvider = AppContext.Provider;

export const useAppContext = () => useContext<AppProps>(AppContext);
