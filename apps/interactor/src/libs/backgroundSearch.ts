import axios from 'axios'

export interface BackgroundResult {
  id: string
  description: string
  asset: string
  sdPrompt: string | null
  sdModel: string | null
  sdParams: string | null
  author: {
    id: string
    username: string
    profilePic: string | null
  }
  createdAt: Date
  tags: string[]
}
export const backgroundSearcher = async (
  apiEndpont: string,
  params: {
    search: string
    take: number
    skip: number
  }
): Promise<BackgroundResult[]> => {
  const response = await axios.get<BackgroundResult[]>(apiEndpont, {
    params,
    headers: {
      Accept: 'application/json',
    },
  })
  // read as json
  return response.data
}
