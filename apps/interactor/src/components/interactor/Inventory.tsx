import { GiTwoCoins } from 'react-icons/gi'
import './Inventory.scss'
import { useEffect, useState } from 'react'
import { Button, Tooltip } from '@mikugg/ui-kit'
import { NovelSellerInvetoryItem } from '@mikugg/bot-utils/src/lib/novel/NovelV3'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { setInventoryVisibility } from '../../state/slices/inventorySlice'
import { FaTimes } from 'react-icons/fa'

export default function Inventory() {
  const dispatch = useAppDispatch()
  const showInventory = useAppSelector((state) => state.inventory.showInventory)

  const items: NovelSellerInvetoryItem[] = [
    {
      id: '1',
      name: 'Elixir Of Avarice',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '19',
        },
        {
          name: 'Throw',
          price: 10,
          prompt: '',
          id: '20',
        },
      ],
    },
    {
      id: '2',
      name: "Rabadon's Deathcap",
      description: 'Restores 20 mana points',
      image: "Rabadon'sDeathcap.webp",
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '3',
      name: 'Rod of Ages',
      description: 'Boosts strength by 5',
      image: 'RodOfAges.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '4',
      name: 'The Brutalizer',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '5',
      name: '1',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '6',
      name: '12',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '7',
      name: '123',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '8',
      name: '12345',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '9',
      name: '1234567',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '10',
      name: '1234567890',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '11',
      name: '123456789012345',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '12',
      name: '12345678901234567890',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '13',
      name: '1234567890123456789012345',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '14',
      name: 'Phage',
      description: 'Heals 20 health points',
      image: 'Phage.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '15',
      name: 'Spirit Visage',
      description: 'Heals 20 health points',
      image: 'SpiritVisage.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '16',
      name: 'Lockets of the Iron Solari',
      description: 'Heals 20 health points',
      image: 'LocketOfTheIronSolari.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '17',
      name: 'Haunting Guise',
      description: 'Heals 20 health points',
      image: 'HauntingGuise.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
    {
      id: '18',
      name: '123456789012345678901234567890',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      actions: [
        {
          name: 'Give',
          price: 30,
          prompt: '',
          id: '17',
        },
        {
          name: 'Use',
          price: 10,
          prompt: '',
          id: '18',
        },
        {
          name: 'Throw',
          price: 150,
          prompt: '',
          id: '19',
        },
      ],
    },
  ]

  useEffect(() => {
    if (showInventory) {
      setSelectedItem(null)
    }
  }, [showInventory])

  const [selectedItem, setSelectedItem] =
    useState<NovelSellerInvetoryItem | null>(null)

  return (
    <div className={`Inventory ${!showInventory ? 'hidden' : ''}`}>
      <div className="Inventory__header">
        <div>Inventory</div>

        <button
          onClick={() => dispatch(setInventoryVisibility(false))}
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
                      '--animation-duration': `${animationDuration}s`, // Duration based on character count and reading speed
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
          onBuy={() => {
            console.log('buy', selectedItem)
            setSelectedItem(null)
          }}
        />
      </div>
    </div>
  )
}

export function InventoryItemModal({
  item,
  onClose,
  onBuy,
}: {
  item: NovelSellerInvetoryItem | null
  onClose: () => void
  onBuy: () => void
}) {
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
              onClick={onBuy}
            >
              {action.name} for {action.price} <GiTwoCoins />
            </Button>
          ))}
        </footer>
      </div>
    )
  )
}
