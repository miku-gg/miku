import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App'
import { loadNovelFromSingleCard } from './src/libs/loadNovel'
import './root.scss'

const ASSETS_ENDPOINT = 'https://assets.miku.gg'
const CARD_ENDPOINT = 'https://mikugg-configs-public.s3.us-east-2.amazonaws.com'
const CARD_ID = 'QmazP5PBizTwGkUDr4snayYkuczwVXXAH4zMQ1m6KDGABZ.json'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App
      novelLoader={() =>
        loadNovelFromSingleCard({
          cardId: CARD_ID,
          cardEndpoint: CARD_ENDPOINT,
          assetsEndpoint: ASSETS_ENDPOINT,
        })
      }
      assetLinkLoader={(asset: string, lowres?: boolean) => {
        if (lowres) {
          return `https://assets.miku.gg/480p_${asset}`
        }
        return `https://assets.miku.gg/${asset}`
      }}
    />
  </React.StrictMode>
)
