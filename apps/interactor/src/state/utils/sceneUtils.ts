import { NovelV3 } from '@mikugg/bot-utils';
import { store } from '../store';

// Get all scenes from a comma-separated sceneId string
export const getAvailableScenes = (sceneIdString?: string): string[] => {
  if (!sceneIdString) return [];
  const sceneIds = sceneIdString
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  return sceneIds;
};

// Check if a scene is locked (has more than 2 characters and user is not premium)
export const isSceneLocked = (scene: NovelV3.NovelScene | undefined): boolean => {
  if (!scene) return false;
  const isPremium = store.getState().settings.user.isPremium;
  return scene.characters.length > 2 && !isPremium;
};
