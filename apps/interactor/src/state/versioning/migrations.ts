import {
  NarrationState as V1_NarrationState,
  NovelState as V1_NovelState,
  NarrationResponse as V1_NarrationResponse,
} from './v1.state'

import {
  NarrationState as V2_NarrationState,
  NovelState as V2_NovelState,
  VersionId as V2_VersionId,
  NarrationResponse as V2_NarrationResponse,
} from './v2.state'

export const migrateV1toV2 = (v1: {
  narration: V1_NarrationState
  novel: V1_NovelState
  version: string
}): {
  narration: V2_NarrationState
  novel: V2_NovelState
  version: string
} => {
  const migrateResponse = (
    response: V1_NarrationResponse
  ): V2_NarrationResponse => {
    const characters = Object.keys(response.characters).map((role) => ({
      role,
      emotion: response.characters[role]?.emotion || '',
      pose: response.characters[role]?.pose || '',
      text: response.characters[role]?.text || '',
    }))

    return {
      ...response,
      characters,
      selectedRole: characters[0]?.role,
    }
  }
  return {
    narration: {
      ...v1.narration,
      responses: Object.keys(v1.narration.responses).reduce(
        (acc, key) => ({
          ...acc,
          [key]: migrateResponse(v1.narration.responses[key]!),
        }),
        {}
      ),
    },
    novel: {
      ...v1.novel,
    },
    version: V2_VersionId,
  }
}
