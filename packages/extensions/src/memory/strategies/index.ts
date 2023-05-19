export * from './RPBTStrategy';
export * from './SbfStrategy';
export * from './WppStrategy';

const strategySlugs = ['wpp', 'sbf', 'rpbt'] as const;
export type StrategySlug = (typeof strategySlugs)[number];
export function isOfTypeStrategySlug (slug: string): slug is StrategySlug {
  return (strategySlugs as readonly string[]).includes(slug);
}