import React from 'react';

import ReactDOM from 'react-dom/client';

import { toast } from 'react-toastify';
import App from './src/App';

import './root.scss';

import { AssetDisplayPrefix, AssetType, decodeText, getAssetLink, uploadAsset } from '@mikugg/bot-utils';
import * as Sentry from '@sentry/react';
import mergeWith from 'lodash.mergewith';
import queryString from 'query-string';

import { PersonaResult } from './src/libs/listSearch';
import { loadNovelFromSingleCard } from './src/libs/loadNovel';

import { DEFAULT_INVENTORY } from './src/libs/inventoryItems';
import { getUnlockableAchievements, getUnlockedItems } from './src/libs/platformAPI';
import { initialState as initialCreationState } from './src/state/slices/creationSlice';
import { initialState as initialInventoryState } from './src/state/slices/inventorySlice';
import { scenesToObjectives } from './src/state/slices/objectivesSlice';
import { initialState as initialSettingsState } from './src/state/slices/settingsSlice';
import { RootState } from './src/state/store';
import { VersionId } from './src/state/versioning';
import { migrateV1toV2, migrateV2toV3 } from './src/state/versioning/migrations';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
  });
}

const ASSETS_ENDPOINT = import.meta.env.VITE_ASSETS_ENDPOINT || 'http://localhost:8585/s3/assets';
const ASSETS_UPLOAD_ENDPOINT = import.meta.env.VITE_ASSETS_UPLOAD_URL || 'http://localhost:8585/asset-upload';
const CARD_ENDPOINT = import.meta.env.VITE_CARD_ENDPOINT || 'https://apidev.miku.gg/bot/config';
const CARD_ID = import.meta.env.VITE_CARD_ID || 'QmNTiMDQKh2ZhNzujupeGjWBFGC3WfcNHHNvDNXsC9rPBF.json';
const SERVICES_ENDPOINT = import.meta.env.VITE_SERVICES_ENDPOINT || 'http://localhost:8484';
const BACKGROUND_SEARCH_ENDPOINT =
  import.meta.env.VITE_BACKGROUND_SEARCH_ENDPOINT || 'http://localhost:8080/backgrounds';
const CHARACTER_SEARCH_ENDPOINT = import.meta.env.VITE_CHARACTER_SEARCH_ENDPOINT || 'http://localhost:8080/characters';
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8080';

export function getCongurationFromParams(): {
  production: boolean;
  disabled: boolean;
  freeTTS: boolean;
  freeSmart: boolean;
  isMobileApp: boolean;
  botId: string;
  cardId: string;
  narrationId: string;
  backgroundSearchEndpoint: string;
  characterSearchEndpoint: string;
  assetsUploadEndpoint: string;
  assetsEndpoint: string;
  assetsEndpointOptimized: string;
  apiEndpoint: string;
  cardEndpoint: string;
  servicesEndpoint: string;
  persona: PersonaResult;
  settings: object;
  isPublishedDemo: boolean;
} {
  const queryParams = queryString.parse(window.location.search);
  const cardId = (queryParams.cardId || '') as string;
  const botId = (queryParams.botId || '') as string;
  const narrationId = (queryParams.narrationId || '') as string;
  const production = queryParams.production === 'true';
  const disabled = queryParams.disabled === 'true';
  const configuration = queryParams.configuration as string;
  const isMobileApp = queryParams.isMobileApp === 'true';
  const isPublishedDemo = queryParams.isPublishedDemo === 'true';

  try {
    const configurationJson = JSON.parse(decodeText(configuration)) as {
      characterSearchEndpoint: string;
      backgroundSearchEndpoint: string;
      assetsUploadEndpoint: string;
      assetsEndpoint: string;
      assetsEndpointOptimized: string;
      apiEndpoint: string;
      cardEndpoint: string;
      servicesEndpoint: string;
      freeTTS: boolean;
      freeSmart: boolean;
      persona: PersonaResult;
      settings?: RootState['settings'];
    };

    return {
      production,
      disabled,
      isMobileApp,
      freeTTS: configurationJson.freeTTS || false,
      freeSmart: configurationJson.freeSmart || false,
      cardId: cardId || CARD_ID,
      botId: botId || '',
      narrationId,
      characterSearchEndpoint: configurationJson.characterSearchEndpoint || CHARACTER_SEARCH_ENDPOINT,
      backgroundSearchEndpoint: configurationJson.backgroundSearchEndpoint || BACKGROUND_SEARCH_ENDPOINT,
      assetsUploadEndpoint: configurationJson.assetsUploadEndpoint || ASSETS_UPLOAD_ENDPOINT,
      assetsEndpoint: configurationJson.assetsEndpoint || ASSETS_ENDPOINT,
      assetsEndpointOptimized: configurationJson.assetsEndpointOptimized || ASSETS_ENDPOINT,
      apiEndpoint: configurationJson.apiEndpoint || '',
      cardEndpoint: configurationJson.cardEndpoint || API_ENDPOINT,
      servicesEndpoint: configurationJson.servicesEndpoint || SERVICES_ENDPOINT,
      persona: configurationJson.persona,
      settings: configurationJson.settings || {},
      isPublishedDemo,
    };
  } catch (e) {
    return {
      production,
      isMobileApp,
      disabled,
      freeTTS: false,
      freeSmart: false,
      cardId: cardId || CARD_ID,
      botId: botId || '',
      narrationId,
      characterSearchEndpoint: CHARACTER_SEARCH_ENDPOINT,
      backgroundSearchEndpoint: BACKGROUND_SEARCH_ENDPOINT,
      assetsUploadEndpoint: ASSETS_UPLOAD_ENDPOINT,
      assetsEndpoint: ASSETS_ENDPOINT,
      assetsEndpointOptimized: ASSETS_ENDPOINT,
      apiEndpoint: '',
      cardEndpoint: CARD_ENDPOINT,
      servicesEndpoint: SERVICES_ENDPOINT,
      persona: {
        id: '',
        name: '',
        description: '',
        profilePic: '',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '',
          username: '',
        },
      },
      settings: mergeWith({}, initialSettingsState),
      isPublishedDemo,
    };
  }
}

