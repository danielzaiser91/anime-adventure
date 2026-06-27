import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enUi from './en/ui.json';
import enStory from './en/story.json';
import deUi from './de/ui.json';
import deStory from './de/story.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { ui: enUi, story: enStory },
      de: { ui: deUi, story: deStory },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    ns: ['ui', 'story'],
    defaultNS: 'ui',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'CAB_LANGUAGE',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
