import { Button, Modal } from '@mikugg/ui-kit'
import { useAppContext } from '../../App.context'
import { fillTextTemplate } from '../../libs/prompts/strategies'
import { selectAvailableScenes } from '../../state/selectors'
import { useAppSelector } from '../../state/store'
import './SceneChangeModal.scss'

interface SceneChangeModalProps {
  onCancel?: () => void
  onConfirm: () => void
  isModalOpen: boolean
  onCloseModal: () => void
  nextSceneId: string
}

export const SceneChangeModal = ({
  onCancel,
  onConfirm,
  isModalOpen,
  onCloseModal,
  nextSceneId,
}: SceneChangeModalProps) => {
  const { assetLinkLoader, persona } = useAppContext()
  const scene = useAppSelector(selectAvailableScenes).find(
    (s) => s.id === nextSceneId
  )
  const currentCharacterName = useAppSelector(
    (state) =>
      state.novel.characters.find(
        (c) => c.id === scene?.characters[0].characterId
      )?.name
  )
  const backgrounds = useAppSelector((state) => state.novel.backgrounds)
  const handleCloseModal = () => {
    onCancel && onCancel()
    onCloseModal()
  }
  const handleConfirm = () => {
    onConfirm()
    onCloseModal()
  }

  const prompt = fillTextTemplate(scene?.prompt || '', {
    user: persona.name,
    bot: currentCharacterName || '{{Char}}',
  })

  return (
    <Modal
      className="SceneChangeModal"
      opened={isModalOpen}
      onCloseModal={() => handleCloseModal()}
      title="You should go to scene:"
    >
      <div
        className="SceneChangeModal__content"
        style={{
          backgroundImage: `url(${assetLinkLoader(
            backgrounds.find((b) => b.id === scene?.backgroundId)?.source.jpg ||
              '',
            true
          )})`,
        }}
      >
        <h2 className="SceneChangeModal__title">
          '{scene?.name || 'NextScene'}'
        </h2>
        <p className="SceneChangeModal__prompt">{prompt}</p>
        <div className="SceneChangeModal__buttons">
          <Button theme="primary" onClick={() => handleCloseModal()}>
            Cancel
          </Button>
          <Button theme="gradient" onClick={() => handleConfirm()}>
            Go to Scene
          </Button>
        </div>
      </div>
    </Modal>
  )
}
