import { InventoryItem } from '../state/slices/inventorySlice'

export const getItemByActionPrompt = (query: string) => {
  return inventoryItems.find((item) =>
    item.actions.some((action) => action.prompt === query)
  )
}

export const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Rose',
    description: 'A beautiful rose',
    image: 'RoseFlower.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '*{{user}} pull out a rose and give it to {{char}}*',
      },
      {
        name: 'Use',
        prompt: '*{{user}} use the rose*',
      },
      {
        name: 'Throw',
        prompt: '',
      },
    ],
  },
  {
    id: '2',
    name: 'Baseball Bat',
    description: 'A strong stick',
    image: 'BaseballBat.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '*XXD*',
      },
      {
        name: 'Use',
        prompt: '*IZI*',
      },
      {
        name: 'Throw',
        prompt: '*surrender*',
      },
    ],
  },
  {
    id: '3',
    name: 'Leather Whip',
    description: 'A leather whip',
    image: 'LeatherWhip.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '',
      },
      {
        name: 'Use',
        prompt: '',
      },
      {
        name: 'Throw',
        prompt: '',
      },
    ],
  },
  {
    id: '4',
    name: 'Picnic Basket',
    description: 'A leather whip',
    image: 'PicnicBasket.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '',
      },
      {
        name: 'Use',
        prompt: '',
      },
      {
        name: 'Throw',
        prompt: '',
      },
    ],
  },
]
