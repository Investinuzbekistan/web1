import { CalendarCheck } from 'lucide-react';

import { ExternalAnchor, Reveal, SectionHeading, SourceTag, StatGrid } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { formatDateRange } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Tiif({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const tiif = content.tiif_2026;

  return (
    <section id="tiif" className="section bg-paper-2/60 dark:bg-night-2/40">
      <div className="shell">
        <SectionHeading eyebrow={t.tiif.eyebrow} title={t.tiif.title} />

        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* The forum is over. Past tense, no countdown. */}
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm dark:border-night-line">
              <CalendarCheck className="size-4 text-gold-700 dark:text-gold-400" aria-hidden="true" />
              {t.tiif.heldOn}: {formatDateRange(tiif.dates, lang)} · {tiif.city}
            </span>
            <p className="text-sm text-muted dark:text-night-muted">{t.tiif.pastNotice}</p>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <StatGrid items={tiif.stats} content={content} sourceId={tiif.source} />
        </Reveal>

        <Reveal className="mt-10">
          <div className="card p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
              <div>
                <h3 className="flex items-baseline gap-2 text-lg">
                  {t.tiif.attendeesTitle}
                  <SourceTag content={content} id={tiif.source} />
                </h3>
                {/* Text only — no third-party logos, by policy. */}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {tiif.notable_attendees_text_only.map((name) => (
                    <li
                      key={name}
                      className="rounded-full border border-line px-3.5 py-1.5 text-sm dark:border-night-line"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted dark:text-night-muted">
                  {t.tiif.attendeesNote}
                </p>
              </div>

              <div className="lg:border-l lg:border-line lg:pl-8 dark:lg:border-night-line">
                <img
                  src="brand/logo-tiif-2026.svg"
                  alt={tiif.name[lang]}
                  width={200}
                  height={155}
                  className="h-28 w-auto dark:hidden"
                />
                <img
                  src="brand/logo-tiif-2026.svg"
                  alt=""
                  aria-hidden="true"
                  width={200}
                  height={155}
                  className="hidden h-28 w-auto brightness-0 invert dark:block"
                />
                <p className="mt-5 text-sm">
                  <ExternalAnchor
                    href={tiif.official_site}
                    className="text-gold-700 dark:text-gold-400"
                  >
                    {t.tiif.officialSite}
                  </ExternalAnchor>
                </p>
                <p className="mt-2 text-sm">
                  <ExternalAnchor href={tiif.agency_page} className="text-muted dark:text-night-muted">
                    invest.gov.uz
                  </ExternalAnchor>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
