import { createContext, useContext, createSignal, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import en from './en';
import fr from './fr';

// Type for the translation dictionary
type TranslationDictionary = typeof en;

// Create a type for all possible translation paths
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (
  T extends object 
    ? { [K in keyof T]: `${K & string}${DotPrefix<DotNestedKeys<T[K]>>}` }[keyof T] 
    : ''
);

// Type for all possible translation keys
type TranslationKey = DotNestedKeys<TranslationDictionary>;

// Define available languages
export const languages = {
  en: 'English',
  fr: 'Français',
};

// Create the dictionaries
const dictionaries = {
  en,
  fr,
};

// Define the context type
type I18nContextType = {
  t: (path: TranslationKey, params?: Record<string, any>) => string;
  locale: () => string;
  setLocale: (lang: string) => void;
  availableLanguages: typeof languages;
};

// Create the context
const I18nContext = createContext<I18nContextType>();

// Create the provider component
export function createI18nProvider() {
  // Get browser language or use stored preference
  const getBrowserLanguage = () => {
    try {
      const storedLang = localStorage.getItem('language');
      if (storedLang && Object.keys(languages).includes(storedLang)) {
        return storedLang;
      }
      
      const browserLang = navigator.language.split('-')[0];
      return Object.keys(languages).includes(browserLang) ? browserLang : 'en';
    } catch (e) {
      // Fallback in case localStorage is not available
      return 'en';
    }
  };

  // Create the locale signal
  const [locale, setLocale] = createSignal(getBrowserLanguage());
  
  // Create the dictionary memo
  const dict = createMemo(() => i18n.flatten(dictionaries[locale() as keyof typeof dictionaries]));
  
  // Create the translator
  const translator = i18n.translator(dict, i18n.resolveTemplate);
  
  // Create a wrapper function with the correct type
  const t = (path: TranslationKey, params?: Record<string, any>): string => {
    return translator(path as any, params) || path;
  };

  // Update localStorage when language changes
  createEffect(() => {
    try {
      localStorage.setItem('language', locale());
    } catch (e) {
      // Ignore errors if localStorage is not available
    }
  });

  // Create the context value
  const contextValue: I18nContextType = {
    t,
    locale,
    setLocale,
    availableLanguages: languages,
  };

  return { contextValue };
}

// Create a hook to use the i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

// Export the context for use in App.tsx
export { I18nContext };
