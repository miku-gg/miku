import { NovelSellerInvetoryItem } from '@mikugg/bot-utils/dist/lib/novel/NovelV3'

export const getItemByActionPrompt = (query: string) => {
  return items.find((item) =>
    item.actions.some((action) => action.prompt === query)
  )
}

export const items: NovelSellerInvetoryItem[] = [
  {
    id: '1',
    name: 'Rose',
    description: 'A beautiful rose',
    image: 'RoseFlower.jpg',
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
        id: '1',
      },
      {
        name: 'Use',
        price: 10,
        prompt: '',
        id: '2',
      },
      {
        name: 'Throw',
        price: 10,
        prompt: '',
        id: '3',
      },
    ],
  },
  {
    id: '2',
    name: 'Stick',
    description: 'A strong stick',
    image: 'Stick.jpg',
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
        prompt: '*XXD*',
        id: '1',
      },
      {
        name: 'Use',
        price: 10,
        prompt: '*IZI*',
        id: '2',
      },
      {
        name: 'Throw',
        price: 150,
        prompt: '*surrender*',
        id: '3',
      },
    ],
  },
  {
    id: '3',
    name: 'Leather Whip',
    description: 'A leather whip',
    image: 'LeatherWhip.jpg',
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
        id: '1',
      },
      {
        name: 'Use',
        price: 10,
        prompt: '',
        id: '2',
      },
      {
        name: 'Throw',
        price: 150,
        prompt: '',
        id: '3',
      },
    ],
  },
]
