import axios from 'axios'
import {
  TavernCardV2,
  migrateNovelV2ToV3,
  tavernCardToMikuCardV2,
  tavernCardToNovelState,
} from '@mikugg/bot-utils'
import { NovelState } from '../state/slices/novelSlice'
import { NarrationState } from '../state/slices/narrationSlice'
import { v4 as randomUUID } from 'uuid'
import { NarrationResponse, VersionId } from '../state/versioning'
import { toast } from 'react-toastify'

export async function loadNovelFromSingleCard({
  cardId,
  cardEndpoint,
  assetsEndpoint,
}: {
  cardId: string
  cardEndpoint: string
  assetsEndpoint: string
}): Promise<{
  novel: NovelState
  narration: NarrationState
}> {
  try {
    const { data: _card } = await axios.get(`${cardEndpoint}/${cardId}`)
    let novel: NovelState | null = null
    if (_card.version) {
      if (_card.version === 'v2') {
        novel = migrateNovelV2ToV3(_card.novel)
      } else if (_card.version !== VersionId) {
        toast.error('Unsupported card version')
        throw new Error('Unsupported card version')
      } else {
        novel = _card.novel as NovelState
      }
    }
    if (!novel) {
      const card = tavernCardToMikuCardV2(_card as TavernCardV2)
      if (card.spec === 'chara_card_v2') {
        novel = tavernCardToNovelState(card)
      }
    }

    if (!novel) {
      throw new Error('Invalid novel')
    }

    const assets = new Set<string>()
    assets.add(novel.logoPic)
    novel.characters.forEach((character) => {
      assets.add(character.profile_pic)
    })
    const start = novel.starts[0]
    const narration: NarrationState = {
      fetching: false,
      currentResponseId: start.id,
      id: randomUUID(),
      input: {
        text: '',
        suggestions: [],
        disabled: false,
      },
      interactions: {},
      responses: novel.starts.reduce((acc, start) => {
        acc[start.id] = {
          id: start.id,
          parentInteractionId: null,
          selectedCharacterId: start.characters[0].characterId,
          characters: start.characters,
          fetching: false,
          selected: true,
          suggestedScenes: [],
          childrenInteractions: [],
        }
        return acc
      }, {} as Record<string, NarrationResponse>),
    }
    const startScene = novel.scenes.find((scene) => scene.id === start.sceneId)
    startScene?.characters.forEach((character) => {
      const outfit = novel?.characters
        .find((c) => c.id === character.characterId)
        ?.card.data.extensions.mikugg_v2.outfits.find(
          (o) => o.id === character.outfit
        )
      const startCharacter = start?.characters.find(
        (c) => c.characterId === character.characterId
      )
      const firstImage = outfit?.emotions.find(
        (e) => e.id === startCharacter?.emotion
      )?.sources.png
      if (firstImage) assets.add(firstImage)
    })

    const firstSceneBackground = novel.backgrounds.find(
      (b) => b.id === startScene?.backgroundId
    )?.source.jpg
    if (firstSceneBackground) assets.add(firstSceneBackground)

    // await all assets load dummy fetch
    if (assetsEndpoint) {
      try {
        await Promise.all(
          Array.from(assets).map((asset) =>
            axios.get(`${assetsEndpoint}/${asset}`)
          )
        )
      } catch (error) {
        console.error(error)
      }
    }

    return {
      novel,
      narration,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
