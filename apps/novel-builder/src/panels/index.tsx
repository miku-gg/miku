import { AreYouSure } from '@mikugg/ui-kit';
import cloneDeep from 'lodash.clonedeep';
import { useEffect } from 'react';
import { BiCameraMovie, BiSolidSave } from 'react-icons/bi';
import { GiPathDistance } from 'react-icons/gi';
import { LuMonitorPlay, LuTextQuote } from 'react-icons/lu';
import { MdOutlinePermMedia, MdOutlineRestartAlt } from 'react-icons/md';
import { TbBoxMultiple } from 'react-icons/tb';
import { toast } from 'react-toastify';
import ButtonGroup from '../components/ButtonGroup';
import ErrorsDisplay from '../components/ErrorsDisplay';
import { TokenDisplayer } from '../components/TokenDisplayer';
import { TOKEN_LIMITS } from '../data/tokenLimits';
import { allowUntilStep, downloadNovelState } from '../libs/utils';
import { selectTotalTokenCount } from '../state/selectors';
import { closeModal, isPanelType, navigatePage, navigatePanel, openModal } from '../state/slices/inputSlice';
import { clearNovelState } from '../state/slices/novelFormSlice';
import { useAppDispatch, useAppSelector } from '../state/store';
import HomePanel from './HomePanel';
import './PanelExplorer.scss';
import AssetsPanel from './assets/AssetsPanel';
import DetailsPanel from './details/DetailsPanel';
import { MapList } from './maps/MapList';
import PreviewPanel from './preview/PreviewPanel';
import SceneGraph from './scenes/SceneGraph';
import StartsPanel from './starts/StartsPanel';
import NovelAssistant from '../components/novel-assistant/NovelAssistant';

function PanelExplorer() {
  const novel = useAppSelector((state) => state.novel);
  const selectedPanel = useAppSelector((state) => state.input.navigation.panel);
  const dispatch = useAppDispatch();
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();

  useEffect(() => {
    if (!window.onbeforeunload && novel) {
      window.onbeforeunload = () => true;
    }
  }, [novel]);

  const maxStep = allowUntilStep(novel);
  return (
    <div className="PanelExplorer">
      <NovelAssistant />
      <div className="PanelExplorer__header">
        <div className="PanelExplorer__header-left">
          <ButtonGroup
            buttons={[
              {
                content: (
                  <>
                    <LuTextQuote /> <span>Details</span>
                  </>
                ),
                value: 'details',
              },
              {
                content: (
                  <>
                    <MdOutlinePermMedia /> <span>Assets</span>
                  </>
                ),
                value: 'assets',
              },
              {
                content: (
                  <>
                    <BiCameraMovie /> <span>Scenes</span>
                  </>
                ),
                value: 'scenes',
                disabled: maxStep < 1,
                tooltip: maxStep < 1 ? 'Please add at least one asset for each' : '',
              },
              {
                content: (
                  <>
                    <GiPathDistance />
                    <span>Maps</span>
                  </>
                ),
                value: 'maps',
                disabled: maxStep < 2,
                tooltip: maxStep < 2 ? 'Please add a scene' : '',
              },
              {
                content: (
                  <>
                    <TbBoxMultiple /> <span>Starts</span>
                  </>
                ),
                value: 'starts',
                disabled: maxStep < 2,
                tooltip: maxStep < 2 ? 'Please add a scene' : '',
              },
              {
                content: (
                  <>
                    <LuMonitorPlay /> <span>Preview</span>
                  </>
                ),
                value: 'preview',
                disabled: maxStep < 3,
                tooltip: maxStep < 3 ? 'Please add a start' : '',
              },
            ]}
            selected={selectedPanel}
            onButtonClick={async (value) => {
              if (isPanelType(value)) {
                dispatch(navigatePanel(value));
              }
            }}
          />
          <div className="PanelExplorer__header-left__tokens">
            <ErrorsDisplay />
            <TokenDisplayer tokens={useAppSelector(selectTotalTokenCount)} limits={TOKEN_LIMITS.TOTAL} size="large" />
          </div>
        </div>
        <ButtonGroup
          buttons={[
            {
              content: (
                <>
                  <MdOutlineRestartAlt /> <span>Restart</span>
                </>
              ),
              value: 'restart',
            },
            {
              content: (
                <>
                  <BiSolidSave /> <span>Save</span>
                </>
              ),
              value: 'save',
            },
          ]}
          selected={selectedPanel}
          onButtonClick={async (value) => {
            if (value === 'save') {
              try {
                await downloadNovelState(cloneDeep(novel), false, (text: string) => {
                  dispatch(
                    openModal({
                      modalType: 'loading',
                      text,
                    }),
                  );
                });
              } catch (e) {
                console.error(e);
                toast.error('Failed to save novel');
              }
              dispatch(closeModal({ modalType: 'loading' }));
            } else if (value === 'restart') {
              openAreYouSure({
                title: 'Are you sure you want to restart?',
                description: 'This will delete your current progress.',
                onYes: () => {
                  dispatch(clearNovelState());
                  dispatch(navigatePage('homepage'));
                },
              });
            }
          }}
        />
      </div>
      <div className="PanelExplorer__content">
        {selectedPanel === 'details' ? <DetailsPanel /> : null}
        {selectedPanel === 'assets' ? <AssetsPanel /> : null}
        {selectedPanel === 'scenes' ? <SceneGraph /> : null}
        {selectedPanel === 'maps' ? <MapList /> : null}
        {selectedPanel === 'starts' ? <StartsPanel /> : null}
        {selectedPanel === 'preview' ? <PreviewPanel /> : null}
      </div>
    </div>
  );
}

export default function App() {
  const page = useAppSelector((state) => state.input.navigation.page);
  return page === 'homepage' ? <HomePanel /> : <PanelExplorer />;
}
