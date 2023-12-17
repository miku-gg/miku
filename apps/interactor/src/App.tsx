import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { store } from './state/store'
import { NovelState } from './state/novelSlice'
import { NarrationState } from './state/narrationSlice'
import NovelLoader from './components/interactor/NovelLoader'
import 'react-toastify/dist/ReactToastify.css'
import './App.scss'

export interface AppProps {
  // defaultSettings: any
  // onSettingsChange: (settings: any) => void
  // retriveAsset: (asset: string, size: number) => Promise<string>
  retriveNovelAndNarration: () => Promise<{
    novel: NovelState
    narration: NarrationState
  }>
}

function App(props: AppProps) {
  return (
    <Provider store={store}>
      <div className="App">
        {/* eslint-disable-next-line */}
        {/*@ts-ignore */}
        <ToastContainer theme="dark" position="bottom-right" />
        <div>
          <NovelLoader
            retriveNovelAndNarration={props.retriveNovelAndNarration}
          />
        </div>
      </div>
    </Provider>
  )
}

export default App
