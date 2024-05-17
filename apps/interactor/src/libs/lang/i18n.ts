import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE_ES } from './es'
import { LANGUAGE_EN } from './en'
import { LANGUAGE_JP } from './jp'

export type i18nKey =
  | 'INPUT_BOX_PLACE_HOLDER'
  | 'LISTEN'
  | 'EDIT'
  | 'CONTINUE'
  | 'REGENERATE'
  | 'YOUR_BROWSER_DOES_NOT_SUPPORT_THE_AUDIO_ELEMENT'
  | 'THIS_IS_A_PREMIUM_FEATURE'
  | 'FREE_FOR_A_LIMITED_TIME'
  | 'ADDED_TO_INVENTORY'
  | 'SETTINGS'
  | 'SETTINGS__GENERAL_SETTINGS'
  | 'SETTINGS__PROMPT_SETTINGS'
  | 'SETTINGS__TEXT_ANIMATION_SPEED'
  | 'SETTINGS__SLOW'
  | 'SETTINGS__NORMAL'
  | 'SETTINGS__FAST'
  | 'SETTINGS__PRESTO'
  | 'SETTINGS__TEXT_FONT_SIZE_LABEL'
  | 'SETTINGS__SMALL_FONT_SIZE'
  | 'SETTINGS__MEDIUM_FONT_SIZE'
  | 'SETTINGS__LARGE_FONT_SIZE'
  | 'SETTINGS__NARRATION_VOICE_LABEL'
  | 'SETTINGS__VOICE_DESCRIPTION_LABEL'
  | 'SETTINGS__READING_SPEED'
  | 'SETTINGS__VOICE_ID'
  | 'SETTINGS__AUTOPLAY'
  | 'SETTINGS__YOUR_NAME'
  | 'SETTINGS__CUSTOM_SYSTEM_PROMPT'
  | 'SETTINGS__CUSTOM_SYSTEM_PROMPT_PLACEHOLDER'
  | 'TOOLTIP_AUTOCOMPLETE'

export type i18nConfig = Record<i18nKey, string>

export type i18nLanguage = 'en' | 'es' | 'jp'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: LANGUAGE_EN },
    es: { translation: LANGUAGE_ES },
    jp: { translation: LANGUAGE_JP },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export const _i18n = (key: i18nKey) => i18n.t(key)

export default i18n
