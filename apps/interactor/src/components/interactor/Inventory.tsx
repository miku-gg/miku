import { useEffect } from 'react';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import { Button, Tooltip } from '@mikugg/ui-kit';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAppContext } from '../../App.context';
import { novelActionToStateAction } from '../../state/mutations';
import { selectConditionStatus, selectCurrentScene, selectLastLoadedResponse } from '../../state/selectors';
import { setInventoryVisibility, setItemModalVisibility, setSelectedItem } from '../../state/slices/inventorySlice';
import { interactionStart } from '../../state/slices/narrationSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './Inventory.scss';
import classNames from 'classnames';
import { GiLockedChest } from 'react-icons/gi';
import { useI18n } from '../../libs/i18n';

export default function Inventory() {
  const dispatch = useAppDispatch();
  const { isPremium } = useAppSelector((state) => state.settings.user);
  const { showInventory, selectedItem, items } = useAppSelector((state) => state.inventory);
  const currentScene = useAppSelector(selectCurrentScene);
  const { servicesEndpoint, isInteractionDisabled, apiEndpoint, assetLinkLoader, isProduction } = useAppContext();
  const scene = useAppSelector(selectCurrentScene);
  const lastResponse = useAppSelector(selectLastLoadedResponse);
  const { i18n } = useI18n();

  return (
    <div className={`Inventory ${showInventory}`}>
      <div className="Inventory__header">
        <div>{i18n('inventory')}</div>

        <button
          onClick={() => {
            dispatch(setInventoryVisibility('closed'));
          }}
          className="Inventory__close-button"
        >
          <FaTimes className="Inventory__close-button-icon" size={20} />
        </button>
      </div>
      <div className="Inventory__content">
        <div className="Inventory__items scrollbar">
          {items
            .filter((item) => isProduction || !item.isPremium)
            .map((item) => {
              const speed = 5;
              const position = Math.max(item.name.length + 10, 20);
              const animationDuration = Math.max(item.name.length / speed, 3);
              const isSelectedItem = item.id === selectedItem?.id;
              const isLocked = item.locked?.config.sceneIds.includes(currentScene?.id || '');
              const disabled = (!isPremium && item.isPremium) || (item.locked && !isLocked);
              const isHidden = item.hidden;
              return (
                <div
                  key={item.id}
                  className={classNames({
                    Inventory__item: true,
                    selected: isSelectedItem,
                    disabled: disabled,
                    hidden: isHidden,
                    highlighted: item.isNovelOnly && !disabled,
                  })}
                  onClick={() => {
                    if (disabled) return;
                    if (!isSelectedItem) {
                      dispatch(setItemModalVisibility('open'));
                      dispatch(setSelectedItem(item));
                    } else {
                      dispatch(setItemModalVisibility('closed'));

                      setTimeout(() => {
                        dispatch(setSelectedItem(null));
                      }, 150);
                    }
                  }}
                  data-tooltip-id={disabled ? 'premium-item-inventory' : undefined}
                  data-tooltip-varaint="light"
                  data-tooltip-content={disabled && item.isPremium ? i18n('this_is_a_premium_only_item') : undefined}
                >
                  <img
                    className="Inventory__item-image"
                    src={assetLinkLoader(item.icon || 'default_item.jpg', AssetDisplayPrefix.ITEM_IMAGE)}
                    alt={item.name}
                  />
                  <div
                    className={`Inventory__item-name ${7 < item.name.length ? 'animated-item-name' : ''}`}
                    style={
                      {
                        '--initial-text-position': `100%`,
                        '--ending-text-position': `${-position}ch`,
                        '--animation-duration': `${animationDuration}s`,
                      } as React.CSSProperties
                    }
                  >
                    {item.name}
                  </div>
                </div>
              );
            })}
        </div>
        <Tooltip id="premium-item-inventory" place="right" />
        <Tooltip id="item-name" place="top" />
        <InventoryItemModal
          item={selectedItem}
          onUse={(action) => {
            dispatch(setInventoryVisibility('closed'));

            if (isInteractionDisabled) {
              toast.warn(i18n('please_log_in_to_interact'), {
                position: 'top-center',
                style: {
                  top: 10,
                },
              });
              return;
            }
            if (action.prompt) {
              dispatch(
                interactionStart({
                  text: action.prompt,
                  sceneId: scene?.id || '',
                  isNewScene: false,
                  characters: scene?.characters.map((r) => r.characterId) || [],
                  apiEndpoint,
                  servicesEndpoint,
                  selectedCharacterId: lastResponse?.selectedCharacterId || '',
                }),
              );
            }
            if (action.usageActions) {
              action.usageActions.forEach((novelAction) => {
                const actions = novelActionToStateAction(novelAction);
                actions.forEach((action) => dispatch(action));
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export const InventoryItemModal = ({
  item,
  onUse,
}: {
  item: NovelV3.InventoryItem | null;
  onUse: (action: NovelV3.InventoryAction) => void;
}) => {
  const { assetLinkLoader } = useAppContext();
  const showItemModal = useAppSelector((state) => state.inventory.showItemModal);
  const state = useAppSelector((state) => state);

  const element = document.querySelector('.InventoryItemModal') as HTMLElement;

  useEffect(() => {
    element?.addEventListener('animationend', (event) => {
      if (event.animationName === 'slideClose') {
        element.classList.add('hidden-after-close');
      }
    });

    if (showItemModal === 'open') {
      element.classList.remove('hidden-after-close');
    }

    return () => {
      element?.removeEventListener('animationend', () => {});
    };
  }, [showItemModal]);

  return (
    <div className={`InventoryItemModal scrollbar ${showItemModal}`}>
      <div className="InventoryItemModal__content">
        <div className="InventoryItemModal__image">
          <img
            src={assetLinkLoader(item?.icon || 'default_item.jpg', AssetDisplayPrefix.ITEM_IMAGE)}
            alt={item?.name}
          />
        </div>
      </div>
      <header className="InventoryItemModal__header">
        <div
          className="InventoryItemModal__name"
          data-tooltip-id="item-name"
          data-tooltip-varaint="light"
          data-tooltip-content={item?.name}
        >
          {item?.name}
        </div>
        <div className="InventoryItemModal__description">{item?.description}</div>
      </header>
      <footer className="InventoryItemModal__footer">
        {item?.actions.map((action) => (
          <Button
            key={`item-action-${item.id}-${action.name}`}
            className="InventoryItemModal__button"
            theme="transparent"
            onClick={() => onUse(action)}
            disabled={action.usageCondition ? !selectConditionStatus(state, action.usageCondition) : false}
          >
            {action.name}
          </Button>
        ))}
      </footer>
    </div>
  );
};

export const InventoryTrigger = () => {
  const dispatch = useAppDispatch();
  const showInventory = useAppSelector((state) => state.inventory.showInventory);
  const { disabled: inputDisabled } = useAppSelector((state) => state.narration.input);
  return (
    <button
      className="InteractiveMap__toggle"
      disabled={inputDisabled}
      onClick={() => {
        dispatch(setInventoryVisibility(showInventory === 'initial' || showInventory === 'closed' ? 'open' : 'closed'));
      }}
    >
      <GiLockedChest />
    </button>
  );
};
