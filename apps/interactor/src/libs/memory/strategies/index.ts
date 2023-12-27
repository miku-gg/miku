export * from './utils'
export * from './RoleplayStrategyMetharme'
export * from './RoleplayStrategyAlpaca'
export * from './AbtractPromptStrategy'

export const strategySlugs = ['alpacarp', 'metharmerp'] as const
export type StrategySlug = (typeof strategySlugs)[number]
export function isOfTypeStrategySlug(slug: string): slug is StrategySlug {
  return (strategySlugs as readonly string[]).includes(slug)
}
