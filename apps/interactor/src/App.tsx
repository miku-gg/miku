import { createContext, useContext } from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { store } from './state/store'
import { NovelState } from './state/novelSlice'
import { NarrationState } from './state/narrationSlice'
import NovelLoader from './components/novel-loader/NovelLoader'
import Interactor from './components/interactor/Interactor'
import 'normalize.css'
import 'react-toastify/dist/ReactToastify.css'
import './App.scss'

export interface AppProps {
  novelLoader: () => Promise<{
    novel: NovelState
    narration: NarrationState
  }>
  assetLinkLoader: (asset: string, lowres?: boolean) => string
}

const AppContext = createContext<AppProps>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  assetLinkLoader: (_asset: string, _lowres?: boolean) => '',
  novelLoader: () =>
    Promise.resolve({
      novel: {} as NovelState,
      narration: {} as NarrationState,
    }),
})

export const useAppContext = () => useContext(AppContext)

function App(props: AppProps) {
  const contextValue = {
    assetLinkLoader: props.assetLinkLoader,
    novelLoader: props.novelLoader,
  }

  return (
    <Provider store={store}>
      <AppContext.Provider value={contextValue}>
        <div className="App">
          {/* eslint-disable-next-line */}
          {/*@ts-ignore */}
          <ToastContainer theme="dark" position="bottom-right" />
          <Interactor />
          <NovelLoader />
        </div>
      </AppContext.Provider>
    </Provider>
  )
}

export default App
