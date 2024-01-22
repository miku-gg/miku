export * from './utils'
export * from './AbstractPromptStrategy'
export * from './roleplay/RoleplayStrategyMetharme'
export * from './roleplay/RoleplayStrategyAlpaca'
export * from './roleplay/AbstractRoleplayStrategy'

export const strategySlugs = ['alpacarp', 'metharmerp'] as const
export type StrategySlug = (typeof strategySlugs)[number]
export function isOfTypeStrategySlug(
  slug: string | undefined
): slug is StrategySlug {
  return typeof slug === typeof undefined
    ? false
    : (strategySlugs as readonly string[]).includes(slug!)
}
