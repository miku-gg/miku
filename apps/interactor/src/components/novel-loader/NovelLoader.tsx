import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';
import { Modal } from '@mikugg/ui-kit';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../App.context';
import { registerTrackSessionData } from '../../libs/analytics';
import { replaceState } from '../../state/slices/replaceState';
import { setName, setSystemPrompt } from '../../state/slices/settingsSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../state/store';
import { NovelNSFW } from '../../state/versioning';
import { Loader } from '../common/Loader';
import './NovelLoader.scss';
import { start } from 'repl';

const NovelLoader = (): JSX.Element => {
  const { novelLoader, persona, isMobileApp } = useAppContext();
  const [completelyNSFW, setCompletelyNSFW] = useState(false);
  const novelFetching = useAppSelector((state) => !state.novel.starts.length);
  const dispatch = useAppDispatch();

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
      console.log('previous state: ', state);

      if (state.settings.user.nsfw === NovelNSFW.NONE) {
        let starts = state.novel.starts;
        starts = starts.filter((start) => {
          return state.novel.scenes.find((scene) => scene.id === start.sceneId)?.nsfw === NovelNSFW.NONE;
        })
        state.novel.scenes = state.novel.scenes.filter((scene) => scene.nsfw === NovelNSFW.NONE);
        state.novel.characters = state.novel.characters.filter((character) => character.nsfw === NovelNSFW.NONE);
        const sceneIds = state.novel.scenes.map((scene) => scene.id);
        state.novel.starts = state.novel.starts.filter((start) => sceneIds.includes(start.sceneId));
        const interactionSceneIds = Object.values(state.narration.interactions).map((interaction) => {
          return interaction ? interaction.sceneId : '';
        });
        //remove all interactions that are not in the sceneIds
        Object.keys(state.narration.interactions).forEach((key) => {
          if (!sceneIds.includes(key) && !interactionSceneIds.includes(key)) {
            delete state.narration.interactions[key];
          }
        });

        const interactionResponseIds = Object.values(state.narration.interactions)
          .map((interaction) => {
            return interaction ? interaction.responsesId : null;
          })
          .flat()
          .filter((responseId) => responseId !== null);

        if (interactionResponseIds.length > 0) {
          Object.keys(state.narration.responses).forEach((key) => {
            if (!interactionResponseIds.includes(key)) {
              delete state.narration.responses[key];
            }
          });
        } else {
          Object.values(state.narration.responses).forEach((response) => {
            if (response && response.parentInteractionId === null) {
              if (!state.novel.starts.map((start) => start.id).includes(response.id)) {
                delete state.narration.responses[response.id];
              }
            }
          });
          state.narration.currentResponseId = state.novel.starts[0].id;
        }

        if (starts.length === 0 || state.novel.scenes.length === 0 || state.novel.characters.length === 0) {
          setCompletelyNSFW(true);
          return new Error('This novel is NSFW.');
        }
      }
      console.log('Modified state: ', state);

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
        <div className="NovelLoader__text">{completelyNSFW ? 'This novel is NSFW.' : 'Loading Novel'}</div>
        <div className="NovelLoader__loader">{!completelyNSFW && <Loader />}</div>
      </div>
    </Modal>
  );
};

export default NovelLoader;
