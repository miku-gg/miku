import axios from 'axios'
import { EmotionTemplateSlug, MikuCard } from '@mikugg/bot-utils'
import { NovelCharacterOutfit, NovelState } from '../state/slices/novelSlice'
import { NarrationState } from '../state/slices/narrationSlice'
import { v4 as randomUUID } from 'uuid'
import { VersionId } from '../state/versioning'
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
    if (_card.version) {
      if (_card.version !== VersionId) {
        toast.error('Unsupported card version')
        throw new Error('Unsupported card version')
      } else {
        return _card
      }
    }
    const card = _card as MikuCard
    const { mikugg } = card.data.extensions
    const assets = new Set<string>()
    assets.add(mikugg.profile_pic)
    const scenes = mikugg.scenarios.map((scenario) => {
      const background =
        mikugg.backgrounds.find((bg) => bg.id === scenario.background)
          ?.source || ''
      const music =
        mikugg.sounds?.find((sound) => sound.id === scenario.music)?.source ||
        scenario.music ||
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
            role: scenario.id + '_char1',
          },
        ],
        children: scenario.children_scenarios,
      }
    })
    const outfits = mikugg.emotion_groups.reduce((outfits, emotion_group) => {
      outfits[emotion_group.id] = {
        id: emotion_group.id,
        name: emotion_group.name,
        template: emotion_group.template as EmotionTemplateSlug,
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
    if (assetsEndpoint) {
      await Promise.all(
        Array.from(assets).map((asset) =>
          axios.get(`${assetsEndpoint}/${asset}`)
        )
      )
    }

    return {
      novel: {
        fetching: false,
        title: card.data.name,
        description: mikugg.short_description,
        characters: {
          [cardId]: {
            id: cardId,
            name: card.data.name,
            card: card,
            profile_pic: mikugg.profile_pic,
            outfits,
            roles: mikugg.scenarios.reduce((roles, scenario) => {
              roles[scenario.id + '_char1'] = scenario.emotion_group
              return roles
            }, {} as { [role: string]: string | undefined }),
          },
        },
        scenes,
        startSceneId: mikugg.start_scenario,
      },
      narration: {
        fetching: false,
        currentResponseId: cardId,
        id: randomUUID(),
        input: {
          text: '',
          suggestions: [],
          disabled: false,
        },
        interactions: {},
        responses: {
          [cardId]: {
            id: cardId,
            parentInteractionId: null,
            selectedRole: mikugg.start_scenario + '_char1',
            characters: [
              {
                role: mikugg.start_scenario + '_char1',
                text: card.data.first_mes,
                emotion: firstEmotion?.id || 'happy',
                pose: 'standing',
                voices: mikugg.voices
              },
            ],
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
