// Get all scenes from a comma-separated sceneId string
export const getAvailableScenes = (sceneIdString?: string): string[] => {
  if (!sceneIdString) return [];
  const sceneIds = sceneIdString.split(',').map(id => id.trim()).filter(id => id.length > 0);
  return sceneIds;
};
