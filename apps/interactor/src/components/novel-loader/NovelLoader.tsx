import { Modal } from '@mikugg/ui-kit'
import { Loader } from '../common/Loader'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { useEffect } from 'react'
import { setNovel } from '../../state/slices/novelSlice'
import { setNarration } from '../../state/slices/narrationSlice'
import './NovelLoader.scss'
import { useAppContext } from '../../App'

const NovelLoader = (): JSX.Element => {
  const { novelLoader } = useAppContext()
  const novelFetching = useAppSelector((state) => state.novel.fetching)
  const dispatch = useAppDispatch()
  useEffect(() => {
    novelLoader().then(({ novel, narration }) => {
      dispatch(setNovel(novel))
      dispatch(setNarration(narration))
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
