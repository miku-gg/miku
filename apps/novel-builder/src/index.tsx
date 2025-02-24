import { AreYouSure, Button } from '@mikugg/ui-kit';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackgroundEditModal from './modals/BackgroundEditModal';
import BackgroundSearchModal from './modals/BackgroundSearchModal';
import LoadingModal from './modals/LoadingModal';
import LorebookEditModal from './modals/LorebookEditModal';
import SongEditModal from './modals/SongEditModal';
import SongSearchModal from './modals/SongSearchModal';
import CharacterEditModal from './modals/character/CharacterEditModal';
import ActionEditModal from './modals/items/ActionEditModal';
import ItemEditModal from './modals/items/ItemEditModal';
import MapEditModal from './modals/map/MapEditModal';
import PlaceEditModal from './modals/map/PlaceEditModal';
import ObjectiveEditModal from './modals/scene/ObjectiveEditModal';
import SceneEditModal from './modals/scene/SceneEditModal';
import Planels from './panels';
import { store } from './state/store';
import './styles/main.scss';
import { GiBookPile } from 'react-icons/gi';
import CreditsWidget from './components/CreditsWidget';
import SpendApprovalModal from './modals/SpendApprovalModal';

const toastRoot = document.getElementById('toast-root');

export class ToastPortal extends React.PureComponent {
  render() {
    return ReactDOM.createPortal(
      // eslint-disable-next-line
      // @ts-ignore
      <ToastContainer theme="dark" position="bottom-left" />,
      toastRoot!,
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AreYouSure.AreYouSureProvider>
        <div className="app">
          <div className="app__header">
            <div className="app__header-logo">
              <img src="/logo.png" width={40} />
              Novel Builder
            </div>
            <div className="app__header-right">
              <CreditsWidget />
              <a href="https://docs.miku.gg/guides/novel-builder/1-get-started/" target="_blank" rel="noreferrer">
                <Button theme="transparent">
                  <GiBookPile size={24} />
                  Documentation
                </Button>
              </a>
            </div>
          </div>
          <Planels />
        </div>
        <SceneEditModal />
        <BackgroundEditModal />
        <BackgroundSearchModal />
        <SongEditModal />
        <SongSearchModal />
        <CharacterEditModal />
        <LorebookEditModal />
        <LoadingModal />
        <MapEditModal />
        <PlaceEditModal />
        <ObjectiveEditModal />
        <ItemEditModal />
        <ActionEditModal />
        <SpendApprovalModal />
      </AreYouSure.AreYouSureProvider>
      <ToastPortal />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
