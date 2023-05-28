import { CharacterData } from "./CharacterData";
import { downloadBlob, generateZipFile } from "./file-download";
import { emotionGroupsEmbedder } from "./file-embedder";
import { hashBase64, hashBase64URI } from "./utils";

export enum BUILDING_STEPS {
  STEP_0_NOT_BUILDING = 0,
  STEP_1_GENERATING_EMBEDDINGS = 1,
  STEP_2_GENERATING_ZIP = 2,
  STEP_3_DOWNLOADING_ZIP = 3,
}

export async function createCharacterConfig(
  characterData: CharacterData,
  emotionsEmbeddingsHash: string
) {
  // Replace base64 images with their hashes
  const profilePicHash = await hashBase64URI(characterData.avatar);
  const backgroundHashes = await Promise.all(
    characterData.backgroundImages.map(async (bg) => {
      const hash = await hashBase64URI(bg.source);
      return { source: hash, description: bg.description };
    })
  );
  const emotionHashes = await Promise.all(
    characterData.emotionGroups.map(async (emotionGroup) => {
      const hashes = await Promise.all(
        emotionGroup.images.map(async (emotion) => {
          const hash = await hashBase64URI(emotion.sources[0]);
          return { id: emotion.emotion, hashes: [hash] };
        })
      );
      return {
        name: emotionGroup.name,
        description: emotionGroup.description,
        emotions: hashes,
      };
    })
  );
  const [voiceService, voiceId, emotion] = characterData.voice.split(".");

  // Map character data to the desired JSON structure
  const characterConfig = {
    bot_name: characterData.name,
    version: characterData.version,
    description: characterData.shortDescription,
    author: characterData.author,
    configVersion: 2,
    subject: "Anon",
    profile_pic: profilePicHash,
    backgrounds: backgroundHashes,
    short_term_memory: {
      service: "gpt_short-memory-v2",
      props: {
        prompt_context: "",
        prompt_initiator: "",
        language: "en",
        subjects: ["Anon"],
        botSubject: characterData.name,
        buildStrategySlug: "wpp",
        parts: {
          persona: characterData.description,
          attributes: characterData.attributes.map((attribute) => [
            attribute.key,
            attribute.value,
          ]),
          sampleChat: characterData.sampleConversation.split("\n"),
          scenario: characterData.scenario,
          greeting: characterData.greeting,
          botSubject: characterData.name,
        },
      },
    },
    prompt_completer: {
      service: 'openai_completer',
      props: {
        model: '',
      },
    },
    outputListeners: [
      {
        service: voiceService,
        props: {
          voiceId: voiceId,
          emotion: emotion || "chat",
        },
      },
      {
        service: "sbert_emotion-interpreter",
        props: {
          model: "all-MiniLM-L6-v2",
          start_context: characterData.emotionGroups[0].name,
          context_base_description_embeddings: emotionsEmbeddingsHash,
          contexts: characterData.emotionGroups.map((emotionGroup, index) => {
            return {
              id: emotionGroup.name,
              context_change_trigger: emotionGroup.trigger,
              emotion_embeddings: emotionGroup.emotionsHash,
              emotion_images: emotionHashes[index].emotions,
            };
          }),
        },
      },
    ],
  };

  return characterConfig;
}

export async function downloadBotFile(
  characterData: CharacterData,
  setBuildingStep: (step: BUILDING_STEPS) => void
) {
  setBuildingStep(BUILDING_STEPS.STEP_1_GENERATING_EMBEDDINGS);
  const emotionsEmbeddings = await emotionGroupsEmbedder(
    characterData.emotionGroups
  );
  const emotionsEmbeddingsHash = await hashBase64(emotionsEmbeddings);

  setBuildingStep(BUILDING_STEPS.STEP_2_GENERATING_ZIP);
  const botConfig = await createCharacterConfig(
    characterData,
    emotionsEmbeddingsHash
  );
  const images = [
    characterData.avatar,
    ...characterData.backgroundImages.map((bg) => bg.source),
    ...characterData.emotionGroups
      .map((emotionGroup) =>
        emotionGroup.images.map((emotion) => emotion.sources[0])
      )
      .flat(2),
  ];
  const blob = await generateZipFile(botConfig, images, emotionsEmbeddings);

  await downloadBlob(blob, `${characterData.name}_${Date.now()}.miku`);
  setBuildingStep(BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP);
}
