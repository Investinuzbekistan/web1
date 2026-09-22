import { ArrowRight } from 'lucide-react';

import { GirihPattern } from '../components/GirihPattern';
import { KpiCard, LinkButton, Reveal } from '../components/primitives';
import { useApp } from '../lib/app-context';
import type { Content } from '../lib/shared/content-types';

/**
 * The six figures an investor asks for first. Six rather than four because four
 * left the right column a third shorter than the headline beside it — and the
 * gap is better filled with the trade and enterprise numbers than with air.
 */
const HERO_KPI_IDS = [
  'gdp',
  'gdp_growth',
  'foreign_investment',
  'trade',
  'population_eoy',
  'foreign_enterprises',
];

export function Hero({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const { economy_2025: economy, organization } = content;

  const kpis = HERO_KPI_IDS.map((id) => economy.kpis.find((k) => k.id === id)).filter(
    (k): k is NonNullable<typeof k> => Boolean(k),
  );

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 text-gold-500/[0.055] dark:text-gold-300/[0.05]">
        <GirihPattern />
      </div>
      {/* Warm wash so the pattern fades out behind the headline. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper/70 to-paper dark:from-night dark:via-night/70 dark:to-night" />

      <div className="shell relative grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">{t.hero.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-4 text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] font-semibold">
              {t.hero.titleLead}{' '}
              <span className="bg-gradient-to-tr from-gold-500 to-gold-300 bg-clip-text text-transparent">
                {t.hero.titleAccent}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">{t.hero.body}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted dark:text-night-muted">
              {organization.name[lang]}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="#contact">
                {t.actions.enquiry}
                <ArrowRight className="size-4" aria-hidden="true" />
              </LinkButton>
              <LinkButton href="#why" variant="secondary">
                {t.actions.whyUzbekistan}
              </LinkButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div>
            <p className="eyebrow mb-4">{t.hero.kpiNote}</p>
            <div className="grid grid-cols-2 gap-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} content={content} sourceId={economy.source} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
