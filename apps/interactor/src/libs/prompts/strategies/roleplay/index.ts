import {
  AbstractRoleplayStrategy,
  RoleplayStrategyAlpaca,
  RoleplayStrategyMetharme,
} from '..'

export const roleplayStrategySlugs = ['alpacarp', 'metharmerp'] as const
export type RoleplayStrategySlug = (typeof roleplayStrategySlugs)[number]
export function isOfTypeStrategySlug(
  slug: string | undefined
): slug is RoleplayStrategySlug {
  return typeof slug === typeof undefined
    ? false
    : (roleplayStrategySlugs as readonly string[]).includes(slug!)
}

export const getRoleplayStrategyFromSlug = (
  slug: RoleplayStrategySlug
): AbstractRoleplayStrategy => {
  switch (slug) {
    case 'alpacarp':
      return new RoleplayStrategyAlpaca()
    case 'metharmerp':
      return new RoleplayStrategyMetharme()
    default:
      throw new Error(`Invalid roleplay strategy slug: ${slug}`)
  }
}
