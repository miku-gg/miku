import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils'
import { Modal } from '@mikugg/ui-kit'
import { useEffect } from 'react'
import { useAppContext } from '../../App.context'
import { registerTrackSessionData } from '../../libs/analytics'
import { replaceState } from '../../state/slices/replaceState'
import { setName, setSystemPrompt } from '../../state/slices/settingsSlice'
import { RootState, useAppDispatch, useAppSelector } from '../../state/store'
import { Loader } from '../common/Loader'
import './NovelLoader.scss'

const NovelLoader = (): JSX.Element => {
  const { novelLoader, persona } = useAppContext()
  const novelFetching = useAppSelector((state) => !state.novel.starts.length)
  const dispatch = useAppDispatch()
  useEffect(() => {
    novelLoader().then((state: RootState) => {
      state.novel.characters.forEach((character) => {
        character.card.data.extensions.mikugg_v2.outfits.forEach((outfit) => {
          if (outfit.template === 'single-emotion') {
            outfit.template = 'base-emotions'
            const neutralImage = outfit.emotions.find(
              (emotion) => emotion.id === 'neutral'
            )?.sources.png
            outfit.emotions = EMOTION_GROUP_TEMPLATES[
              'base-emotions'
            ].emotionIds.map((emotionId) => {
              return {
                id: emotionId,
                sources: { png: neutralImage || '' },
              }
            })
          }
        })
      })
      dispatch(replaceState(state))
      if (persona?.name) {
        if (persona?.description) {
          dispatch(
            setSystemPrompt(
              `${persona.name} Description: ${persona.description}`
            )
          )
        }
        dispatch(setName(persona.name))
      }
      registerTrackSessionData({
        name: state.novel.title,
        isPremium: state.settings.user.isPremium,
        nsfw: state.settings.user.nsfw,
      })
    })
  }, [dispatch, novelLoader, persona?.name, persona?.description])

  return (
    <Modal opened={novelFetching}>
      <div className="NovelLoader">
        <div className="NovelLoader__text">Loading Novel</div>
        <div className="NovelLoader__loader">
          <Loader />
        </div>
      </div>
    </Modal>
  )
}

export default NovelLoader
