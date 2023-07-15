export * from './utils';
export * from './RPBTStrategy';
export * from './SbfStrategy';
export * from './WppStrategy';
export * from './PygStrategy';
export * from './AlpacaStrategy';
export * from './Vicuna11Strategy';

const strategySlugs = ['wpp', 'sbf', 'rpbt', 'pyg', 'alpaca', 'vicuna11'] as const;
export type StrategySlug = (typeof strategySlugs)[number];
export function isOfTypeStrategySlug (slug: string): slug is StrategySlug {
  return (strategySlugs as readonly string[]).includes(slug);
}