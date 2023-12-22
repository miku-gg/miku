export * from './utils'
export * from './RoleplayStrategy'
export * from './AbtractPromptStrategy'

const strategySlugs = ['roleplay'] as const
export type StrategySlug = (typeof strategySlugs)[number]
export function isOfTypeStrategySlug(slug: string): slug is StrategySlug {
  return (strategySlugs as readonly string[]).includes(slug)
}
