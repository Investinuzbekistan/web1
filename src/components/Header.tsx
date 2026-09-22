import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';

import { useApp } from '../lib/app-context';
import { useScrolled, useScrollSpy } from '../lib/hooks';
import { LANGS, type Content, type Lang } from '../lib/shared/content-types';
import { FxWidget } from './FxWidget';
import { LinkButton } from './primitives';

/** Sections the top nav links to, in page order. */
export const NAV_SECTIONS = [
  'why',
  'human',
  'sectors',
  'services',
  'sez',
  'strategy',
  'tiif',
  'journey',
  'faq',
  'contact',
] as const;

/** The subset that fits the desktop bar; the drawer shows all of them. */
const PRIMARY: readonly (typeof NAV_SECTIONS)[number][] = [
  'why',
  'sectors',
  'services',
  'sez',
  'tiif',
  'contact',
];

export function Header({ content }: { content: Content | null }) {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const scrolled = useScrolled();
  const active = useScrollSpy(NAV_SECTIONS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  const navLink = (key: (typeof NAV_SECTIONS)[number], onClick?: () => void) => (
    <a
      key={key}
      href={`#${key}`}
      onClick={onClick}
      aria-current={active === key ? 'true' : undefined}
      className={`rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors ${
        active === key
          ? 'text-gold-700 dark:text-gold-400'
          : 'text-body hover:text-navy-900 dark:text-night-body dark:hover:text-white'
      }`}
    >
      {t.nav[key]}
    </a>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? 'bg-paper/85 shadow-[0_1px_0_rgb(231_226_214)] backdrop-blur-md dark:bg-night/85 dark:shadow-[0_1px_0_rgb(47_45_87)]'
          : 'bg-transparent'
      }`}
    >
      <div className="shell flex h-20 items-center gap-4">
        <a href="#top" className="shrink-0" aria-label="Invest in Uzbekistan">
          <img
            src={theme === 'dark' ? 'brand/logo-gold-white.svg' : 'brand/logo-gold-primary.svg'}
            alt="Invest in Uzbekistan"
            width={168}
            height={50}
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <nav aria-label={t.navLabel} className="ml-auto hidden items-center xl:flex">
          {PRIMARY.map((key) => navLink(key))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          {content ? (
            <div className="hidden 2xl:block">
              <FxWidget content={content} />
            </div>
          ) : null}

          <LangSwitch lang={lang} onChange={setLang} label={t.language.label} labels={t.language} />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`${t.theme.label}: ${theme === 'dark' ? t.theme.dark : t.theme.light}`}
            className="grid size-10 place-items-center rounded-full border border-line text-body transition-colors hover:border-gold-500 hover:text-gold-700 dark:border-night-line dark:text-night-body dark:hover:border-gold-400 dark:hover:text-gold-400"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>

          {/* Wrapped rather than given `hidden md:inline-flex`: the button's own
              base class sets `inline-flex`, and two display utilities on one
              element resolve by stylesheet order, not by attribute order. */}
          <div className="hidden lg:block">
            <LinkButton href="#contact" className="px-5 py-2.5 whitespace-nowrap">
              {t.actions.enquiryShort}
            </LinkButton>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t.actions.openMenu}
            aria-expanded={drawerOpen}
            className="grid size-10 place-items-center rounded-full border border-line text-body xl:hidden dark:border-night-line dark:text-night-body"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label={t.actions.closeMenu}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col bg-paper p-6 shadow-raised dark:bg-night">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{t.hero.eyebrow}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t.actions.closeMenu}
                className="grid size-10 place-items-center rounded-full border border-line dark:border-night-line"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1" aria-label={t.navLabel}>
              {NAV_SECTIONS.map((key) => navLink(key, () => setDrawerOpen(false)))}
            </nav>
            <LinkButton
              href="#contact"
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full"
            >
              {t.actions.enquiry}
            </LinkButton>
            {content ? (
              <div className="mt-6 border-t border-line pt-4 dark:border-night-line">
                <FxWidget content={content} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function LangSwitch({
  lang,
  onChange,
  label,
  labels,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  label: string;
  labels: Record<Lang, string>;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center rounded-full border border-line p-0.5 dark:border-night-line"
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          aria-pressed={lang === code}
          title={labels[code]}
          className={`rounded-full px-2.5 py-1.5 text-xs font-semibold uppercase transition-colors ${
            lang === code
              ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900'
              : 'text-muted hover:text-navy-900 dark:text-night-muted dark:hover:text-white'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
