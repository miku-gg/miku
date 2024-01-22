import { useAppSelector } from '../state/store'
import { fillTextTemplate } from './prompts/strategies/utils'
import { selectCurrentScene } from '../state/selectors'

export const useFillTextTemplate = (text: string) => {
  const characters = useAppSelector((state) => state.novel.characters)
  const userName = useAppSelector((state) => state.settings.user.name)
  const scene = useAppSelector(selectCurrentScene)
  const characterName = useAppSelector(
    (state) => Object.values(state.novel.characters)[0]?.name || ''
  )
  return fillTextTemplate(text, {
    user: userName,
    bot: characterName,
    roles: scene?.roles.reduce((prev, { role, characterId }) => {
      prev[role] = characters[characterId]?.name || ''
      return prev
    }, {} as Record<string, string>),
  })
}
