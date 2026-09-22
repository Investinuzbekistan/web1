import { m } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { useApp } from '../lib/app-context';
import { useCountUp, useInView, usePrefersReducedMotion } from '../lib/hooks';
import { formatDate, formatValue, sourceById } from '../lib/shared/content';
import type { Content, Kpi } from '../lib/shared/content-types';

/* --------------------------------------------------------------- animation */

/** The single reveal used across the site: a short fade and 16px rise. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  // `m` instead of `motion`: the feature bundle is loaded once, lazily, by the
  // <LazyMotion> in main.tsx, which keeps ~80 kB off the critical path.
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

/* ----------------------------------------------------------------- sources */

/**
 * The provenance chip that sits next to every figure. It is a real link to the
 * source, with the title and access date available on hover, focus and to screen
 * readers — not a decorative superscript.
 */
export function SourceTag({ content, id }: { content: Content; id: string | undefined }) {
  const { lang, t } = useApp();
  const source = id ? sourceById(content, id) : undefined;
  if (!source) return null;

  const accessed = formatDate(source.accessed, lang);

  return (
    <span className="group relative inline-flex align-middle">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t.sources.label}: ${source.title}. ${t.sources.asOf(accessed)}`}
        className="inline-flex size-4 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-gold-500 hover:text-gold-700 dark:border-night-line dark:text-night-muted dark:hover:border-gold-400 dark:hover:text-gold-400"
      >
        <Info className="size-2.5" aria-hidden="true" />
      </a>
      {/* `hidden` rather than `opacity-0`: an absolutely positioned element still
          extends the document's scroll area even when fully transparent, which
          made every page scroll sideways by the tooltip's width. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-line bg-card p-3 text-left text-xs leading-relaxed text-body shadow-raised group-hover:block group-focus-within:block dark:border-night-line dark:bg-night-2 dark:text-night-body"
      >
        <span className="block font-medium text-navy-900 dark:text-white">{source.title}</span>
        <span className="mt-1 block text-muted dark:text-night-muted">{t.sources.asOf(accessed)}</span>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ figures */

/** A number that counts up when it scrolls into view, formatted for the locale. */
export function AnimatedNumber({
  value,
  prefix,
  suffix,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const { lang } = useApp();
  const [ref, inView] = useInView<HTMLSpanElement>();
  const current = useCountUp(value, inView);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatValue(current, lang)}
      {suffix}
    </span>
  );
}

/**
 * KPI card — reserved for the hero, where four figures carry the page.
 * Everywhere else figures are dense enough to want `StatGrid` instead.
 */
export function KpiCard({
  kpi,
  content,
  sourceId,
}: {
  kpi: Kpi;
  content: Content;
  sourceId: string;
}) {
  const { lang } = useApp();
  return (
    <div className="card flex flex-col gap-1 p-5 lg:p-6">
      <AnimatedNumber
        value={kpi.value}
        prefix={kpi.prefix}
        suffix={kpi.suffix}
        className="figure text-3xl leading-none sm:text-4xl"
      />
      <span className="mt-1.5 flex items-start gap-1.5 text-sm leading-snug text-muted dark:text-night-muted">
        <span>{kpi.label[lang]}</span>
        <SourceTag content={content} id={sourceId} />
      </span>
    </div>
  );
}

/**
 * Dense figures as a ruled grid rather than a row of cards.
 *
 * Eleven cards in a four-column grid leaves a ragged last row and gives every
 * figure identical weight — the page reads as a wall of boxes. Here the cells
 * carry only a top hairline and no horizontal gap, so each row resolves into
 * one continuous rule and a short final row simply stops, the way a table does.
 * It absorbs any number of items, and it keeps card chrome for the places that
 * earn it.
 */
export function StatGrid({
  items,
  content,
  sourceId,
  className = '',
}: {
  items: Kpi[];
  content: Content;
  sourceId: string;
  className?: string;
}) {
  const { lang } = useApp();
  return (
    <dl
      className={`grid grid-cols-2 border-t border-line md:grid-cols-3 lg:grid-cols-4 dark:border-night-line ${className}`}
    >
      {items.map((kpi) => (
        <div
          key={kpi.id}
          className="flex flex-col gap-1 border-b border-line px-1 py-5 sm:px-4 lg:py-6 dark:border-night-line"
        >
          <dd className="order-1">
            <AnimatedNumber
              value={kpi.value}
              prefix={kpi.prefix}
              suffix={kpi.suffix}
              className="figure text-2xl leading-none sm:text-[1.75rem]"
            />
          </dd>
          <dt className="order-2 flex items-start gap-1.5 text-sm leading-snug text-muted dark:text-night-muted">
            <span>{kpi.label[lang]}</span>
            <SourceTag content={content} id={sourceId} />
          </dt>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ layout */

export function SectionHeading({
  eyebrow,
  title,
  body,
  id,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  id?: string;
}) {
  return (
    <Reveal className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl leading-tight sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      <div className="rule-gold mt-5" />
      {body ? <p className="mt-5 text-lg leading-relaxed">{body}</p> : null}
    </Reveal>
  );
}

/* ----------------------------------------------------------------- buttons */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-navy-900 text-white hover:bg-navy-900/90 dark:bg-gold-500 dark:text-navy-900 dark:hover:bg-gold-400',
  secondary:
    'border border-navy-900/20 text-navy-900 hover:border-gold-500 hover:text-gold-700 dark:border-night-line dark:text-white dark:hover:border-gold-400 dark:hover:text-gold-400',
  ghost: 'text-gold-700 hover:underline dark:text-gold-400',
};

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: { variant?: ButtonVariant; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BUTTON_BASE} ${buttonStyles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Same skin as Button, for in-page anchors such as the hero CTAs. */
export function LinkButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: { variant?: ButtonVariant; className?: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${BUTTON_BASE} ${buttonStyles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

/** External links always carry the icon and the rel pair. */
export function ExternalAnchor({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 underline-offset-4 hover:underline ${className}`}
    >
      {children}
      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}
