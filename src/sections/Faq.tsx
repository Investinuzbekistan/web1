import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

import { Reveal, SectionHeading, SourceTag } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { pickSuffixed } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Faq({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const entries = useMemo(
    () =>
      content.faq.map((entry, index) => ({
        index,
        source: entry.source,
        q: pickSuffixed<string>(entry as unknown as Record<string, unknown>, 'q', lang),
        a: pickSuffixed<string>(entry as unknown as Record<string, unknown>, 'a', lang),
      })),
    [content.faq, lang],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(lang);
    if (!needle) return entries;
    return entries.filter((e) =>
      `${e.q} ${e.a}`.toLocaleLowerCase(lang).includes(needle),
    );
  }, [entries, query, lang]);

  return (
    <section id="faq" className="section section--seam">
      <div className="shell">
        <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />

        <Reveal className="mt-8">
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted dark:text-night-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t.faq.searchLabel}
              placeholder={t.faq.searchPlaceholder}
              className="w-full rounded-full border border-line bg-card py-3 pr-4 pl-11 text-sm placeholder:text-muted focus:border-gold-500 focus:outline-none dark:border-night-line dark:bg-night-2 dark:placeholder:text-night-muted"
            />
          </div>
        </Reveal>

        {results.length === 0 ? (
          <p className="mt-8 text-muted dark:text-night-muted">{t.state.empty}</p>
        ) : (
          <ul className="mt-8 max-w-3xl divide-y divide-line dark:divide-night-line">
            {results.map((entry) => {
              const expanded = open === entry.index;
              const panelId = `faq-panel-${entry.index}`;
              const buttonId = `faq-button-${entry.index}`;
              return (
                <li key={entry.index}>
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpen(expanded ? null : entry.index)}
                      className="flex w-full items-center gap-4 py-5 text-left"
                    >
                      <span className="flex-1 font-display font-semibold text-navy-900 dark:text-white">
                        {entry.q}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted transition-transform duration-200 dark:text-night-muted ${
                          expanded ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!expanded}
                    className="pb-6 text-sm leading-relaxed text-muted dark:text-night-muted"
                  >
                    {entry.a} <SourceTag content={content} id={entry.source} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
