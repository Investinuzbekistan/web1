import { AlertTriangle, Check } from 'lucide-react';

import { ExternalAnchor, Reveal, SectionHeading, SourceTag } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { pickSuffixed } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Sez({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const sez = content.sez_and_incentives;
  const zoneTypes = pickSuffixed<string[]>(
    sez as unknown as Record<string, unknown>,
    'zone_types',
    lang,
  );

  return (
    <section id="sez" className="section bg-paper-2/60 dark:bg-night-2/40">
      <div className="shell">
        <SectionHeading eyebrow={t.sez.eyebrow} title={t.sez.title} body={t.sez.body} />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <ul className="flex flex-col gap-4">
            {sez.points.map((point, i) => (
              <li key={i}>
                <Reveal delay={Math.min(i, 4) * 0.05} className="card flex items-start gap-4 p-5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:bg-gold-400/15 dark:text-gold-400">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <p className="flex-1 leading-relaxed">
                    {point[lang]} <SourceTag content={content} id={point.source} />
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-6">
            <Reveal>
              <div className="card p-6">
                <h3 className="text-base">{t.sez.zoneTypesTitle}</h3>
                <ul className="mt-4 flex flex-col gap-2 text-sm">
                  {zoneTypes.map((zone) => (
                    <li key={zone} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-gold-500"
                      />
                      {zone}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted dark:border-night-line dark:text-night-muted">
                  {sez.legal_basis.text}
                  <br />
                  <ExternalAnchor href={sez.legal_basis.url} className="text-gold-700 dark:text-gold-400">
                    lex.uz
                  </ExternalAnchor>
                </p>
              </div>
            </Reveal>

            {/* Incentives change often and are investment-size dependent; the
                disclaimer is a first-class element here, not fine print. */}
            <Reveal delay={0.08}>
              <div className="rounded-card border border-gold-500/40 bg-gold-500/[0.07] p-6 dark:border-gold-400/35 dark:bg-gold-400/[0.07]">
                <h3 className="flex items-center gap-2 text-base text-gold-700 dark:text-gold-400">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                  {t.sez.disclaimerTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed">{sez.disclaimer[lang]}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
