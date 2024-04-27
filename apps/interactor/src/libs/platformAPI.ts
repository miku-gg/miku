import axios from 'axios'

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
