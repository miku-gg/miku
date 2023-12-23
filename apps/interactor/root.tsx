import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App'
import { loadNovelFromSingleCard } from './src/libs/loadNovel'
import './root.scss'
import { initialState as initialSettingsState } from './src/state/slices/settingsSlice'
import { RootState } from './src/state/store'
import { VersionId } from './src/state/versioning'
import { decodeText } from '@mikugg/bot-utils'
import queryString from 'query-string'
import mergeWith from 'lodash.mergewith'
import { toast } from 'react-toastify'

const ASSETS_ENDPOINT = 'https://assets.miku.gg'
const CARD_ENDPOINT = 'https://mikugg-configs-public.s3.us-east-2.amazonaws.com'
const CARD_ID = 'QmNTiMDQKh2ZhNzujupeGjWBFGC3WfcNHHNvDNXsC9rPBF.json'
const SERVICES_ENDPOINT = 'http://localhost:8484'

function getCongurationFromParams(): {
  production: boolean
  disabled: boolean
  cardId: string
  narrationId: string
  assetsEndpoint: string
  cardEndpoint: string
  servicesEndpoint: string
  settings: RootState['settings']
} {
  const params = queryString.parse(window.location.search)
  const cardId = (params.cardId || '') as string
  const narrationId = (params.narrationId || '') as string
  const production = params.production === 'true'
  const disabled = params.disabled === 'true'
  const configuration = params.configuration as string
  try {
    const configurationJson = JSON.parse(decodeText(configuration)) as {
      assetsEndpoint: string
      cardEndpoint: string
      servicesEndpoint: string
      settings?: RootState['settings']
    }
    return {
      production,
      disabled,
      cardId: cardId || CARD_ID,
      narrationId,
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
      cardId: cardId || CARD_ID,
      narrationId,
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
        toast.error('Narration version mismatch')
        throw 'Narration version mismatch'
      }
      return {
        ...data,
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
      novelLoader={loadNarration}
      assetLinkLoader={(asset: string, lowres?: boolean) => {
        if (lowres) {
          return `${params.assetsEndpoint}/480p_${asset}`
        }
        return `${params.assetsEndpoint}/${asset}`
      }}
    />
  </React.StrictMode>
)
