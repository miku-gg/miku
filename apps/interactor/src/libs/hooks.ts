import { useAppSelector } from '../state/store'
import { fillTextTemplate } from '../utils/replace'

export const useFillTextTemplate = (text: string) => {
  const userName = useAppSelector((state) => state.settings.user.name)
  const characterName = useAppSelector(
    (state) => Object.values(state.novel.characters)[0]?.name || ''
  )
  return fillTextTemplate(text, {
    user: userName,
    bot: characterName,
  })
}
