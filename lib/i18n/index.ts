import AsyncStorage from "@react-native-async-storage/async-storage";
import { en, type TranslationKey } from "./en";
import { ptBR } from "./pt-BR";

export type { TranslationKey };

export type LocaleId = "en" | "pt-BR";

export const LOCALE_STORAGE_KEY = "userLanguage";

const dictionaries: Record<LocaleId, Record<TranslationKey, string>> = {
  en,
  "pt-BR": ptBR,
};

/** Maps the human-readable label stored in AsyncStorage to a locale id. */
export function labelToLocale(label: string): LocaleId {
  if (label === ptBR["language.portuguese"] || label === "Português (Brasil)") {
    return "pt-BR";
  }
  return "en";
}

export function localeToLabel(locale: LocaleId): string {
  return locale === "pt-BR" ? ptBR["language.portuguese"] : en["language.english"];
}

export function getDictionary(locale: LocaleId): Record<TranslationKey, string> {
  return dictionaries[locale] ?? en;
}

export type TranslateParams = Record<string, string | number>;

export function translate(
  locale: LocaleId,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  let text = getDictionary(locale)[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{{${k}}}`, String(v));
    }
  }
  return text;
}

export async function readStoredLocale(): Promise<LocaleId> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved) return labelToLocale(saved);
  } catch {
    // ignore
  }
  return "en";
}

export async function persistLocale(locale: LocaleId): Promise<void> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, localeToLabel(locale));
}

export type ApplicationStatusKey = "Applied" | "In Progress" | "Accepted" | "Rejected";

const STATUS_KEYS: Record<ApplicationStatusKey, TranslationKey> = {
  Applied: "status.applied",
  "In Progress": "status.inProgress",
  Accepted: "status.accepted",
  Rejected: "status.rejected",
};

export function translateApplicationStatus(
  locale: LocaleId,
  status: ApplicationStatusKey,
): string {
  return translate(locale, STATUS_KEYS[status]);
}
