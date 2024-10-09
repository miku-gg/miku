import { useAppSelector } from '../state/store';

const labels: Record<string, Record<string, string>> = {
  en: {
    loading_novel: 'Loading Novel',
  },
};

function getTranslatedLabel(language: string, labelKey: string, replacements: string[] = []) {
  let text = labels[language]?.[labelKey] || labels['en']?.[labelKey] || labelKey;
  replacements.forEach((replacement) => {
    text = text.replace('%', replacement);
  });
  return text;
}

export function useI18n() {
  const language = useAppSelector((state) => (state.novel.language || 'en').split('_')[0].toLowerCase());
  return {
    i18n: (key: string, replacements: string[] = []) => getTranslatedLabel(language, key, replacements),
  };
}
