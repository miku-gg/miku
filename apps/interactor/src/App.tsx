import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { store } from './state/store'
import NovelLoader from './components/novel-loader/NovelLoader'
import Interactor from './components/interactor/Interactor'
import 'normalize.css'
import 'react-toastify/dist/ReactToastify.css'
import './App.scss'
import { AppProvider, AppProps } from './App.context'

function App(props: AppProps) {
  const contextValue = {
    isProduction: props.isProduction,
    assetLinkLoader: props.assetLinkLoader,
    novelLoader: props.novelLoader,
  }

  return (
    <Provider store={store}>
      <AppProvider value={contextValue}>
        <div className="App">
          {/* eslint-disable-next-line */}
          {/*@ts-ignore */}
          <ToastContainer theme="dark" position="bottom-right" />
          <Interactor />
          <NovelLoader />
        </div>
      </AppProvider>
    </Provider>
  )
}

export default App
