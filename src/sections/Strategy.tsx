import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { AlertTriangle, Target, TrendingUp } from 'lucide-react';

import { AnimatedNumber, Reveal, SectionHeading, SourceTag } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { pickSuffixed } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Strategy({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const strategy = content.strategy_2030;
  const [active, setActive] = useState(0);
  const tabsId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = strategy.priorities[active];
  const targets = current
    ? pickSuffixed<string[] | undefined>(
        current as unknown as Record<string, unknown>,
        'targets',
        lang,
      )
    : undefined;

  /** Arrow-key navigation, as the tabs pattern requires. */
  const onKeyDown = (event: KeyboardEvent) => {
    const last = strategy.priorities.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="strategy" className="section">
      <div className="shell">
        <SectionHeading
          eyebrow={t.strategy.eyebrow}
          title={t.strategy.title}
          body={strategy.summary[lang]}
        />

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted dark:text-night-muted">
          <span className="inline-flex items-baseline gap-2">
            <AnimatedNumber value={strategy.goals_total} className="figure text-2xl leading-none" />
            <span>{t.strategy.goalsLabel}</span>
            <SourceTag content={content} id={strategy.source} />
          </span>
          <span>
            {t.strategy.adopted}:{' '}
            {pickSuffixed<string>(strategy as unknown as Record<string, unknown>, 'adopted', lang)}
          </span>
        </div>

        <Reveal className="mt-10">
          <div
            role="tablist"
            aria-label={t.strategy.title}
            onKeyDown={onKeyDown}
            className="flex flex-wrap gap-2"
          >
            {strategy.priorities.map((priority, i) => (
              <button
                key={priority.n}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={active === i}
                aria-controls={`${tabsId}-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                  active === i
                    ? 'border-navy-900 bg-navy-900 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-navy-900'
                    : 'border-line text-body hover:border-gold-500 dark:border-night-line dark:text-night-body dark:hover:border-gold-400'
                }`}
              >
                <span className="font-display tabular-nums">{priority.n}</span>
                {/* Clamped by CSS, not by slice(): a character count cuts
                    mid-word and leaves no ellipsis to say it was cut. */}
                <span className="ml-2 hidden max-w-[22ch] truncate align-bottom sm:inline-block">
                  {priority[lang]}
                </span>
              </button>
            ))}
          </div>

          {current ? (
            <div
              role="tabpanel"
              id={`${tabsId}-panel-${active}`}
              aria-labelledby={`${tabsId}-tab-${active}`}
              tabIndex={0}
              /* Two of the five priorities publish no targets; giving them the
                 two-column grid anyway leaves half the card empty. */
              className={`card mt-5 grid gap-8 p-7 md:p-9 ${
                targets?.length ? 'md:grid-cols-[1fr_18rem]' : ''
              }`}
            >
              <div>
                {/* A bare "I" at display size reads as a stray pipe. Boxed, it
                    is unmistakably a numeral. */}
                <p className="inline-grid size-12 place-items-center rounded-lg border border-gold-500/40 font-display text-xl font-semibold text-gold-700 dark:border-gold-400/35 dark:text-gold-400">
                  {current.n}
                </p>
                <h3 className="mt-5 text-2xl leading-snug">{current[lang]}</h3>
                {current.goals ? (
                  <p className="mt-4 text-sm text-muted dark:text-night-muted">
                    {current.goals} {t.strategy.goalsLabel}
                  </p>
                ) : null}
              </div>

              {targets?.length ? (
                <div className="md:border-l md:border-line md:pl-8 dark:md:border-night-line">
                  <h4 className="flex items-center gap-2 text-sm text-muted dark:text-night-muted">
                    <Target className="size-4" aria-hidden="true" />
                    {t.strategy.targetsTitle}
                  </h4>
                  <ul className="mt-4 flex flex-col gap-3">
                    {targets.map((target) => (
                      <li key={target} className="flex items-start gap-2 text-sm leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500"
                        />
                        {target}
                      </li>
                    ))}
                  </ul>

                  {/* content.json marks this block verify:true — two official
                      pages give different 2030 GDP targets. Say so on the page
                      rather than silently picking one. */}
                  {strategy.verify ? (
                    <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted dark:border-night-line dark:text-night-muted">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        <strong className="font-semibold">{t.sources.verifyBadge}.</strong>{' '}
                        {strategy.verify_note}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="flex items-center gap-2 text-xl">
            <TrendingUp className="size-5 text-gold-700 dark:text-gold-400" aria-hidden="true" />
            {t.strategy.progressTitle}
          </h3>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {strategy.progress_since_adoption.map((item, i) => (
              <li key={i} className="card p-5 text-sm leading-relaxed">
                {item[lang]} <SourceTag content={content} id={strategy.source} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
