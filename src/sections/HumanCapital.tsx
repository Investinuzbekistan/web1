import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDownWideNarrow, ArrowDownAZ, Info } from 'lucide-react';

import { Reveal, SectionHeading, SourceTag, StatGrid } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { formatNumber } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';
import { VIZ } from '../lib/shared/viz-palette';

type SortMode = 'value' | 'name';

export function HumanCapital({ content }: { content: Content }) {
  const { t, lang, theme } = useApp();
  const human = content.human_capital;
  const regions = content.regions;
  const viz = VIZ[theme];

  const [sort, setSort] = useState<SortMode>('value');

  // Nominal bars: one series, one hue. Identity comes from the row label, not
  // from colour — colouring 14 regions by their value would spend the identity
  // channel re-encoding what bar length already shows. Slot 4 (gold) is this
  // site's brand hue; it sits below 3:1 on the paper surface, so every bar
  // carries a visible value label as the relief channel.
  const barColor = viz.categorical[3] as string;

  const rows = useMemo(() => {
    const items = [...regions.items];
    items.sort((a, b) =>
      sort === 'value' ? b.avg_salary - a.avg_salary : a[lang].localeCompare(b[lang], lang),
    );
    return items;
  }, [regions.items, sort, lang]);

  const max = Math.max(...regions.items.map((r) => r.avg_salary), regions.national_avg_salary);

  return (
    <section id="human" className="section bg-paper-2/60 dark:bg-night-2/40">
      <div className="shell">
        <SectionHeading eyebrow={t.human.eyebrow} title={t.human.title} body={t.human.body} />

        <Reveal className="mt-12">
          <StatGrid items={human.kpis} content={content} sourceId={human.source} />
        </Reveal>

        {/* The two official population figures disagree; say so rather than average them. */}
        <Reveal className="mt-6">
          <p className="flex max-w-3xl items-start gap-2 text-sm text-muted dark:text-night-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{t.human.populationNote}</span>
          </p>
        </Reveal>

        <Reveal className="mt-14">
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h3 className="flex items-baseline gap-2 text-xl">
                  {t.human.salaryTitle}
                  <SourceTag content={content} id={regions.source} />
                </h3>
                <p className="mt-1 text-sm text-muted dark:text-night-muted">{t.human.salaryUnit}</p>
              </div>

              <div
                role="group"
                aria-label={t.actions.sortByValue}
                className="flex items-center rounded-full border border-line p-0.5 text-xs dark:border-night-line"
              >
                <SortButton active={sort === 'value'} onClick={() => setSort('value')}>
                  <ArrowDownWideNarrow className="size-3.5" aria-hidden="true" />
                  {t.actions.sortByValue}
                </SortButton>
                <SortButton active={sort === 'name'} onClick={() => setSort('name')}>
                  <ArrowDownAZ className="size-3.5" aria-hidden="true" />
                  {t.actions.sortByName}
                </SortButton>
              </div>
            </div>

            <ul className="mt-7 flex flex-col gap-2.5">
              {rows.map((region) => {
                const width = (region.avg_salary / max) * 100;
                const aboveAverage = region.avg_salary >= regions.national_avg_salary;
                return (
                  <li key={region.id} className="grid grid-cols-[1fr] gap-1 sm:grid-cols-[14rem_1fr]">
                    <span className="truncate text-sm">{region[lang]}</span>
                    <span className="flex items-center gap-3">
                      <span className="relative h-5 flex-1 overflow-hidden rounded-[3px] bg-line/60 dark:bg-night-line/60">
                        <span
                          className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-500 ease-out"
                          style={{ width: `${width}%`, backgroundColor: barColor }}
                        />
                        {/* National average reference line. */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 w-px bg-navy-900/45 dark:bg-white/45"
                          style={{ left: `${(regions.national_avg_salary / max) * 100}%` }}
                        />
                      </span>
                      <span
                        className={`w-20 shrink-0 text-right text-sm tabular-nums ${
                          aboveAverage ? 'font-semibold text-navy-900 dark:text-white' : ''
                        }`}
                      >
                        {formatNumber(region.avg_salary, lang, { maximumFractionDigits: 0 })}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted dark:text-night-muted">
              <span aria-hidden="true" className="inline-block h-3 w-px bg-navy-900/45 dark:bg-white/45" />
              {t.human.nationalAverage}:{' '}
              <span className="tabular-nums">
                {formatNumber(regions.national_avg_salary, lang, { maximumFractionDigits: 0 })}
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
        active
          ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900'
          : 'text-muted hover:text-navy-900 dark:text-night-muted dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
