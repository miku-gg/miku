import { CharacterData } from "./CharacterData";
import { downloadBlob, generateZipFile } from "./file-download";
import { emotionGroupsEmbedder } from "./file-embedder";
import { hashBase64, hashBase64URI } from "./utils";
import { plainText as RPBT } from '../data/RBPT.text';

export enum BUILDING_STEPS {
  STEP_0_NOT_BUILDING = 0,
  STEP_1_GENERATING_EMBEDDINGS = 1,
  STEP_2_GENERATING_ZIP = 2,
  STEP_3_DOWNLOADING_ZIP = 3,
}

const generatePromptsStandard = (characterData: CharacterData): {context: string, initiator: string, botSubject: string, subject: string} => {
  const characterAttributes = characterData.attributes
    .map((attr) => `${attr.key}('${attr.value}')`)
    .join("");

  const characterDescription =
    characterData.description && characterData.description.trim()
      ? `Description('${characterData.description}')`
      : "";

  const characterPart = `[Character('${characterData.name}'){${characterAttributes}${characterDescription ? " + " + characterDescription : ""}}]`;

  const exampleDialoguePart =
    characterData.sampleConversation && characterData.sampleConversation.trim()
      ? `[EXAMPLE DIALOGUE] ${characterData.sampleConversation}`
      : "";

  const roleplayStartPart =
    characterData.greeting && characterData.greeting.trim()
      ? `[Roleplay Start] ${characterData.greeting}`
      : `[Roleplay Start]`;

  return {
    context: `${characterPart} ${exampleDialoguePart}`,
    initiator: roleplayStartPart,
    subject: 'You',
    botSubject: characterData.name,
  };
};

const generatePromptRPBT = (characterData: CharacterData): {context: string, initiator: string, botSubject: string, subject: string} => {
  let context = RPBT;
  context += `\nPlayer: You'll play as ${characterData.name}. ${characterData.description}`
  context += characterData.attributes
    .map((attr) => ` ${characterData.name} has ${attr.value}.`)
    .join('');
  context += `The responses from ${characterData.name} shoud include the description of how they feel or what is the character doing at that moment in between asterisks (*)`;
  context += `\nRPBT: Ok, I'll play as ${characterData.name} and you will play as "Anon".\n`
  context += characterData.sampleConversation.replaceAll(`${characterData.name}:`, `RPBT (${characterData.name}):`).replaceAll('You:', 'Anon:');

  let initiator = `Anon: ${characterData.scenario}`;
  initiator += characterData.greeting.replaceAll(`${characterData.name}:`, `RPBT (${characterData.name}):`).replaceAll('You:', 'Anon:');

  return {
    context,
    initiator,
    subject: 'Anon',
    botSubject: `RPBT (${characterData.name})`,
  }
}

const generatePrompts = (characterData: CharacterData): {context: string, initiator: string, botSubject: string, subject: string} => {
  switch (characterData.model) {
    case 'llama-30b':
      return generatePromptRPBT(characterData);
    default:
      return generatePromptsStandard(characterData);
  }
}

export async function createCharacterConfig(characterData: CharacterData, emotionsEmbeddingsHash: string) {
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
      return { name: emotionGroup.name, description: emotionGroup.description, emotions: hashes };
    })
  );

  const {context, initiator, botSubject, subject} = generatePrompts(characterData);

  
  let modelService = 'openai_completer';
  switch (characterData.model) {
    case 'gpt-3.5-turbo':
      modelService = 'openai_completer';
      break;
    case 'pygmalion-6b':
      modelService = 'pygmalion_completer';
      break;
    case 'llama-30b':
      modelService = 'llama_completer';
      break;
  }
  const [voiceService, voiceId] = characterData.voice.split('.')

  // Map character data to the desired JSON structure
  const characterConfig = {
    bot_name: characterData.name,
    version: '1',
    description: characterData.shortDescription,
    author: characterData.author,
    configVersion: 2,
    subject,
    profile_pic: profilePicHash,
    backgrounds: backgroundHashes,
    short_term_memory: {
      service: 'gpt_short-memory',
      props: {
        prompt_context: context,
        prompt_initiator: initiator,
        language: 'en',
        subjects: [subject],
        botSubject: botSubject,
      },
    },
    prompt_completer: {
      service: modelService,
      props: {
        model: characterData.model,
      },
    },
    outputListeners: [
      {
        service: voiceService,
        props: {
          voiceId: voiceId,
        },
      },
      {
        service: 'sbert_emotion-interpreter',
        props: {
          model: 'all-MiniLM-L6-v2',
          start_context: characterData.emotionGroups[0].name,
          context_base_description_embeddings: emotionsEmbeddingsHash,
          contexts: characterData.emotionGroups.map((emotionGroup, index) => {
            return {
              id: emotionGroup.name,
              context_change_trigger: emotionGroup.trigger,
              emotion_embeddings: emotionGroup.emotionsHash,
              emotion_images: emotionHashes[index].emotions,
            }
          })
        },
      },
    ],
  };

  return characterConfig;
}

export async function downloadBotFile(characterData: CharacterData, setBuildingStep: (step: BUILDING_STEPS) => void) {
  setBuildingStep(BUILDING_STEPS.STEP_1_GENERATING_EMBEDDINGS);
  const emotionsEmbeddings = await emotionGroupsEmbedder(characterData.emotionGroups);
  const emotionsEmbeddingsHash = await hashBase64(emotionsEmbeddings);

  setBuildingStep(BUILDING_STEPS.STEP_2_GENERATING_ZIP);
  const botConfig = await createCharacterConfig(characterData, emotionsEmbeddingsHash);
  const images = [
    characterData.avatar,
    ...characterData.backgroundImages.map((bg) => bg.source),
    ...characterData.emotionGroups.map((emotionGroup) => emotionGroup.images.map((emotion) => emotion.sources[0])).flat(2),
  ]
  const blob = await generateZipFile(botConfig, images, emotionsEmbeddings);

  await downloadBlob(blob, `${characterData.name}_${Date.now()}.miku`);
  setBuildingStep(BUILDING_STEPS.STEP_3_DOWNLOADING_ZIP);
}