const params = getCongurationFromParams();

const assetLinkLoader = (asset: string, type: AssetDisplayPrefix) => {
  if (asset.startsWith('data')) {
    return asset;
  }
  return getAssetLink(
    {
      fallback: params.assetsEndpoint,
      optimized: params.assetsEndpointOptimized,
    },
    asset,
    type,
  );
};

const narrationData: Promise<RootState> = new Promise((resolve) => {
  window.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    if (type === 'NARRATION_DATA') {
      resolve(payload as RootState);
    }
  });
});

export const loadNarration = async (): Promise<RootState> => {
  const achievements = await getUnlockableAchievements(params.apiEndpoint, params.botId);
  const inventoryItems = await getUnlockedItems(params.apiEndpoint);
  if (params.narrationId) {
    return narrationData.then((data) => {
      if (data.version !== VersionId) {
        if (data.version === 'v1') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const migrated = migrateV2toV3(migrateV1toV2(data));
          return {
            ...migrated,
            objectives: [
              ...scenesToObjectives(migrated.novel.scenes),
              ...(migrated.novel.objectives || []),
              ...achievements,
            ],
            inventory: {
              ...initialInventoryState,
              items: [...(migrated.novel.inventory || []), ...inventoryItems, ...DEFAULT_INVENTORY],
            },
            creation: initialCreationState,
            settings: mergeWith(
              mergeWith(mergeWith({}, initialSettingsState), data.settings || {}),
              params.settings || {},
            ),
          };
        } else if (data.version === 'v2') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const migrated = migrateV2toV3(data);
          return {
            ...migrated,
            objectives: [
              ...scenesToObjectives(migrated.novel.scenes),
              ...(migrated.novel.objectives || []),
              ...achievements,
            ],
            inventory: {
              ...initialInventoryState,
              items: [...(migrated.novel.inventory || []), ...inventoryItems, ...DEFAULT_INVENTORY],
            },
            creation: initialCreationState,
            settings: mergeWith(
              mergeWith(mergeWith({}, initialSettingsState), data.settings || {}),
              params.settings || {},
            ),
          };
        }
        toast.error('Narration version mismatch');
        throw 'Narration version mismatch';
      }
      return {
        ...data,
        objectives: [
          ...(data.objectives || []),
          ...(achievements || []).filter((achievement) => !data.objectives?.find((o) => o.id === achievement.id)),
        ],
        inventory: {
          ...initialInventoryState,
          items: [
            ...(data.inventory?.items || []).filter((item) => item.isNovelOnly),
            ...inventoryItems,
            ...DEFAULT_INVENTORY,
          ],
        },
        creation: initialCreationState,
        settings: mergeWith(mergeWith(mergeWith({}, initialSettingsState), data.settings || {}), params.settings || {}),
      };
    });
  } else {
    const { novel, narration } = await loadNovelFromSingleCard({
      cardId: params.cardId,
      cardEndpoint: params.cardEndpoint,
      assetLinkLoader,
    });
    return {
      novel,
      narration,
      objectives: [...scenesToObjectives(novel.scenes), ...(novel.objectives || []), ...achievements],
      inventory: {
        ...initialInventoryState,
        items: [...(novel.inventory || []), ...inventoryItems, ...DEFAULT_INVENTORY],
      },
      creation: initialCreationState,
      settings: mergeWith(mergeWith({}, initialSettingsState), params.settings || {}),
      version: VersionId,
    };
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App
      botId={params.botId}
      isProduction={params.production}
      isInteractionDisabled={params.disabled}
      isPublishedDemo={params.isPublishedDemo}
      servicesEndpoint={params.servicesEndpoint}
      apiEndpoint={params.apiEndpoint}
      cardEndpoint={params.cardEndpoint}
      freeSmart={params.freeSmart}
      isMobileApp={params.isMobileApp}
      freeTTS={params.freeTTS}
      persona={params.persona}
      novelLoader={loadNarration}
      assetUploader={async (file: File, type: AssetType) => {
        const uploadResponse = await uploadAsset(params.assetsUploadEndpoint, file, type);
        return {
          fileName: uploadResponse.data,
          fileSize: file.size,
        };
      }}
      assetLinkLoader={assetLinkLoader}
    />
  </React.StrictMode>,
);
