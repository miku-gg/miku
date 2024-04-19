import { GiTwoCoins } from 'react-icons/gi'
import './Inventory.scss'
import { useState } from 'react'
import { Button } from '@mikugg/ui-kit'
import { NovelSellerInvetoryItem } from '@mikugg/bot-utils/src/lib/novel/NovelV3'

export default function Inventory() {
  const items = [
    {
      name: 'Elixir Of Avarice',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      price: 1111110,
    },
    {
      name: 'Elixir Of Force',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      price: 12312395,
    },
    {
      name: 'The Brutalizer',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: 'The Brutalizer',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: '1',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: '12',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      price: 12312395,
    },
    {
      name: '123',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      price: 12312395,
    },
    {
      name: '12345',
      description: 'Restores 20 mana points',
      image: 'ElixirOfForce.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'mana',
        value: 20,
      },
      price: 12312395,
    },
    {
      name: '1234567',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: '1234567890',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: '123456789012345',
      description: 'Boosts strength by 5',
      image: 'TheBrutalizer.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'strength',
        value: 5,
      },
      price: 10,
    },
    {
      name: '12345678901234567890',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      price: 1111110,
    },
    {
      name: '1234567890123456789012345',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      price: 1111110,
    },
    {
      name: '123456789012345678901234567890',
      description: 'Heals 20 health points',
      image: 'ElixirOfAvarice.webp',
      permanent: false,
      quantity: 1,
      boost: {
        attribute: 'life',
        value: 20,
      },
      price: 1111110,
    },
  ]

  const [selectedItem, setSelectedItem] =
    useState<NovelSellerInvetoryItem | null>(null)

  return (
    <div className="Inventory">
      <div className="Inventory__header" onClick={() => setSelectedItem(null)}>
        <div>Inventory</div>
      </div>
      <div className="Inventory__content">
        <div className="Inventory__items">
          {items.map((item, index) => {
            const speed = 5
            const position = Math.max(item.name.length + 10, 20)
            const animationDuration = Math.max(item.name.length / speed, 3)

            console.log(
              'name: ',
              item.name,
              'position: ',
              position,
              'animationDuration: ',
              animationDuration
            )

            return (
              <div
                key={index}
                className={`Inventory__item ${
                  item.name === selectedItem?.name ? 'selected' : ''
                }`}
                onClick={() => setSelectedItem(item)}
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
                <div className="Inventory__item-price">
                  {item.price} <GiTwoCoins />
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
        <div className="InventoryItemModal__header">
          <div>{item?.name}</div>
          <div className="InventoryItemModal__price">
            {item?.price} <GiTwoCoins />
          </div>
        </div>
        <div className="InventoryItemModal__content">
          <div className="InventoryItemModal__image">
            <img src={`/images/${item?.image}`} alt={item?.name} />
          </div>
          <div className="InventoryItemModal__description">
            {item?.description}
          </div>
          <div className="InventoryItemModal__effect">
            {item?.boost.attribute}: {item?.boost.value}
          </div>
        </div>
        <div className="InventoryItemModal__footer">
          <Button
            className="InventoryItemModal__button"
            theme="secondary"
            onClick={onBuy}
          >
            Buy
          </Button>
        </div>
      </div>
    )
  )
}
