import { migrateNovelV2ToV3 } from '@mikugg/bot-utils'
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

import {
  NarrationState as V3_NarrationState,
  NovelState as V3_NovelState,
  VersionId as V3_VersionId,
} from './v3.state'

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

export const migrateV2toV3 = (v2: {
  narration: V2_NarrationState
  novel: V2_NovelState
  version: string
}): {
  narration: V3_NarrationState
  novel: V3_NovelState
  version: string
} => {
  const roleToCharacterID = new Map<string, string>()
  Object.values(v2.novel.characters).forEach((character) => {
    if (character) {
      Object.keys(character.roles).forEach((role) => {
        roleToCharacterID.set(role, character.id)
      })
    }
  })
  return {
    narration: {
      ...v2.narration,
      responses: Object.keys(v2.narration.responses).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...v2.narration.responses[key]!,
            selectedCharacterId: v2.narration.responses[key]!.selectedRole,
            characters: v2.narration.responses[key]!.characters.map(
              ({ role, ...rest }) => ({
                characterId: roleToCharacterID.get(role) || '',
                ...rest,
              })
            ),
          },
        }),
        {}
      ),
    },
    novel: migrateNovelV2ToV3(v2.novel),
    version: V3_VersionId,
  }
}
