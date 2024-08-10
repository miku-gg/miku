import { NovelV3 } from '@mikugg/bot-utils';

export const getItemByActionPrompt = (inventoryItems: NovelV3.InventoryItem[], query: string) => {
  return inventoryItems.find((item) => item.actions?.some((action) => action.prompt === query));
};

export const DEFAULT_INVENTORY: NovelV3.InventoryItem[] = [
  {
    id: '1',
    name: 'Rose',
    description: 'A beautiful rose',
    icon: 'RoseFlower.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '*I pull out a rose flower and hand it over to {{char}}*',
      },
      {
        name: 'Eat',
        prompt: '*I pull out a rose flower and start to eat it.*',
      },
      {
        name: 'Throw',
        prompt: "*I pull out a rose flower and throw it at {{char}}'s face*",
      },
    ],
  },
  {
    id: '2',
    name: 'Stick',
    description: 'A wood stick',
    icon: 'stick.jpg',
    actions: [
      {
        name: 'Give',
        prompt: '*I open my bag and pull out a stick. I give the stick to {{char}}.*',
      },
      {
        name: 'Bonk',
        prompt: '*I pull out a stick and bonk {{char}} on the head.*',
      },
      {
        name: 'Poke',
        prompt: "*I pull out a stick and poke {{char}}'s cheeks with it.*",
      },
    ],
  },
  {
    id: '3',
    name: 'Vodka',
    description: 'A bottle of vodka',
    icon: 'vodka.jpg',
    actions: [
      {
        name: 'Drink',
        prompt: '*I open a bottle of vodka and start drinking it.*',
      },
      {
        name: 'Give',
        prompt: '*I pull out a bottle of vodka and give it to {{char}}.*',
      },
      {
        name: 'Throw',
        prompt: '*I grab a bottle of vodka and throw it at {{char}}.*',
      },
    ],
  },
  {
    id: '4',
    name: 'Mate',
    description: 'A cup of mate',
    icon: 'mate.jpg',
    actions: [
      {
        name: 'Prepare',
        prompt:
          "*I take a mate cup and start preparing argentine mate.* OOC: Mate is a traditional argentine drink with green herbs and hot water. It's super hot and you need to suck on a metal straw to drink it. It sometimes sexy how people drink it.*",
      },
      {
        name: 'Give',
        prompt:
          "*I pull out the mate cup and give it to {{char}} to try.* OOC: Mate is a traditional argentine drink with green herbs and hot water. It's super hot and you need to suck on a metal straw to drink it. It sometimes sexy how people drink it.*",
      },
      {
        name: 'Sip',
        prompt:
          "*I take a sip of an argentine mate. It burns my tongue, but I continue to suck on the metal straw.* OOC: Mate is a traditional argentine drink with green herbs and hot water. It's super hot and you need to suck on a metal straw to drink it. It sometimes sexy how people drink it.",
      },
    ],
  },
  {
    id: '5',
    name: 'Teddy bear',
    description: 'A cute teddy bear',
    icon: 'teddy.jpg',
    isPremium: true,
    actions: [
      {
        name: 'Give',
        prompt: '*I pull out a teddy bear and give it to {{char}}.*',
      },
      {
        name: 'Evil Teddy',
        prompt:
          '*Suddeny, the place turns dark and a possesed teddy bear appears in the corner with a knife. He looks very angry.* OOC: Describe the teddy bear appearing.',
      },
      {
        name: 'Destroy',
        prompt: '*I pull out a teddy bear and start to rip it apart. Stuffing flies everywhere.*',
      },
    ],
  },
];
