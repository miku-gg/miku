import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App'
import { loadNovelFromSingleCard } from './src/libs/loadNovel'
import './root.scss'
import { initialState as initialSettingsState } from './src/state/slices/settingsSlice'
import { initialState as initialCreationState } from './src/state/slices/creationSlice'
import { RootState } from './src/state/store'
import { VersionId } from './src/state/versioning'
import { decodeText } from '@mikugg/bot-utils'
import queryString from 'query-string'
import mergeWith from 'lodash.mergewith'
import { toast } from 'react-toastify'
import { migrateV1toV2 } from './src/state/versioning/migrations'
import { uploadAsset } from './src/libs/assetUpload'
import { backgroundSearcher } from './src/libs/backgroundSearch'

const ASSETS_ENDPOINT =
  import.meta.env.VITE_ASSETS_ENDPOINT || 'http://localhost:8585/s3/assets'
const ASSETS_UPLOAD_ENDPOINT =
  import.meta.env.VITE_ASSETS_UPLOAD_URL || 'http://localhost:8585/s3/assets'
const CARD_ENDPOINT =
  import.meta.env.VITE_CARD_ENDPOINT || 'http://localhost:8585/s3/bots'
const CARD_ID =
  import.meta.env.VITE_CARD_ID ||
  'QmNTiMDQKh2ZhNzujupeGjWBFGC3WfcNHHNvDNXsC9rPBF.json'
const SERVICES_ENDPOINT =
  import.meta.env.VITE_SERVICES_ENDPOINT || 'http://localhost:8484'
const BACKGROUND_SEARCH_ENDPOINT =
  import.meta.env.VITE_BACKGROUND_SEARCH_ENDPOINT ||
  'http://localhost:8080/backgrounds'

function getCongurationFromParams(): {
  production: boolean
  disabled: boolean
  freeTTS: boolean
  freeSmart: boolean
  cardId: string
  narrationId: string
  backgroundSearchEndpoint: string
  assetsUploadEndpoint: string
  assetsEndpoint: string
  cardEndpoint: string
  servicesEndpoint: string
  settings: RootState['settings']
} {
  const queryParams = queryString.parse(window.location.search)
  const cardId = (queryParams.cardId || '') as string
  const narrationId = (queryParams.narrationId || '') as string
  const production = queryParams.production === 'true'
  const disabled = queryParams.disabled === 'true'
  const configuration = queryParams.configuration as string
  try {
    const configurationJson = JSON.parse(decodeText(configuration)) as {
      backgroundSearchEndpoint: string
      assetsUploadEndpoint: string
      assetsEndpoint: string
      cardEndpoint: string
      servicesEndpoint: string
      freeTTS: boolean
      freeSmart: boolean
      settings?: RootState['settings']
    }
    return {
      production,
      disabled,
      freeTTS: configurationJson.freeTTS || false,
      freeSmart: configurationJson.freeSmart || false,
      cardId: cardId || CARD_ID,
      narrationId,
      backgroundSearchEndpoint:
        configurationJson.backgroundSearchEndpoint ||
        BACKGROUND_SEARCH_ENDPOINT,
      assetsUploadEndpoint:
        configurationJson.assetsUploadEndpoint || ASSETS_UPLOAD_ENDPOINT,
      assetsEndpoint: configurationJson.assetsEndpoint || ASSETS_ENDPOINT,
      cardEndpoint: configurationJson.cardEndpoint || CARD_ENDPOINT,
      servicesEndpoint: configurationJson.servicesEndpoint || SERVICES_ENDPOINT,
      settings: mergeWith(
        mergeWith({}, initialSettingsState),
        configurationJson.settings || {}
      ),
    }
  } catch (e) {
    return {
      production,
      disabled,
      freeTTS: false,
      freeSmart: false,
      cardId: cardId || CARD_ID,
      narrationId,
      backgroundSearchEndpoint: BACKGROUND_SEARCH_ENDPOINT,
      assetsUploadEndpoint: ASSETS_UPLOAD_ENDPOINT,
      assetsEndpoint: ASSETS_ENDPOINT,
      cardEndpoint: CARD_ENDPOINT,
      servicesEndpoint: SERVICES_ENDPOINT,
      settings: initialSettingsState,
    }
  }
}

const params = getCongurationFromParams()

const narrationData: Promise<RootState> = new Promise((resolve) => {
  window.addEventListener('message', (event) => {
    const { type, payload } = event.data
    if (type === 'NARRATION_DATA') {
      resolve(payload as RootState)
    }
  })
})

export const loadNarration = async (): Promise<RootState> => {
  if (params.narrationId) {
    return narrationData.then((data) => {
      if (data.version !== VersionId) {
        if (data.version === 'v1') {
          return {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ...migrateV1toV2(data),
            creation: initialCreationState,
            settings: params.settings,
          }
        }
        toast.error('Narration version mismatch')
        throw 'Narration version mismatch'
      }
      return {
        ...data,
        creation: initialCreationState,
        settings: params.settings,
      }
    })
  } else {
    const { novel, narration } = await loadNovelFromSingleCard({
      cardId: params.cardId,
      cardEndpoint: params.cardEndpoint,
      assetsEndpoint: params.assetsEndpoint,
    })
    return {
      novel,
      narration,
      creation: initialCreationState,
      settings: initialSettingsState,
      version: VersionId,
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App
      isProduction={params.production}
      isInteractionDisabled={params.disabled}
      servicesEndpoint={params.servicesEndpoint}
      freeSmart={params.freeSmart}
      freeTTS={params.freeTTS}
      novelLoader={loadNarration}
      assetUploader={(base64String: string) =>
        uploadAsset(params.assetsUploadEndpoint, base64String)
      }
      assetLinkLoader={(asset: string, lowres?: boolean) => {
        if (lowres) {
          return `${params.assetsEndpoint}/480p_${asset}`
        }
        return `${params.assetsEndpoint}/${asset}`
      }}
      backgroundSearcher={(_params: {
        search: string
        take: number
        skip: number
      }) => backgroundSearcher(params.backgroundSearchEndpoint, _params)}
    />
  </React.StrictMode>
)
