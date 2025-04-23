import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';
import { Modal } from '@mikugg/ui-kit';
import { useEffect } from 'react';
import { useAppContext } from '../../App.context';
import { registerTrackSessionData } from '../../libs/analytics';
import { replaceState } from '../../state/slices/replaceState';
import { getVoiceItems, setName, setSystemPrompt } from '../../state/slices/settingsSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../state/store';
import { Loader } from '../common/Loader';
import { useI18n } from '../../libs/i18n';
import './NovelLoader.scss';

const NovelLoader = (): JSX.Element => {
  const { novelLoader, persona, isMobileApp } = useAppContext();
  const novelFetching = useAppSelector((state) => !state.novel.starts.length);
  const dispatch = useAppDispatch();
  const { i18n } = useI18n();

  useEffect(() => {
    novelLoader().then((state: RootState) => {
      state.novel.characters.forEach((character) => {
        character.card.data.extensions.mikugg_v2.outfits.forEach((outfit) => {
          if (outfit.template === 'single-emotion') {
            outfit.template = 'base-emotions';
            const neutralImage = outfit.emotions.find((emotion) => emotion.id === 'neutral')?.sources.png;
            outfit.emotions = EMOTION_GROUP_TEMPLATES['base-emotions'].emotionIds.map((emotionId) => {
              return {
                id: emotionId,
                sources: { png: neutralImage || '' },
              };
            });
          }
        });
      });
      const voicesItems = getVoiceItems(state.novel.language || 'en');
      state.settings.voice.voiceId =
        voicesItems.find((v) => v.value === state.settings.voice.voiceId)?.value || voicesItems[0].value;

      dispatch(replaceState(state));
      if (persona?.name) {
        if (persona?.description) {
          dispatch(setSystemPrompt(`${persona.name} Description: ${persona.description}`));
        }
        dispatch(setName(persona.name));
      }
      registerTrackSessionData({
        name: state.novel.title,
        isPremium: state.settings.user.isPremium,
        nsfw: state.settings.user.nsfw,
      });
    });
  }, [dispatch, novelLoader, persona?.name, persona?.description]);

  return (
    <Modal className={isMobileApp ? 'NovelLoaderModal' : ''} opened={novelFetching}>
      <div className="NovelLoader">
        <div className="NovelLoader__text">{i18n('loading_novel')}</div>
        <div className="NovelLoader__loader">
          <Loader />
        </div>
      </div>
    </Modal>
  );
};

export default NovelLoader;
