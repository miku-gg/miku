import { Button, Tooltip } from '@mikugg/ui-kit'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  InventoryAction,
  InventoryItem,
  setInventoryVisibility,
  setItemModalVisibility,
  setSelectedItem,
} from '../../state/slices/inventorySlice'
import { FaTimes } from 'react-icons/fa'
import { inventoryItems } from '../../libs/inventoryItems'
import './Inventory.scss'
import { useAppContext } from '../../App.context'
import { interactionStart } from '../../state/slices/narrationSlice'
import {
  selectCurrentScene,
  selectLastLoadedResponse,
} from '../../state/selectors'
import { toast } from 'react-toastify'

export default function Inventory() {
  const dispatch = useAppDispatch()
  const { isPremium } = useAppSelector((state) => state.settings.user)
  const showInventory = useAppSelector((state) => state.inventory.showInventory)
  const selectedItem = useAppSelector((state) => state.inventory.selectedItem)
  const { servicesEndpoint, isInteractionDisabled } = useAppContext()
  const scene = useAppSelector(selectCurrentScene)
  const lastResponse = useAppSelector(selectLastLoadedResponse)

  return (
    <div className={`Inventory ${showInventory}`}>
      <div className="Inventory__header">
        <div>Inventory</div>

        <button
          onClick={() => {
            dispatch(setInventoryVisibility('closed'))
          }}
          className="Inventory__close-button"
        >
          <FaTimes className="Inventory__close-button-icon" size={20} />
        </button>
      </div>
      <div className="Inventory__content">
        <div className="Inventory__items scrollbar">
          {inventoryItems.map((item) => {
            const speed = 5
            const position = Math.max(item.name.length + 10, 20)
            const animationDuration = Math.max(item.name.length / speed, 3)
            const isSelectedItem = item.id === selectedItem?.id
            const disabled = !isPremium && item.isPremium

            return (
              <div
                key={item.id}
                className={`Inventory__item ${
                  isSelectedItem ? 'selected' : ''
                } ${disabled ? 'disabled' : ''}
                `}
                onClick={() => {
                  if (disabled) return
                  if (!isSelectedItem) {
                    dispatch(setItemModalVisibility('open'))
                    dispatch(setSelectedItem(item))
                  } else {
                    dispatch(setItemModalVisibility('closed'))

                    setTimeout(() => {
                      dispatch(setSelectedItem(null))
                    }, 150)
                  }
                }}
                data-tooltip-id={disabled ? 'premium-item-invetory' : undefined}
                data-tooltip-varaint="light"
                data-tooltip-content={
                  disabled ? 'This is a premium-only item' : undefined
                }
              >
                <img
                  className="Inventory__item-image"
                  src={`/images/${item.image}`}
                  alt={item.name}
                />
                <div
                  className={`Inventory__item-name ${
                    7 < item.name.length ? 'animated-item-name' : ''
                  }`}
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
            )
          })}
        </div>
        <Tooltip id="premium-item-invetory" place="right" />
        <InventoryItemModal
          item={selectedItem}
          onUse={(action) => {
            dispatch(setInventoryVisibility('closed'))

            if (isInteractionDisabled) {
              toast.warn('Please log in to interact.', {
                position: 'top-center',
                style: {
                  top: 10,
                },
              })
              return
            }
            dispatch(
              interactionStart({
                text: action.prompt,
                sceneId: scene?.id || '',
                characters: scene?.characters.map((r) => r.characterId) || [],
                servicesEndpoint,
                selectedCharacterId: lastResponse?.selectedCharacterId || '',
              })
            )
          }}
        />
      </div>
    </div>
  )
}

export const InventoryItemModal = ({
  item,
  onUse,
}: {
  item: InventoryItem | null
  onUse: (action: InventoryAction) => void
}) => {
  const showItemModal = useAppSelector((state) => state.inventory.showItemModal)

  return (
    <div className={`InventoryItemModal scrollbar ${showItemModal}`}>
      <div className="InventoryItemModal__content">
        <div className="InventoryItemModal__image">
          <img src={`/images/${item?.image}`} alt={item?.name} />
        </div>
      </div>
      <header className="InventoryItemModal__header">
        <div className="InventoryItemModal__name">{item?.name}</div>
        <div className="InventoryItemModal__description">
          {item?.description}
        </div>
      </header>
      <footer className="InventoryItemModal__footer">
        {item?.actions.map((action) => (
          <Button
            key={`item-action-${item.id}-${action.name}`}
            className="InventoryItemModal__button"
            theme="transparent"
            onClick={() => onUse(action)}
          >
            {action.name}
          </Button>
        ))}
      </footer>
    </div>
  )
}
