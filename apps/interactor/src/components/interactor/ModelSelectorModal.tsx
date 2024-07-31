import { Modal } from '@mikugg/ui-kit'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  ModelType,
  setModel,
  setModelSelectorModal,
} from '../../state/slices/settingsSlice'
import { useAppDispatch, useAppSelector } from '../../state/store'
import './ModelSelectorModal.scss'

interface modelData {
  id: ModelType
  name: string
  description: string
  cost: number
  permission: string
}

export default function ModelSelectorModal() {
  const [models, setModels] = useState<modelData[] | undefined>()
  const dispatch = useAppDispatch()
  const currentModel = useAppSelector((state) => state.settings.model)
  const { modelSelector: opened } = useAppSelector(
    (state) => state.settings.modals
  )
  const user = useAppSelector((state) => state.settings.user)

  const getModels = async () => {
    try {
      const response = await fetch('https://services.miku.gg/text/models')
      const data = await response.json()

      return data as modelData[]
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectModel = (model: ModelType) => {
    if (currentModel === model) {
      toast.error(`Model ${model} as already selected`)
      return
    }
    dispatch(setModel(model))
    toast.success(`Model ${model} selected`)
  }

  useEffect(() => {
    if (user.isTester) {
      const models = getModels()
      if (models) {
        models.then((data) => {
          setModels(data)
        })
      }
    }
  }, [])

  return (
    <Modal
      opened={opened}
      onCloseModal={() => dispatch(setModelSelectorModal(false))}
      shouldCloseOnOverlayClick
      hideCloseButton={false}
      title="Models"
      className="ModelSelectorModal__container"
    >
      <div className="ModelSelectorModal">
        {!models ? (
          <div>No models</div>
        ) : (
          models.map((model) => (
            <div
              key={model.id}
              className={`ModelSelectorModal__model ${
                currentModel === model.id ? 'selected' : ''
              }`}
              onClick={() => {
                handleSelectModel(model.id)
              }}
            >
              <div className="ModelSelectorModal__model-id">
                Type: {model.id}
              </div>
              <div className="ModelSelectorModal__model-name">
                Name: {model.name}
              </div>
              <div className="ModelSelectorModal__model-description">
                Description: {model.description}
              </div>
              <div className="ModelSelectorModal__model-cost">
                Cost: {model.cost} tokens
              </div>

              <div className="ModelSelectorModal__model-permission">
                Permission: {model.permission}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
