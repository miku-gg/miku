import { AreYouSure, Button, Input, Modal, Tooltip } from '@mikugg/ui-kit';

import { useDispatch } from 'react-redux';
import { selectEditingAction, selectEditingInventoryItem } from '../../state/selectors';
import { closeModal } from '../../state/slices/inputSlice';
import { updateInventoryItem } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { NovelV3 } from '@mikugg/bot-utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import NovelActionForm from '../scene/NovelActionForm';
import './ActionEditModal.scss';

export default function ActionEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const item = useAppSelector(selectEditingInventoryItem);
  const action = useAppSelector(selectEditingAction);
  const [prevActionsLength, setPrevActionsLength] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRemoveAction = (id: string) => {
    if (!item) return;
    const newActions = item.actions.filter((action) => action.id !== id);
    dispatch(
      updateInventoryItem({
        ...item,
        actions: newActions,
      }),
    );
  };

  const handleUpdateAction = (actionId: string, action: {}) => {
    if (!item) return;
    const newActions = item.actions.map((a) => (a.id === actionId ? { ...a, ...action } : a));

    dispatch(
      updateInventoryItem({
        ...item,
        actions: newActions,
      }),
    );
  };

  const handleDelete = (id: string) => {
    areYouSure.openModal({
      title: 'Are you sure?',
      description: 'This Item will be deleted. This action cannot be undone.',
      onYes: () => {
        handleRemoveAction(id);
        dispatch(closeModal({ modalType: 'actionEdit' }));
      },
    });
  };

  const handleScrollToTop = useCallback(() => {
    if (containerRef.current) {
      if (action?.usageActions && action?.usageActions?.length > prevActionsLength) {
        scrollToTop();
        setPrevActionsLength(action?.usageActions.length);
      } else {
        setPrevActionsLength(action?.usageActions?.length || 0);
      }
    }
  }, [action?.usageActions]);

  useEffect(() => {
    handleScrollToTop();
  }, [handleScrollToTop]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: -containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Modal
      opened={!!action}
      shouldCloseOnOverlayClick
      className="actionEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'actionEdit' }))}
    >
      {action ? (
        <div className="ActionEdit">
          <div className="ActionEdit__buttons">
            <FaTrashAlt
              className="ActionEdit__buttons__remove"
              onClick={() => {
                handleDelete(action.id!);
              }}
            />
            <IoIosCloseCircleOutline
              className="ActionEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: 'actionEdit' }));
              }}
            />
          </div>

          <div className="ActionEdit__form">
            <Input
              label="Action Name"
              placeHolder="E.g. Give"
              value={action.name}
              onChange={(e) =>
                handleUpdateAction(action.id || '', {
                  name: e.target.value,
                })
              }
            />
            <Input
              isTextArea
              label="Prompt"
              placeHolder="E.g. *I pull out a rose flower and hand it over to {{char}}*"
              value={action.prompt}
              onChange={(e) =>
                handleUpdateAction(action.id || '', {
                  prompt: e.target.value,
                })
              }
            />
          </div>
          <div className="ActionEdit__mutation">
            <div className="ActionEdit__mutation__title">
              <h3>Usage Actions</h3>
              <IoInformationCircleOutline
                data-tooltip-id="Info-action-usage"
                className="ObjectiveEdit__header__title__infoIcon"
                data-tooltip-content="[OPTIONAL] The usage action trigger a mutation in the novel"
              />
            </div>
            <Button
              theme="primary"
              onClick={() => {
                handleUpdateAction(action.id || '', {
                  usageActions: [
                    ...(action.usageActions || []),
                    {
                      type: NovelV3.NovelActionType.SHOW_ITEM,
                      params: { itemId: '' },
                    },
                  ],
                });
              }}
            >
              Add usage action
            </Button>
            <Tooltip id="Info-action-usage" place="top" />
          </div>
          {action.usageActions && action.usageActions.length > 0 ? (
            <div className="ActionEdit__mutationList scrollbar" ref={containerRef}>
              {action.usageActions.map((act, index) => (
                <div key={`${act.type}-${index + 1}`} className="ActionEdit__mutationList__usageAction">
                  <FaTrashAlt
                    className="ActionEdit__mutationList__usageAction__remove"
                    onClick={() => {
                      handleUpdateAction(action.id || '', {
                        usageActions: action.usageActions?.filter((_, i) => i !== index),
                      });
                    }}
                  />
                  <NovelActionForm
                    action={act}
                    onChange={(act) => {
                      handleUpdateAction(action.id || '', {
                        usageActions: [
                          ...action.usageActions!.slice(0, index),
                          act,
                          ...action.usageActions!.slice(index + 1),
                        ],
                      });
                    }}
                    onDelete={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
