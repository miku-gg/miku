import { MikuCard } from '@mikugg/bot-validator';
import { emotionTemplates } from '../data/emotions';
export { type EmotionTemplate, emotionTemplates } from '../data/emotions';
export { voices } from '../data/voices';

export type ValidationError = {
  field: string;
  message: string;
};

export const validateCharacterData = ({ data: characterData }: MikuCard): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!characterData.name || characterData.name.trim() === '') {
    errors.push({ field: 'name', message: 'Character name is required.' });
  }

  if (!characterData.character_version || characterData.character_version.trim() === '') {
    errors.push({ field: 'character_version', message: 'Character version is required.' });
  }

  if (!characterData.extensions.mikugg.profile_pic) {
    errors.push({ field: 'profile_pic', message: 'Avatar is required.' });
  }

  if (!characterData.creator || characterData.creator.trim() === '') {
    errors.push({ field: 'creator', message: 'Author is required.' });
  }

  if (!characterData.description || characterData.description.trim() === '') {
    errors.push({ field: 'description', message: 'Character description is required.' });
  }

  if (!characterData.extensions.mikugg.short_description || characterData.extensions.mikugg.short_description.trim() === '') {
    errors.push({ field: 'short_description', message: 'Character short description is required.' });
  }

  if (!characterData.scenario || characterData.scenario.trim() === '') {
    errors.push({ field: 'scenario', message: 'Scenario is required.' });
  }

  if (!characterData.first_mes || characterData.first_mes.trim() === '') {
    errors.push({ field: 'first_mes', message: 'Greeting is required.' });
  }
  if (!characterData.mes_example.length || characterData.mes_example.trim() === '') {
    errors.push({ field: `mes_example`, message: 'Sample conversation incomplete.' });
  }

  if (!characterData.personality || characterData.personality.trim() === '') {
    errors.push({ field: 'personality', message: 'At least one attribute is required.' });
  }

  if (!characterData.extensions.mikugg.backgrounds || characterData.extensions.mikugg.backgrounds.length === 0) {
    errors.push({
      field: "backgroundImages",
      message: "You must provide at least one background image.",
    });
  }

  if (!characterData.extensions.mikugg.emotion_groups || characterData.extensions.mikugg.emotion_groups.length === 0) {
    errors.push({ field: 'emotionGroups', message: 'At least one emotion group is required.' });
  } else {
    characterData.extensions.mikugg.emotion_groups.forEach((emotionGroup, groupIndex) => {

      if (!emotionGroup.id || emotionGroup.id.trim() === '') {
        errors.push({ field: `emotionGroups[${groupIndex}].id`, message: 'Emotion group id is required.' });
      }

      emotionGroup.emotions.forEach((emotion, emotionIndex) => {
        if (!emotion.source || emotion.source.length === 0) {
          errors.push({
            field: `emotionGroups[${groupIndex}].emotions[${emotionIndex}].source`,
            message: `Image for ${emotion.source} is required.`,
          });
        }
      });
    });
  }

  characterData.extensions.mikugg.emotion_groups.forEach((emotionGroup, groupIndex) => {
    const foundConfig = emotionTemplates.find((config) => config.id === emotionGroup.template);
    if (!foundConfig) {
      errors.push({ field: `emotionGroups[${groupIndex}].emotionsHash`, message: 'Emotion template is not valid.' });
    } else {
      const foundEmotions = emotionGroup.emotions.map((emotion) => emotion.id);
      const missingEmotions = foundConfig.emotionIds.filter((id) => !foundEmotions.includes(id));

      missingEmotions.forEach((missingEmotion) => {
        errors.push({
          field: `emotionGroups[${groupIndex}].emotions`,
          message: `Image for emotion "${missingEmotion}" is missing.`,
        });
      });
    }
  });

  characterData.extensions.mikugg.scenarios.forEach((scenario) => {
    if (!scenario.context) {
      errors.push({
        field: `scenario.${scenario.name}.context`,
        message: `Scenario prompt context is empty`
      });
    }
    if (!scenario.trigger_action) {
      errors.push({
        field: `scenario.${scenario.name}.action_text`,
        message: `Scenario action text is empty`
      });
    }
    if (!scenario.trigger_suggestion_similarity) {
      errors.push({
        field: `scenario.${scenario.name}.keywords`,
        message: `Scenario keywords are empty`
      })
    }
    if (!scenario.name) {
      errors.push({
        field: `scenario.${scenario.name}.name`,
        message: `Scenario name is empty`
      })
    }
  })

  return errors;
};

export const validateStep = (step: number, mikuCard: MikuCard) => {
  const validationErrors = validateCharacterData(mikuCard);

  switch (step) {
    case 1:
      return validationErrors.filter(
        (error) =>
          error.field === "name" ||
          error.field === "character_version" ||
          error.field === "creator" ||
          error.field === "profile_pic" ||
          error.field === "short_description" ||
          error.field === "description" ||
          error.field === "scenario" ||
          error.field === "first_msg" ||
          error.field === "personality" ||
          error.field === "mes_example"
      );
    case 2:
      return validationErrors.filter(
        (error) =>
          error.field === "backgroundImages" ||
          error.field.startsWith("emotionGroups")
      );
    case 3:
      return validationErrors.filter(
        (error) =>
          error.field.startsWith("scenario")
      );
    default:
      return [];
  }
};