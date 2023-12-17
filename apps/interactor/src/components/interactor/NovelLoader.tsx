import { Modal } from '@mikugg/ui-kit'
import { Loader } from '../common/Loader'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { useEffect } from 'react'
import { NovelState, setNovel } from '../../state/novelSlice'
import { NarrationState, setNarration } from '../../state/narrationSlice'
import './NovelLoader.scss'

const NovelLoader = ({
  retriveNovelAndNarration,
}: {
  retriveNovelAndNarration: () => Promise<{
    novel: NovelState
    narration: NarrationState
  }>
}): JSX.Element => {
  const novelFetching = useAppSelector((state) => state.novel.fetching)
  const dispatch = useAppDispatch()
  useEffect(() => {
    retriveNovelAndNarration().then(({ novel, narration }) => {
      dispatch(setNovel(novel))
      dispatch(setNarration(narration))
    })
  }, [dispatch, retriveNovelAndNarration])

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
