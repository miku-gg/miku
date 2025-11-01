import { NovelV3 } from '@mikugg/bot-utils';

// Check if a scene is locked (has more than 2 characters)
export const isSceneLocked = (scene: NovelV3.NovelScene | undefined): boolean => {
  if (!scene) return false;
  return scene.characters.length > 2;
};

