import axios from 'axios'
import { NovelV3 } from '@mikugg/bot-utils'

export const spendSceneSuggestion = async (
  apiEndpoint: string
): Promise<void> => {
  await axios.post(
    `${apiEndpoint}/user/use-suggestion`,
    {},
    {
      withCredentials: true,
    }
  )
}

export const unlockAchievement = async (
  apiEndpoint: string,
  achievementId: string
): Promise<void> => {
  await axios.post(
    `${apiEndpoint}/achievements/unlock`,
    {
      achievementId,
    },
    {
      withCredentials: true,
    }
  )
}

export const getUnlockableAchievements = async (
  apiEndpoint: string,
  botId: string
): Promise<NovelV3.NovelObjective[]> => {
  const { data } = await axios.get(
    `${apiEndpoint}/achievements/unlockable/${botId}`,
    {
      withCredentials: true,
    }
  )
  return data
}

export const getUnlockedItems = async (
  apiEndpoint: string
): Promise<NovelV3.InventoryItem[]> => {
  const { data } = await axios.get(`${apiEndpoint}/achievements/my-items`, {
    withCredentials: true,
  })
  return data
}
