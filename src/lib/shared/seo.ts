/**
 * Runtime document metadata.
 *
 * The deploy URL is not known at build time, and hard-coding invest.gov.uz as the
 * canonical would attribute a concept page to the Agency. So canonical and
 * hreflang are written from `location` once the page is running, and the title,
 * description and og:locale follow the chosen language.
 *
 * Copied into each site by scripts/sync-shared.mjs. Do not edit the copies.
 */
import { LANGS, type Lang } from './content-types';

const OG_LOCALE: Record<Lang, string> = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_GB' };

function upsert<E extends HTMLElement>(selector: string, create: () => E): E {
  const existing = document.head.querySelector<E>(selector);
  if (existing) return existing;
  const el = create();
  document.head.appendChild(el);
  return el;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  const el = upsert<HTMLMetaElement>(`meta[${attr}="${key}"]`, () => {
    const meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    return meta;
  });
  el.setAttribute('content', value);
}

export interface SeoInput {
  lang: Lang;
  title: string;
  description: string;
}

export function applyDocumentSeo({ lang, title, description }: SeoInput): void {
  document.title = title;
  document.documentElement.lang = lang;

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:locale', OG_LOCALE[lang]);

  const base = `${window.location.origin}${window.location.pathname}`;

  const canonical = upsert<HTMLLinkElement>('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    return link;
  });
  canonical.href = `${base}?lang=${lang}`;
  setMeta('property', 'og:url', canonical.href);

  for (const code of [...LANGS, 'x-default'] as const) {
    const hreflang = code === 'x-default' ? 'x-default' : code;
    const target = code === 'x-default' ? 'uz' : code;
    const link = upsert<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
      () => {
        const el = document.createElement('link');
        el.rel = 'alternate';
        el.hreflang = hreflang;
        return el;
      },
    );
    link.href = `${base}?lang=${target}`;
  }
}
