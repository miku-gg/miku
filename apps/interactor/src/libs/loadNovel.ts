import axios from 'axios';
import { migrateNovelV2ToV3, tavernCardToNovelState } from '@mikugg/bot-utils';
import { NovelState } from '../state/slices/novelSlice';
import { NarrationState } from '../state/slices/narrationSlice';
import { v4 as randomUUID } from 'uuid';
import { NarrationResponse, VersionId } from '../state/versioning';
import { toast } from 'react-toastify';
import { NovelState as DeprecatedNovelV2, NarrationState as DeprecatedNarrationV2 } from '../state/versioning/v2.state';

export async function loadNovelFromSingleCard({
  cardId,
  cardEndpoint,
  assetLinkLoader,
}: {
  cardId: string;
  cardEndpoint: string;
  assetLinkLoader: (asset: string, lowres?: boolean) => string;
}): Promise<{
  novel: NovelState;
  narration: NarrationState;
}> {
  try {
    const { data: _card } = await axios.get(`${cardEndpoint}/${cardId}`);
    let novel: NovelState | null = null;
    if (_card.version) {
      if (_card.version === 'v2') {
        const v2 = {
          novel: _card.novel as DeprecatedNovelV2,
          narration: _card.narration as DeprecatedNarrationV2,
        };
        novel = migrateNovelV2ToV3(v2.novel);

        /* Add default start if not exists */
        const roleToCharacterID = new Map<string, string>();
        Object.values(v2.novel.characters).forEach((character) => {
          if (character) {
            Object.keys(character.roles).forEach((role) => {
              roleToCharacterID.set(role, character.id);
            });
          }
        });
        const startScene = v2.novel.scenes.find((scene) => scene.id === v2.novel.startSceneId) || v2.novel.scenes[0];

        const firstResponseId = Object.keys(v2.narration.responses).find(
          (key) => !v2.narration.responses[key]?.parentInteractionId,
        );
        const firstResponse = v2.narration.responses[firstResponseId!];
        const start = {
          id: firstResponseId || '',
          title: 'Default Start',
          description: '',
          sceneId: startScene.id,
          characters:
            firstResponse?.characters?.map((character) => {
              const characterId = roleToCharacterID.get(character.role) || '';
              return {
                characterId,
                text: character.text,
                pose: character.pose || 'standing',
                emotion: character.emotion,
              };
            }) || [],
        };
        novel.starts = [start];
        /* [END] Add default start if not exists */
      } else if (_card.version !== VersionId) {
        toast.error('Unsupported card version');
        throw new Error('Unsupported card version');
      } else {
        novel = _card.novel as NovelState;
      }
    }
    if (!novel) {
      if (_card.spec === 'chara_card_v2') {
        novel = tavernCardToNovelState(_card, cardId);
      }
      if (_card?.starts?.length) {
        novel = _card as NovelState;
      }
    }

    if (!novel) {
      throw new Error('Invalid novel');
    }

    const assets = new Set<string>();
    assets.add(novel.logoPic);
    novel.characters.forEach((character) => {
      assets.add(character.profile_pic);
    });
    const start = novel.starts[0];
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
        };
        return acc;
      }, {} as Record<string, NarrationResponse>),
    };
    const startScene = novel.scenes.find((scene) => scene.id === start.sceneId);
    startScene?.characters.forEach((character) => {
      const outfit = novel?.characters
        .find((c) => c.id === character.characterId)
        ?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === character.outfit);
      const startCharacter = start?.characters.find((c) => c.characterId === character.characterId);
      const firstImage = outfit?.emotions.find((e) => e.id === startCharacter?.emotion)?.sources.png;
      if (firstImage) assets.add(firstImage);
    });

    const firstSceneBackground = novel.backgrounds.find((b) => b.id === startScene?.backgroundId)?.source.jpg;
    if (firstSceneBackground) assets.add(firstSceneBackground);

    // await all assets load dummy fetch
    if (assetLinkLoader) {
      try {
        await Promise.all(
          Array.from(assets).map(async (_asset) => {
            const asset = assetLinkLoader(_asset);
            return !asset.startsWith('data:') ? axios.get(asset) : asset;
          }),
        );
      } catch (error) {
        console.error(error);
      }
    }

    return {
      novel,
      narration,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
