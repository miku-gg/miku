import { GiTwoCoins } from 'react-icons/gi'
import './Inventory.scss'
import { useEffect, useState } from 'react'
import { Button, Tooltip } from '@mikugg/ui-kit'
import { NovelSellerInvetoryItem } from '@mikugg/bot-utils/src/lib/novel/NovelV3'
import { useAppDispatch, useAppSelector } from '../../state/store'
import {
  setInventoryVisibility,
  setTriggeredAction,
} from '../../state/slices/inventorySlice'
import { FaTimes } from 'react-icons/fa'
import { NovelSellerInvetoryItemAction } from '@mikugg/bot-utils/dist/lib/novel/NovelV3'
import { items } from '../../libs/itemsData'

export default function Inventory() {
  const dispatch = useAppDispatch()
  const showInventory = useAppSelector((state) => state.inventory.showInventory)

  useEffect(() => {
    if (showInventory) {
      setSelectedItem(null)
    }
  }, [showInventory])

  const [selectedItem, setSelectedItem] =
    useState<NovelSellerInvetoryItem | null>(null)

  return (
    <div className={`Inventory ${showInventory}`}>
      <div className="Inventory__header">
        <div>Inventory</div>

        <button
          onClick={() => dispatch(setInventoryVisibility('closed'))}
          className="Inventory__close-button"
        >
          <FaTimes className="Inventory__close-button-icon" size={14} />
        </button>
      </div>
      <div className="Inventory__content">
        <div className="Inventory__items scrollbar">
          {items.map((item) => {
            const speed = 5
            const position = Math.max(item.name.length + 10, 20)
            const animationDuration = Math.max(item.name.length / speed, 3)

            return (
              <div
                key={item.id}
                className={`Inventory__item ${
                  item.name === selectedItem?.name ? 'selected' : ''
                }`}
                onClick={() =>
                  setSelectedItem(item.id === selectedItem?.id ? null : item)
                }
              >
                <img
                  className="Inventory__item-image"
                  src={`/src/assets/images/${item.image}`}
                  alt={item.name}
                />
                <div
                  className="Inventory__item-name"
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
        <InventoryItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUse={(action) => {
            dispatch(setInventoryVisibility('closed'))
            dispatch(
              setTriggeredAction({
                item: selectedItem,
                action: action,
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
  item: NovelSellerInvetoryItem | null
  onClose: () => void
  onUse: (action: NovelSellerInvetoryItemAction) => void
}) => {
  return (
    item && (
      <div className="InventoryItemModal">
        <div className="InventoryItemModal__content">
          <div className="InventoryItemModal__image">
            <img src={`/src/assets/images/${item.image}`} alt={item.name} />
          </div>
        </div>
        <Tooltip id="item-name-tooltip" place="top" />
        <header className="InventoryItemModal__header">
          <div
            className="InventoryItemModal__name"
            data-tooltip-id="item-name-tooltip"
            data-tooltip-varaint="light"
            data-tooltip-content={item.name}
          >
            {item.name}
          </div>
          <div className="InventoryItemModal__description">
            {item.description}
          </div>
        </header>
        <footer className="InventoryItemModal__footer">
          {item.actions.map((action) => (
            <Button
              key={action.id}
              className="InventoryItemModal__button"
              theme="secondary"
              onClick={() => onUse(action)}
            >
              {action.name} for {action.price} <GiTwoCoins />
            </Button>
          ))}
        </footer>
      </div>
    )
  )
}
