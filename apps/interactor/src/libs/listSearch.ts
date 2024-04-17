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

export interface CharacterResult {
  id: string
  name: string
  description: string
  card: string
  profilePic: string
  language: string
  nsfw: boolean
  author: {
    id: string
    username: string
    profilePic: string | null
  }
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface PersonaResult {
  id: string
  name: string
  description: string | null
  profilePic: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
  }
}

export const listSearch = async <T extends BackgroundResult | CharacterResult>(
  apiEndpont: string,
  params: {
    search: string
    take: number
    skip: number
  }
): Promise<T[]> => {
  const response = await axios.get<T[]>(apiEndpont, {
    params,
    headers: {
      Accept: 'application/json',
    },
  })
  // read as json
  return response.data
}
