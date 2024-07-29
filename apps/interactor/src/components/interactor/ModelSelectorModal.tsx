import { Modal } from '@mikugg/ui-kit'
import { setModelSelectorModal } from '../../state/slices/settingsSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import './DebugModal.scss'

export default function ModelSelectorModal() {
  const dispatch = useAppDispatch()
  const { modelSelector: opened } = useAppSelector(
    (state) => state.settings.modals
  )

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(setModelSelectorModal(false))}
      shouldCloseOnOverlayClick
      hideCloseButton={false}
      title="Models"
      className="ModelSelectorModal__container"
    >
      <div className="ModelSelectorModal"></div>
    </Modal>
  )
}
