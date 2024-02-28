import { Modal } from '@mikugg/ui-kit'
import { Loader } from '../common/Loader'
import { RootState, useAppDispatch, useAppSelector } from '../../state/store'
import { useEffect } from 'react'
import { useAppContext } from '../../App.context'
import { replaceState } from '../../state/slices/replaceState'
import './NovelLoader.scss'

const NovelLoader = (): JSX.Element => {
  const { novelLoader } = useAppContext()
  const novelFetching = useAppSelector((state) => !!state.novel.author)
  const dispatch = useAppDispatch()
  useEffect(() => {
    novelLoader().then((state: RootState) => {
      dispatch(replaceState(state))
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
