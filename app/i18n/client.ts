"use client";

import { useEffect, useState } from "react";
import i18next, { FlatNamespace, KeyPrefix } from "i18next";
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
  UseTranslationResponse,
  FallbackNs,
} from "react-i18next";
import { getCookie, setCookie } from "cookies-next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages, cookieName } from "./settings";

const runsOnServerSide = typeof window === "undefined";

// on client side the normal singleton is ok
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ["path", "htmlTag", "cookie", "navigator"],
    },
    preload: runsOnServerSide ? languages : [],
  });

/**
 * Custom hook for handling translations with i18next, including server-side and client-side language management.
 *
 * @template Ns - Type extending FlatNamespace for namespace specification
 * @template KPrefix - Type extending KeyPrefix for key prefix specification
 *
 * @param lng - The target language code to set
 * @param ns - Optional namespace parameter for translations
 * @param options - Optional configuration options for the translation hook
 *
 * @returns UseTranslationResponse object containing translation functions and i18n instance
 *
 * @remarks
 * This hook extends the base i18next useTranslation hook with:
 * - Server-side language handling
 * - Client-side language synchronization
 * - Cookie-based language persistence
 * - Automatic language state management
 *
 * @example
 * ```typescript
 * const { t, i18n } = useTranslation('en', 'common');
 * ```
 */
export function useTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  lng: string,
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const i18nextCookie = getCookie(cookieName);
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return;
      setActiveLng(i18n.resolvedLanguage);
    }, [activeLng, i18n.resolvedLanguage]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!lng || i18n.resolvedLanguage === lng) return;
      i18n.changeLanguage(lng);
    }, [lng, i18n]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (i18nextCookie === lng) return;
      setCookie(cookieName, lng, { path: "/" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lng, i18nextCookie]);
  }
  return ret;
}
