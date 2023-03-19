export const validModels = [ 'davinci', 'gpt3.5-turbo', 'pygmalion-6b' ] as const;
export const validVoices = [
  'elevenlabs_tts:MF3mGyEYCl7XYWbV9V6O',
  'elevenlabs_tts:EXAVITQu4vr4xnSDxMaL'
] as const;
export type Model = typeof validModels[number]
export type Voice = typeof validVoices[number]

export const models: Record<Model, { label: string; price: 'cheap' | 'normal' | 'expensive'; description: string }> = {
  'davinci': {
    label: 'Davinci',
    price: 'expensive',
    description: 'The most advanced model, capable of understanding complex prompts and generating detailed responses.',
  },
  'gpt3.5-turbo': {
    label: 'GPT-3.5 Turbo',
    price: 'normal',
    description: 'A powerful model with a balance of capabilities and affordability.',
  },
  'pygmalion-6b': {
    label: 'Pygmalion',
    price: 'cheap',
    description: 'An economical model suitable for simpler tasks and understanding basic prompts.',
  }
};

export const voices: Record<Voice, { label: string; price: 'cheap' | 'normal' | 'expensive' }> = {
  'elevenlabs_tts:MF3mGyEYCl7XYWbV9V6O': {
    label: 'ElevenLabs: Elli',
    price: 'expensive',
  },
  'elevenlabs_tts:EXAVITQu4vr4xnSDxMaL': {
    label: 'ElevenLabs: Bella',
    price: 'expensive',
  }
};

export type EmotionHashConfig = {
  name: string;
  hash: string;
  emotionIds: string[];
}

export const emotionHashConfigs: EmotionHashConfig[] = [
  // Fill this array with your actual emotion hash configs
  {
    name: 'Emotion Set 1',
    hash: 'emotion_set_1',
    emotionIds: ['happy', 'sad', 'angry', 'surprised'],
  },
  // Add more emotion hash configs here...
];

export type Attribute = {
  key: string;
  value: string;
};


export type EmotionGroup = {
  name: string;
  trigger: string;
  description: string;
  emotionsHash: string; // indicates a hash of one of the emotions has configs
  images: { emotion: string, sources: string[] }[] // emotion is the emotion id in the config
};

export type BackgroundImage = {
  source: string;
  description?: string;
};


export type CharacterData = {
  name: string;
  version: string;
  avatar: string;
  author: string;
  description: string;
  shortDescription: string;
  backgroundImages: BackgroundImage[];
  scenario: string;
  greeting: string;
  sampleConversation: string;
  model: Model;
  voice: Voice;
  attributes: Attribute[];
  emotionGroups: EmotionGroup[];
};

export type ValidationError = {
  field: string;
  message: string;
};

export const validateCharacterData = (characterData: CharacterData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!characterData.name || characterData.name.trim() === '') {
    errors.push({ field: 'name', message: 'Character name is required.' });
  }

  if (!characterData.version || characterData.version.trim() === '') {
    errors.push({ field: 'name', message: 'Character version is required.' });
  }

  if (!characterData.avatar) {
    errors.push({ field: 'avatar', message: 'Avatar is required.' });
  }

  if (!characterData.author || characterData.author.trim() === '') {
    errors.push({ field: 'author', message: 'Author is required.' });
  }

  if (!characterData.description || characterData.description.trim() === '') {
    errors.push({ field: 'description', message: 'Character description is required.' });
  }

  if (!characterData.shortDescription || characterData.shortDescription.trim() === '') {
    errors.push({ field: 'shortDescription', message: 'Character short description is required.' });
  }

  if (!characterData.scenario || characterData.scenario.trim() === '') {
    errors.push({ field: 'scenario', message: 'Scenario is required.' });
  }

  if (!characterData.greeting || characterData.greeting.trim() === '') {
    errors.push({ field: 'greeting', message: 'Greeting is required.' });
  }

  if (!characterData.attributes || characterData.attributes.length === 0) {
    errors.push({ field: 'attributes', message: 'At least one attribute is required.' });
  } else {
    characterData.attributes.forEach((attribute, index) => {
      if (!attribute.key || attribute.key.trim() === '') {
        errors.push({ field: `attributes[${index}].key`, message: 'Attribute key is required.' });
      }
      if (!attribute.value || attribute.value.trim() === '') {
        errors.push({ field: `attributes[${index}].value`, message: 'Attribute value is required.' });
      }
    });
  }

  if (!validModels.includes(characterData.model)) {
    errors.push({ field: 'model', message: 'Selected model is not valid.' });
  }

  if (!validVoices.includes(characterData.voice)) {
    errors.push({ field: 'voice', message: 'Selected voice is not valid.' });
  }

  if (!characterData.backgroundImages || characterData.backgroundImages.length === 0) {
    errors.push({
      field: "backgroundImages",
      message: "You must provide at least one background image.",
    });
  }

  if (!characterData.emotionGroups || characterData.emotionGroups.length === 0) {
    errors.push({ field: 'emotionGroups', message: 'At least one emotion group is required.' });
  } else {
    characterData.emotionGroups.forEach((emotionGroup, groupIndex) => {
      if (!emotionGroup.description || emotionGroup.description.trim() === '') {
        errors.push({ field: `emotionGroups[${groupIndex}].description`, message: 'Emotion group description is required.' });
      }

      if (!emotionGroup.name || emotionGroup.name.trim() === '') {
        errors.push({ field: `emotionGroups[${groupIndex}].name`, message: 'Emotion group name is required.' });
      }

      if (!emotionGroup.trigger || emotionGroup.trigger.trim() === '') {
        errors.push({ field: `emotionGroups[${groupIndex}].trigger`, message: 'Emotion group trigger is required.' });
      }

      emotionGroup.images.forEach((image, imageIndex) => {
        if (!image.sources || image.sources.length === 0) {
          errors.push({
            field: `emotionGroups[${groupIndex}].images[${imageIndex}].sources`,
            message: `Image for ${image.emotion} is required.`,
          });
        }
      });
    });
  }

  characterData.emotionGroups.forEach((emotionGroup, groupIndex) => {
    const foundConfig = emotionHashConfigs.find((config) => config.hash === emotionGroup.emotionsHash);
    if (!foundConfig) {
      errors.push({ field: `emotionGroups[${groupIndex}].emotionsHash`, message: 'Emotion group is not valid.' });
    } else {
      const foundEmotions = emotionGroup.images.map((image) => image.emotion);
      const missingEmotions = foundConfig.emotionIds.filter((id) => !foundEmotions.includes(id));

      missingEmotions.forEach((missingEmotion) => {
        errors.push({
          field: `emotionGroups[${groupIndex}].images`,
          message: `Image for emotion "${missingEmotion}" is missing.`,
        });
      });
    }
  });

  return errors;
};

export const validateStep = (step: number, characterData: CharacterData) => {
  const validationErrors = validateCharacterData(characterData);

  switch (step) {
    case 1:
      return validationErrors.filter(
        (error) =>
          error.field === "name" ||
          error.field === "version" ||
          error.field === "author" ||
          error.field === "avatar" ||
          error.field === "description" ||
          error.field === "scenario" ||
          error.field === "greeting" ||
          error.field.startsWith("attributes") ||
          error.field === "avatar" ||
          error.field === "backgroundImages"
      );
    case 2:
      return validationErrors.filter(
        (error) =>
          error.field === "model" ||
          error.field === "voice"
      );
    case 3:
      return validationErrors.filter(
        (error) => error.field.startsWith("emotionGroups")
      );
    default:
      return [];
  }
};