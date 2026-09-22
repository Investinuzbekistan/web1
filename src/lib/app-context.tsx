/**
 * One provider for the three things every section needs: the content file, the
 * active language and the colour theme.
 *
 * Language and theme both persist to localStorage; language also round-trips
 * through the `?lang=` query parameter so a chosen language can be linked to.
 */
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadContent } from './shared/content';
import { isLang, type Content, type Lang } from './shared/content-types';
import { applyDocumentSeo } from './shared/seo';
import { UI, type UiStrings } from './ui';

const LANG_KEY = 'iu-lang';
const THEME_KEY = 'iu-theme';

export type Theme = 'light' | 'dark';

export type ContentState =
  | { status: 'loading' }
  | { status: 'ready'; content: Content }
  | { status: 'error'; message: string };

interface AppValue {
  state: ContentState;
  reload: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: UiStrings;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppValue | null>(null);

function readInitialLang(): Lang {
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromQuery)) return fromQuery;
  const stored = localStorage.getItem(LANG_KEY);
  if (isLang(stored)) return stored;
  return 'uz';
}

function readInitialTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'dark' ? 'dark' : 'light';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({ status: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // The effect only writes the *result*; `reload` is what puts the UI back into
  // the loading state, so no render is triggered from inside the effect body.
  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadContent(controller.signal)
      .then((content) => setState({ status: 'ready', content }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => controller.abort();
  }, [reloadToken]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    applyDocumentSeo({ lang, title: UI[lang].meta.title, description: UI[lang].meta.description });
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', theme === 'dark' ? '#16152E' : '#C68A32');
  }, [theme]);

  // Follow the OS only while the visitor has not expressed a preference.
  useEffect(() => {
    if (localStorage.getItem(THEME_KEY)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const value = useMemo<AppValue>(
    () => ({
      state,
      reload,
      lang,
      setLang,
      t: UI[lang],
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [state, reload, lang, setLang, theme],
  );

  return <AppContext value={value}>{children}</AppContext>;
}

export function useApp(): AppValue {
  const value = use(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
}

/** For sections that only render once the content is known. */
export function useContent(): Content {
  const { state } = useApp();
  if (state.status !== 'ready') throw new Error('useContent used outside a ready state');
  return state.content;
}
