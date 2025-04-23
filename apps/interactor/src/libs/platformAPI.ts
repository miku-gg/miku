import axios from 'axios';
import { NovelV3 } from '@mikugg/bot-utils';

export const spendSceneSuggestion = async (apiEndpoint: string): Promise<void> => {
  await axios.post(
    `${apiEndpoint}/user/use-suggestion`,
    {},
    {
      withCredentials: true,
    },
  );
};

export const unlockAchievement = async (apiEndpoint: string, achievementId: string): Promise<void> => {
  await axios.put(
    `${apiEndpoint}/achievement/${achievementId}`,
    {},
    {
      withCredentials: true,
    },
  );
};

export const getUnlockableAchievements = async (
  apiEndpoint: string,
  botId: string,
): Promise<NovelV3.NovelObjective[]> => {
  try {
    if (!apiEndpoint || !botId) return [];
    const { data } = await axios.get<
      {
        id: string;
        name: string;
        description: string;
        condition: string;
        scenes: string[];
        isEnabled: boolean;
        botId: string;
        inventoryItemId: string;
        createdAt: Date;
        updatedAt: Date;
        collectibleImage?: string;
        inventoryItem?: {
          id: string;
          name: string;
          description: string;
          isPremium: boolean;
          icon: string;
          createdAt: Date;
          updatedAt: Date;
          actions: {
            id: string;
            name: string;
            prompt: string;
            createdAt: Date;
            updatedAt: Date;
          }[];
        };
      }[]
    >(`${apiEndpoint}/achievements/${botId}/unlockable`, {
      withCredentials: true,
    });

    return data.map((achievement) => {
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        singleUse: true,
        stateCondition: {
          type: 'IN_SCENE',
          config: {
            sceneIds: achievement.scenes,
          },
        },
        condition: achievement.condition,
        actions: [
          {
            type: NovelV3.NovelActionType.ACHIEVEMENT_UNLOCK,
            params: {
              achievementId: achievement.id,
              reward: achievement.inventoryItem
                ? {
                    id: achievement.inventoryItem.id,
                    name: achievement.inventoryItem.name,
                    description: achievement.inventoryItem.description,
                    icon: achievement.inventoryItem.icon,
                    isPremium: achievement.inventoryItem.isPremium,
                    actions: achievement.inventoryItem.actions.map((action) => {
                      return {
                        name: action.name,
                        prompt: action.prompt,
                      };
                    }),
                  }
                : null,
              collectibleImage: achievement.collectibleImage,
            },
          },
        ],
      };
    });
  } catch (error) {
    console.warn(error);
    return [];
  }
};

export const getUnlockedItems = async (apiEndpoint: string): Promise<NovelV3.InventoryItem[]> => {
  try {
    if (!apiEndpoint) return [];
    const { data } = await axios.get(`${apiEndpoint}/items/unlocked`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    return [];
  }
};

export const uploadNarration = async (
  apiEndpoint: string,
  ecryptedJSON: string,
): Promise<{
  filename: string;
  expiration: string;
} | null> => {
  try {
    const response = await axios.post<{
      filename: string;
      expiration: string;
    }>(
      `${apiEndpoint}/bot/save-history`,
      {
        data: ecryptedJSON,
      },
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.warn(error);
    return null;
  }
};
