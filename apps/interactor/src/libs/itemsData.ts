import { NovelSellerInvetoryItem } from '@mikugg/bot-utils/dist/lib/novel/NovelV3'

export const getItemByActionPrompt = (query: string) => {
  return items.find((item) =>
    item.actions.some((action) => action.prompt === query)
  )
}

export const items: NovelSellerInvetoryItem[] = [
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
        prompt: '*XXD*',
        id: '17',
      },
      {
        name: 'Use',
        price: 10,
        prompt: '*IZI*',
        id: '18',
      },
      {
        name: 'Throw',
        price: 150,
        prompt: '*surrender*',
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