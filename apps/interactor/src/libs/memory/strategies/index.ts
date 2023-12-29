export * from './utils'
export * from './RoleplayStrategyMetharme'
export * from './RoleplayStrategyAlpaca'
export * from './AbtractPromptStrategy'

export const strategySlugs = ['alpacarp', 'metharmerp'] as const
export type StrategySlug = (typeof strategySlugs)[number]
export function isOfTypeStrategySlug(
  slug: string | undefined
): slug is StrategySlug {
  return typeof slug === undefined
    ? false
    : (strategySlugs as readonly string[]).includes(slug!)
}
