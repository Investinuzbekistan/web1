import { lazy, Suspense, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Reveal, SectionHeading, SourceTag, StatGrid } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { formatValue } from '../lib/shared/content';
import type { Content, GdpSlice } from '../lib/shared/content-types';
import { VIZ } from '../lib/shared/viz-palette';

const GdpDonut = lazy(() => import('../components/GdpDonut'));

export function WhyUzbekistan({ content }: { content: Content }) {
  const { t, lang, theme } = useApp();
  const economy = content.economy_2025;
  const viz = VIZ[theme];

  // Index into the data file, not into the filtered view: the colour of
  // "Industry" is the same whether or not a drill-down is open.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const parent = openIndex === null ? null : economy.gdp_structure[openIndex];

  const slices = useMemo(
    () =>
      economy.gdp_structure.map((slice, i) => ({
        name: slice.label[lang],
        value: slice.share,
        color: viz.categorical[i % viz.categorical.length] as string,
        index: i,
      })),
    [economy.gdp_structure, lang, viz],
  );

  const parentColor =
    openIndex === null ? viz.single : (viz.categorical[openIndex % viz.categorical.length] as string);

  return (
    <section id="why" className="section">
      <div className="shell">
        <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} body={t.why.body} />

        <Reveal className="mt-12">
          <StatGrid items={economy.kpis} content={content} sourceId={economy.source} />
        </Reveal>

        <Reveal className="mt-16">
          <div className="card grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl">{t.why.structureTitle}</h3>
                <SourceTag content={content} id={economy.source} />
              </div>
              <p className="mt-2 text-sm text-muted dark:text-night-muted">{t.why.structureHint}</p>

              <div className="relative mt-6 aspect-square">
                <Suspense
                  fallback={
                    <div
                      aria-hidden="true"
                      className="size-full animate-pulse rounded-full border-[18%] border-line/70 dark:border-night-line/70"
                    />
                  }
                >
                  <GdpDonut
                    slices={slices}
                    surface={viz.surface}
                    dimmedIndex={openIndex}
                    onSelect={(index) => setOpenIndex(index === openIndex ? null : index)}
                  />
                </Suspense>

                <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                  <span className="figure text-3xl leading-none">
                    {formatValue(parent ? parent.share : 100, lang)}%
                  </span>
                  <span className="mt-1 max-w-[9rem] text-xs text-muted dark:text-night-muted">
                    {parent ? parent.label[lang] : t.why.backToTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* The text breakdown is also the relief channel the palette requires:
                three light-mode slot colours sit below 3:1 on this surface. */}
            <div>
              {parent ? (
                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:underline dark:text-gold-400"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {t.why.backToTotal}
                </button>
              ) : null}

              <ul className="flex flex-col gap-1">
                {(parent?.children ?? economy.gdp_structure).map((row, i) => (
                  <ShareRow
                    key={`${parent?.id ?? 'root'}-${i}`}
                    row={row}
                    lang={lang}
                    max={parent ? Math.max(...(parent.children ?? []).map((c) => c.share)) : 100}
                    color={
                      parent
                        ? parentColor
                        : (viz.categorical[i % viz.categorical.length] as string)
                    }
                    onSelect={parent ? undefined : () => setOpenIndex(i)}
                    selected={!parent && openIndex === i}
                  />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="text-xl">{t.why.driversTitle}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {economy.growth_drivers.map((driver) => (
              <div key={driver.id} className="card p-5">
                <p className="figure text-3xl leading-none">{driver.value}</p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted dark:text-night-muted">
                  <span>{driver.label[lang]}</span>
                  <SourceTag content={content} id={economy.source} />
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** One row of the breakdown: swatch, name, share bar, value. */
function ShareRow({
  row,
  lang,
  max,
  color,
  onSelect,
  selected,
}: {
  row: GdpSlice;
  lang: 'uz' | 'ru' | 'en';
  max: number;
  color: string;
  onSelect?: (() => void) | undefined;
  selected: boolean;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0 flex-1 truncate text-left text-sm">{row.label[lang]}</span>
      <span className="relative hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-line sm:block dark:bg-night-line">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${(row.share / max) * 100}%`, backgroundColor: color }}
        />
      </span>
      <span className="w-14 shrink-0 text-right text-sm tabular-nums">
        {formatValue(row.share, lang)}%
      </span>
    </>
  );

  const shared = 'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors';

  return (
    <li>
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`${shared} hover:bg-paper-2 dark:hover:bg-night-line/40 ${
            selected ? 'bg-paper-2 dark:bg-night-line/40' : ''
          }`}
        >
          {body}
        </button>
      ) : (
        <div className={shared}>{body}</div>
      )}
    </li>
  );
}
