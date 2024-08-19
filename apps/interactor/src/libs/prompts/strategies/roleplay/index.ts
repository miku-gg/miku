import {
  AbstractRoleplayStrategy,
  RoleplayStrategyAlpaca,
  RoleplayStrategyMetharme,
  RoleplayStrategyLlama3,
  RoleplayStrategyVicuna,
  RoleplayStrategyChatML,
  RoleplayStrategyMistral,
} from '..';

export const roleplayStrategySlugs = [
  'alpacarp',
  'metharmerp',
  'mistralrp',
  'vicunarp',
  'llama3rp',
  'chatmlrp',
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
    default:
      throw new Error(`Invalid roleplay strategy slug: ${slug}`);
  }
};
