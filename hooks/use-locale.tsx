import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type LocaleId,
  type TranslateParams,
  type TranslationKey,
  persistLocale,
  readStoredLocale,
  translate,
  localeToLabel,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => Promise<void>;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  languageLabel: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>("en");

  useEffect(() => {
    readStoredLocale().then(setLocaleState);
  }, []);

  const setLocale = useCallback(async (next: LocaleId) => {
    await persistLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      languageLabel: localeToLabel(locale),
    }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

/** Shorthand for `useLocale().t`. */
export function useTranslation() {
  const { t, locale, setLocale, languageLabel } = useLocale();
  return { t, locale, setLocale, languageLabel };
}
