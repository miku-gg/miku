import { Modal } from '@mikugg/ui-kit'
import { useEffect } from 'react'
import { useAppContext } from '../../App.context'
import { replaceState } from '../../state/slices/replaceState'
import { setName, setSystemPrompt } from '../../state/slices/settingsSlice'
import { RootState, useAppDispatch, useAppSelector } from '../../state/store'
import { Loader } from '../common/Loader'
import './NovelLoader.scss'
import { registerTrackSessionData } from '../../libs/analytics'

const NovelLoader = (): JSX.Element => {
  const { novelLoader, persona } = useAppContext()
  const novelFetching = useAppSelector((state) => !state.novel.starts.length)
  const dispatch = useAppDispatch()
  useEffect(() => {
    novelLoader().then((state: RootState) => {
      dispatch(replaceState(state))
      if (persona && persona.description) {
        dispatch(
          setSystemPrompt(`${persona.name} Description: ${persona.description}`)
        )
        dispatch(setName(persona.name))
      }
      registerTrackSessionData({
        name: state.novel.title,
        isPremium: state.settings.user.isPremium,
        nsfw: state.settings.user.nsfw,
      })
    })
  }, [dispatch, novelLoader])

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
