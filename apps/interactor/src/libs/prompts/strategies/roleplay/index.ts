import {
  AbstractRoleplayStrategy,
  RoleplayStrategyAlpaca,
  RoleplayStrategyMetharme,
  RoleplayStrategyLlama3,
  RoleplayStrategyVicuna,
  RoleplayStrategyChatML,
  RoleplayStrategyMistral,
  RoleplayStrategyLyra,
} from '..';

export const roleplayStrategySlugs = [
  'alpacarp',
  'metharmerp',
  'mistralrp',
  'vicunarp',
  'llama3rp',
  'chatmlrp',
  'lyrarp',
] as const;
export type RoleplayStrategySlug = (typeof roleplayStrategySlugs)[number];
export function isOfTypeStrategySlug(slug: string | undefined): slug is RoleplayStrategySlug {
  return typeof slug === typeof undefined ? false : (roleplayStrategySlugs as readonly string[]).includes(slug!);
}

export const getRoleplayStrategyFromSlug = (
  slug: RoleplayStrategySlug,
  tokenizerSlug: string = 'llama',
): AbstractRoleplayStrategy => {
  switch (slug) {
    case 'alpacarp':
      return new RoleplayStrategyAlpaca(tokenizerSlug);
    case 'metharmerp':
      return new RoleplayStrategyMetharme(tokenizerSlug);
    case 'llama3rp':
      return new RoleplayStrategyLlama3(tokenizerSlug);
    case 'vicunarp':
      return new RoleplayStrategyVicuna(tokenizerSlug);
    case 'mistralrp':
      return new RoleplayStrategyMistral(tokenizerSlug);
    case 'chatmlrp':
      return new RoleplayStrategyChatML(tokenizerSlug);
    case 'lyrarp':
      return new RoleplayStrategyLyra(tokenizerSlug);
    default:
      throw new Error(`Invalid roleplay strategy slug: ${slug}`);
  }
};
