import { AlertCircle, Loader2 } from 'lucide-react';

import { Header } from './components/Header';
import { Button } from './components/primitives';
import { useApp } from './lib/app-context';
import { Contact } from './sections/Contact';
import { Faq } from './sections/Faq';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { HumanCapital } from './sections/HumanCapital';
import { Journey } from './sections/Journey';
import { Sectors } from './sections/Sectors';
import { Services } from './sections/Services';
import { Sez } from './sections/Sez';
import { Strategy } from './sections/Strategy';
import { Tiif } from './sections/Tiif';
import { TrustBar } from './sections/TrustBar';
import { WhyUzbekistan } from './sections/WhyUzbekistan';

export function App() {
  const { state, reload, t } = useApp();
  const content = state.status === 'ready' ? state.content : null;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        {t.skipToContent}
      </a>

      <Header content={content} />

      <main id="main">
        {state.status === 'loading' ? <LoadingState /> : null}
        {state.status === 'error' ? <ErrorState message={state.message} onRetry={reload} /> : null}

        {content ? (
          <>
            <Hero content={content} />
            <TrustBar content={content} />
            <WhyUzbekistan content={content} />
            <HumanCapital content={content} />
            <Sectors content={content} />
            <Services content={content} />
            <Sez content={content} />
            <Strategy content={content} />
            <Tiif content={content} />
            <Journey content={content} />
            <Faq content={content} />
            <Contact content={content} />
          </>
        ) : null}
      </main>

      {content ? <Footer content={content} /> : null}
    </>
  );
}

/** Skeleton that mirrors the hero's shape, so the page does not jump on arrival. */
function LoadingState() {
  const { t } = useApp();
  return (
    <div className="shell pt-40 pb-28" aria-busy="true" aria-live="polite">
      <p className="sr-only">{t.state.loading}</p>
      <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full max-w-lg" />
          <Skeleton className="h-14 w-4/5 max-w-md" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-lg" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-12 w-56 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-card" />
          ))}
        </div>
      </div>
      <p className="mt-16 inline-flex items-center gap-2 text-sm text-muted dark:text-night-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {t.state.loading}
      </p>
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-line/70 dark:bg-night-line/70 ${className}`}
      aria-hidden="true"
    />
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useApp();
  return (
    <div className="shell pt-40 pb-28">
      <div className="card max-w-xl p-8" role="alert">
        <span className="grid size-12 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:bg-gold-400/15 dark:text-gold-400">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl">{t.state.errorTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted dark:text-night-muted">
          {t.state.errorBody}
        </p>
        <p className="mt-3 font-mono text-xs break-all text-muted dark:text-night-muted">{message}</p>
        <Button className="mt-6" onClick={onRetry}>
          {t.actions.retry}
        </Button>
      </div>
    </div>
  );
}
