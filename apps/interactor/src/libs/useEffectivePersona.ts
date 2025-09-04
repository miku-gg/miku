import { useAppContext } from '../App.context';
import { useAppSelector } from '../state/store';
import { PersonaResult } from './listSearch';

/**
 * Custom hook that returns the effective persona to use.
 */
export const useEffectivePersona = (): PersonaResult | null => {
  const { persona } = useAppContext();
  const novel = useAppSelector((state) => state.novel);
  
  // Check if current persona is empty
  const isPersonaEmpty = !persona?.name || persona.name.trim() === '';
  
  // If persona is empty and novel has a customPersona, use the novel's persona
  if (isPersonaEmpty && novel.customPersona?.name) {
    return {
      id: 'novel-persona',
      name: novel.customPersona.name,
      description: novel.customPersona.description,
      profilePic: novel.customPersona.profilePic,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'novel',
        username: 'novel',
      },
    };
  }
  
  // Otherwise, use the current persona
  return persona;
};