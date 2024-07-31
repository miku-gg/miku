import { Modal } from '@mikugg/ui-kit';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ModelType, setModel, setModelSelectorModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './ModelSelectorModal.scss';
import { useAppContext } from '../../App.context';

interface modelData {
  id: ModelType;
  name: string;
  description: string;
  cost: number;
  permission: string;
}

export default function ModelSelectorModal() {
  const [models, setModels] = useState<modelData[] | undefined>();
  const { servicesEndpoint } = useAppContext();
  const dispatch = useAppDispatch();
  const currentModel = useAppSelector((state) => state.settings.model);
  const { modelSelector: opened } = useAppSelector((state) => state.settings.modals);
  const user = useAppSelector((state) => state.settings.user);

  const getModels = async () => {
    try {
      const response = await fetch(`${servicesEndpoint}/text/models`);
      const data = await response.json();

      return data as modelData[];
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectModel = (model: ModelType) => {
    if (currentModel !== model) {
      dispatch(setModel(model));
      toast.success(`Model ${model} selected`);
    }
    dispatch(setModelSelectorModal(false));
  };

  useEffect(() => {
    if (user.isTester) {
      const models = getModels();
      if (models) {
        models.then((data) => {
          setModels(data);
        });
      }
    }
  }, [user.isTester]);

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
              className={`ModelSelectorModal__model ${currentModel === model.id ? 'selected' : ''}`}
              onClick={() => handleSelectModel(model.id)}
            >
              <div className="ModelSelectorModal__model-id">Type: {model.id}</div>
              <div className="ModelSelectorModal__model-name">Name: {model.name}</div>
              <div className="ModelSelectorModal__model-description">Description: {model.description}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
