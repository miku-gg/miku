import { NovelV3 } from '@mikugg/bot-utils';

import { Modal } from '@mikugg/ui-kit';
import { getEmptyIndicator, setModalOpened, updateIndicator } from '../../state/slices/creationSlice';
import { addIndicatorToScene, updateIndicatorInScene } from '../../state/slices/novelSlice';
import { selectCurrentScene } from '../../state/selectors';
import IndicatorEditor from './IndicatorEditor';
import { addCreatedIndicatorId } from '../../state/slices/narrationSlice';
import { useAppDispatch } from '../../state/store';
import { useAppSelector } from '../../state/store';

export default function CreateIndicator() {
  const dispatch = useAppDispatch();
  const openIndicatorModal = useAppSelector((state) => state.creation.scene.indicator.opened);
  const indicatorToCreate = useAppSelector((state) => state.creation.scene.indicator.item);
  const currentScene = useAppSelector(selectCurrentScene);
  const isEditing = !!indicatorToCreate?.id;

  return (
    <Modal
      opened={openIndicatorModal}
      onCloseModal={() => dispatch(setModalOpened({ id: 'indicator', opened: false }))}
      className="IndicatorsDisplay__edit-modal"
      hideCloseButton={false}
    >
      {currentScene && (
        <IndicatorEditor
          onUpdate={(newIndicator: NovelV3.NovelIndicator) => {
            dispatch(updateIndicator(newIndicator));
          }}
          indicator={indicatorToCreate || getEmptyIndicator()}
          onSave={(newIndicator: NovelV3.NovelIndicator) => {
            if (isEditing) {
              dispatch(
                updateIndicatorInScene({
                  sceneId: currentScene.id,
                  indicator: newIndicator,
                }),
              );
            } else {
              dispatch(
                addIndicatorToScene({
                  sceneId: currentScene.id,
                  indicator: newIndicator,
                }),
              );
              dispatch(addCreatedIndicatorId(newIndicator.id));
            }
            dispatch(setModalOpened({ id: 'indicator', opened: false }));
          }}
          onCancel={() => dispatch(setModalOpened({ id: 'indicator', opened: false }))}
          isEditing={isEditing}
        />
      )}
    </Modal>
  );
}
