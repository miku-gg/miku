import { useEffect } from 'react';
import { Provider } from 'react-redux';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppProps, AppProvider } from './App.context';
import { store } from './state/store';

import Interactor from './components/interactor/Interactor';
import NovelLoader from './components/novel-loader/NovelLoader';

import 'normalize.css';
import './App.scss';

function App(props: AppProps) {
  const contextValue = {
    botId: props.botId,
    isProduction: props.isProduction,
    freeSmart: props.freeSmart,
    freeTTS: props.freeTTS,
    isMobileApp: props.isMobileApp,
    isInteractionDisabled: props.isInteractionDisabled,
    servicesEndpoint: props.servicesEndpoint,
    apiEndpoint: props.apiEndpoint,
    cardEndpoint: props.cardEndpoint,
    persona: props.persona,
    assetUploader: props.assetUploader,
    assetLinkLoader: props.assetLinkLoader,
    novelLoader: props.novelLoader,
    isPublishedDemo: props.isPublishedDemo,
  };

  useEffect(() => {
    if (props.isMobileApp) {
      document.body.classList.add('mobile-app');
    }
  }, []);

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
  );
}

export default App;
