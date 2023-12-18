import axios from 'axios'
import { MikuCard } from '@mikugg/bot-utils'
import { NovelCharacterOutfit, NovelState } from '../state/novelSlice'
import { NarrationState } from '../state/narrationSlice'
import { v4 as randomUUID } from 'uuid'

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
    const { data: card } = await axios.get<MikuCard>(
      `${cardEndpoint}/${cardId}`
    )
    const { mikugg } = card.data.extensions
    const assets = new Set<string>()
    assets.add(mikugg.profile_pic)
    const scenes = mikugg.scenarios.map((scenario) => {
      const background =
        mikugg.backgrounds.find((bg) => bg.id === scenario.background)
          ?.source || ''
      const music =
        mikugg.sounds?.find((sound) => sound.id === scenario.music)?.source ||
        ''

      if (background) assets.add(background)

      // fetch all assets

      return {
        id: scenario.id,
        prompt: scenario.context,
        name: scenario.trigger_action,
        background,
        music,
        roles: [
          {
            characterId: cardId,
            role: scenario.id,
          },
        ],
        children: scenario.children_scenarios,
      }
    })
    const outfits = mikugg.emotion_groups.reduce((outfits, emotion_group) => {
      outfits[emotion_group.id] = {
        id: emotion_group.id,
        name: emotion_group.name,
        template: emotion_group.template,
        emotions: emotion_group.emotions.map((emotion) => {
          const sound =
            mikugg.sounds?.find((sound) => sound.id === emotion.sound)
              ?.source || ''
          return {
            id: emotion.id,
            source: emotion.source,
            sound,
          }
        }),
      }
      return outfits
    }, {} as { [outfit: string]: NovelCharacterOutfit | undefined })

    const firstScenario = mikugg.scenarios.find(
      (scenario) => scenario.id === mikugg.start_scenario
    )
    const firstEmotionGroup = mikugg.emotion_groups.find(
      (group) => group.id === firstScenario?.emotion_group
    )
    const firstEmotion =
      firstEmotionGroup?.template === 'base-emotions'
        ? firstEmotionGroup.emotions?.find((emotion) => emotion?.id === 'happy')
        : firstEmotionGroup?.emotions[0]

    assets.add(firstEmotion?.source[0] || '')
    const firstSceneBackground =
      scenes.find((scene) => scene.id === mikugg.start_scenario)?.background ||
      ''
    assets.add(firstSceneBackground)

    // await all assets load dummy fetch
    await Promise.all(
      Array.from(assets).map((asset) => axios.get(`${assetsEndpoint}/${asset}`))
    )

    return {
      novel: {
        fetching: false,
        characters: {
          [cardId]: {
            id: cardId,
            name: card.data.name,
            profile_pic: mikugg.profile_pic,
            outfits,
            roles: mikugg.scenarios.reduce((roles, scenario) => {
              roles[scenario.id] = scenario.emotion_group
              return roles
            }, {} as { [role: string]: string | undefined }),
          },
        },
        scenes,
        startSceneId: mikugg.start_scenario,
      },
      narration: {
        fetching: false,
        currentResponseId: mikugg.start_scenario,
        id: randomUUID(),
        input: {
          text: '',
          suggestions: [],
          disabled: false,
        },
        interactions: {},
        responses: {
          [mikugg.start_scenario]: {
            id: cardId,
            parentInteractionId: null,
            characters: {
              [mikugg.start_scenario]: {
                audio: '',
                text: card.data.first_mes,
                emotion: firstEmotion?.id || 'happy',
                pose: 'standing',
              },
            },
            fetching: false,
            selected: true,
            suggestedScenes: [],
            childrenInteractions: [],
          },
        },
      },
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
