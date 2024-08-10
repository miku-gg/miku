import { NovelValidationTargetType, validateNovelState } from '@mikugg/bot-utils';
import { Modal } from '@mikugg/ui-kit';
import classNames from 'classnames';
import { BiError } from 'react-icons/bi';
import { allowUntilStep } from '../libs/utils';
import { closeModal, openModal } from '../state/slices/inputSlice';
import { useAppDispatch, useAppSelector } from '../state/store';
import './ErrorsDisplay.scss';

export default function ErrorsDisplay() {
  const dispatch = useAppDispatch();
  const { opened } = useAppSelector((state) => state.input.modals.errors);
  const novel = useAppSelector((state) => state.novel);
  const maxStep = allowUntilStep(novel);
  const targetTypes = (function () {
    switch (maxStep) {
      case 3:
      case 2:
        return [
          NovelValidationTargetType.DESC,
          NovelValidationTargetType.MAP,
          NovelValidationTargetType.SCENE,
          NovelValidationTargetType.START,
          NovelValidationTargetType.BACKGROUND,
          NovelValidationTargetType.CHARACTER,
          NovelValidationTargetType.OUTFIT,
          NovelValidationTargetType.SONG,
          NovelValidationTargetType.OBJETIVES,
          NovelValidationTargetType.INVENTORY,
        ];
      case 1:
        return [
          NovelValidationTargetType.DESC,
          NovelValidationTargetType.BACKGROUND,
          NovelValidationTargetType.CHARACTER,
          NovelValidationTargetType.OUTFIT,
          NovelValidationTargetType.SONG,
          NovelValidationTargetType.SCENE,
          NovelValidationTargetType.INVENTORY,
        ];
      case 0:
        return [
          NovelValidationTargetType.DESC,
          NovelValidationTargetType.BACKGROUND,
          NovelValidationTargetType.CHARACTER,
          NovelValidationTargetType.OUTFIT,
          NovelValidationTargetType.SONG,
          NovelValidationTargetType.INVENTORY,
        ];
    }
    return [];
  })();

  const warns = validateNovelState(novel).filter((error) => targetTypes.includes(error.targetType));
  const errorCount = warns.filter((warn) => warn.severity === 'error').length;

  const classes = {
    ErrorsDisplay: true,
    'ErrorsDisplay--has-warns': warns.length > 0,
    'ErrorsDisplay--has-errors': errorCount > 0,
  };

  return (
    <div className={classNames(classes)}>
      <div className="ErrorsDisplay__trigger">
        <button
          className="ErrorsDisplay__button ButtonGroup__button"
          onClick={() =>
            dispatch(
              openModal({
                modalType: 'errors',
              }),
            )
          }
        >
          <BiError /> {errorCount ? errorCount : warns.length} {errorCount ? 'errors' : 'warns'}
        </button>
      </div>
      <Modal
        opened={opened}
        onCloseModal={() =>
          dispatch(
            closeModal({
              modalType: 'errors',
            }),
          )
        }
        title="Warnings"
      >
        <div className="ErrorsDisplay__content">
          <div className="ErrorsDisplay__content-body">
            {warns.map((warn, index) => (
              <div
                key={`${warn.message}-${index}`}
                className={classNames({
                  'ErrorsDisplay__content-item': true,
                  'ErrorsDisplay__content-item--error': warn.severity === 'error',
                })}
              >
                <BiError /> <span className="ErrorsDisplay__content-item-text scrollbar">{warn.message}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
