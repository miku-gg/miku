import { useAppSelector } from '../state/store';
import { fillTextTemplate } from './prompts/strategies/utils';
import { selectCurrentScene } from '../state/selectors';

export const useFillTextTemplate = (text: string, characterName: string) => {
  const characters = useAppSelector((state) => state.novel.characters);
  const userName = useAppSelector((state) => state.settings.user.name);
  const scene = useAppSelector(selectCurrentScene);
  return fillTextTemplate(text, {
    user: userName,
    bot: characterName,
    characters: scene?.characters.reduce((prev, { characterId }) => {
      prev[characterId] = characters.find(({ id }) => id === characterId)?.name || '';
      return prev;
    }, {} as Record<string, string>),
  });
};
