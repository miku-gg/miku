import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { store } from './state/store'
import { NovelState } from './state/novelSlice'
import { NarrationState } from './state/narrationSlice'
import NovelLoader from './components/interactor/NovelLoader'
import 'react-toastify/dist/ReactToastify.css'
import './App.scss'
import 'normalize.css'
import Interactor from './components/interactor/Interactor'

export interface AppProps {
  // defaultSettings: any
  // onSettingsChange: (settings: any) => void
  // retriveAsset: (asset: string, size: number) => Promise<string>
  novelLoader: () => Promise<{
    novel: NovelState
    narration: NarrationState
  }>
  // assetLoader: (asset: string, lowres?: boolean) => Promise<string>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
}

function App(props: AppProps) {
  return (
    <Provider store={store}>
      <div className="App">
        {/* eslint-disable-next-line */}
        {/*@ts-ignore */}
        <ToastContainer theme="dark" position="bottom-right" />
        <Interactor assetLinkLoader={props.assetLinkLoader} />
        <NovelLoader retriveNovelAndNarration={props.novelLoader} />
      </div>
    </Provider>
  )
}

export default App
