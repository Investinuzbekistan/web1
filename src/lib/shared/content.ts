/**
 * Framework-agnostic helpers for reading content.json.
 * Copied into each site by scripts/sync-shared.mjs. Do not edit the copies.
 */
import type { Content, Lang, SourceRef } from './content-types';

/** Where sync-shared.mjs puts the data inside every site's public/ folder. */
export const CONTENT_URL = 'data/content.json';

export class ContentLoadError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ContentLoadError';
  }
}

export async function loadContent(signal?: AbortSignal): Promise<Content> {
  let res: Response;
  try {
    res = await fetch(CONTENT_URL, { signal: signal ?? null });
  } catch (cause) {
    throw new ContentLoadError('Network error while loading content.json', cause);
  }
  if (!res.ok) throw new ContentLoadError(`content.json responded ${res.status}`);
  try {
    return (await res.json()) as Content;
  } catch (cause) {
    throw new ContentLoadError('content.json is not valid JSON', cause);
  }
}

/* ------------------------------------------------------------ translations */

/** Read the active language out of a {uz, ru, en} triple. */
export function pick(text: { uz: string; ru: string; en: string }, lang: Lang): string {
  return text[lang] || text.en || text.uz;
}

/** Read the active language out of a `prefix_uz` / `prefix_ru` / `prefix_en` family. */
export function pickSuffixed<T>(row: Record<string, unknown>, prefix: string, lang: Lang): T {
  return (row[`${prefix}_${lang}`] ?? row[`${prefix}_en`] ?? row[`${prefix}_uz`]) as T;
}

/* ----------------------------------------------------------------- sources */

/** Resolve a source id ("S2") to its record, for footnotes and tooltips. */
export function sourceById(content: Content, id: string): SourceRef | undefined {
  return content.sources.find((s) => s.id === id);
}

/** "invest.gov.uz · 21.09.2026" — the short attribution shown next to a figure. */
export function sourceLabel(source: SourceRef | undefined, lang: Lang): string {
  if (!source) return '';
  const host = new URL(source.url).hostname.replace(/^www\./, '');
  return `${host} · ${formatDate(source.accessed, lang)}`;
}

/* --------------------------------------------------------------- formatting */

/**
 * Locales used for *number and date formatting*, which is not always the same as
 * the content locale.
 *
 * Uzbek convention is a comma decimal separator and a space for grouping
 * ("48,7" / "18 164"). Several ICU builds — including the one in headless
 * Chromium — have no uz-UZ number data and silently fall back to the root
 * locale, which formats "48.7" and "18,164". ru-RU produces exactly the Uzbek
 * convention and is available everywhere, so Uzbek borrows it for digits only.
 */
const NUMBER_LOCALES: Record<Lang, string> = { uz: 'ru-RU', ru: 'ru-RU', en: 'en-GB' };

export function formatNumber(value: number, lang: Lang, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(NUMBER_LOCALES[lang], options).format(value);
}

/** Figures in content.json use "." decimals; uz/ru render them with a comma. */
export function formatValue(value: number, lang: Lang): string {
  const decimals = Number.isInteger(value) ? 0 : 1;
  return formatNumber(value, lang, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** dd.MM.yyyy for uz and ru, dd/MM/yyyy for en — stable across ICU builds. */
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return lang === 'en' ? `${dd}/${mm}/${yyyy}` : `${dd}.${mm}.${yyyy}`;
}

/**
 * Month names, written out rather than taken from Intl.
 *
 * `Intl.DateTimeFormat('uz-UZ', { month: 'long' })` falls back to the root
 * locale in several ICU builds — including headless Chromium — and renders
 * "2026 M06 18". Russian is listed in the genitive because that is the form a
 * date takes ("18 июня"), which is not what `month: 'long'` returns either.
 */
const MONTHS: Record<Lang, readonly string[]> = {
  uz: [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
  ],
  ru: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

/** "18 iyun 2026" · "18 июня 2026" · "18 June 2026" */
export function formatDateLong(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS[lang][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-06-16/2026-06-18" -> "16–18 iyun 2026". */
export function formatDateRange(range: string, lang: Lang): string {
  const [from, to] = range.split('/');
  if (!from || !to) return range;
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return range;

  const sameMonth =
    a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  return sameMonth
    ? `${a.getUTCDate()}–${formatDateLong(to, lang)}`
    : `${formatDateLong(from, lang)} – ${formatDateLong(to, lang)}`;
}
