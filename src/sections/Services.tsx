import { Scale } from 'lucide-react';

import { ContentIcon } from '../components/ContentIcon';
import { ExternalAnchor, Reveal, SectionHeading, SourceTag } from '../components/primitives';
import { useApp } from '../lib/app-context';
import type { Content } from '../lib/shared/content-types';

export function Services({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const org = content.organization;

  return (
    <section id="services" className="section section--seam">
      <div className="shell">
        <SectionHeading
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          body={t.services.body}
        />

        {/* Five services plus the legal basis fill a three-column grid exactly.
            The sixth cell was otherwise an empty slot, and the legal basis had
            been hanging off the side of the section below. */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {org.services.map((service, i) => (
            <Reveal key={service.id} delay={Math.min(i, 5) * 0.05} className="h-full">
              <article className="card flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/10 text-gold-700 dark:bg-gold-400/10 dark:text-gold-400">
                    <ContentIcon name={service.icon} className="size-5" />
                  </span>
                  {/* Recessive: the numeral orders the list, it is not the point
                      of the card. */}
                  <span className="font-display text-sm font-semibold text-muted tabular-nums dark:text-night-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="leading-relaxed text-navy-900 dark:text-white">{service[lang]}</p>
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.3} className="h-full">
            <aside className="flex h-full flex-col gap-4 rounded-card border border-gold-500/35 bg-gold-500/[0.06] p-6 dark:border-gold-400/30 dark:bg-gold-400/[0.06]">
              <span className="grid size-10 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:bg-gold-400/15 dark:text-gold-400">
                <Scale className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-base">{t.services.legalBasis}</h3>
              <p className="text-sm leading-relaxed text-muted dark:text-night-muted">
                {org.legal_basis.text}
              </p>
              <p className="mt-auto text-sm">
                <ExternalAnchor href={org.legal_basis.url} className="text-gold-700 dark:text-gold-400">
                  lex.uz
                </ExternalAnchor>
              </p>
            </aside>
          </Reveal>
        </div>

        {/* The five statutory functions are single sentences with no separate
            summary in the source data. An accordion therefore showed the same
            sentence on the trigger and in the panel; a numbered list shows each
            once. */}
        <Reveal className="mt-16">
          <h3 className="flex items-baseline gap-2 text-xl">
            {t.services.functionsTitle}
            <SourceTag content={content} id={org.source} />
          </h3>

          <ol className="mt-6 grid gap-x-10 border-t border-line md:grid-cols-2 dark:border-night-line">
            {org.functions.map((fn, i) => (
              <li
                key={i}
                className="flex gap-4 border-b border-line py-5 dark:border-night-line"
              >
                <span className="font-display text-sm font-semibold text-gold-700 tabular-nums dark:text-gold-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="flex-1 leading-relaxed">{fn[lang]}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
