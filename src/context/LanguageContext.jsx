import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'abron.lang';
const DEFAULT_LANG = 'am'; // Amharic is the default secondary language.

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'am' || saved === 'or' ? saved : DEFAULT_LANG;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore quota / private mode */
    }
  }, [lang]);

  const setLang = (next) => {
    if (next === 'am' || next === 'or') setLangState(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
