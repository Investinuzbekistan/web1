import { useMemo, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';

import { ContentIcon } from '../components/ContentIcon';
import { ExternalAnchor, LinkButton, Reveal, SectionHeading } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { useDialogBehaviour } from '../lib/hooks';
import type { Content, Sector } from '../lib/shared/content-types';

export function Sectors({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const sectors = content.sectors;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Sector | null>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(lang);
    if (!needle) return sectors.items;
    return sectors.items.filter((s) =>
      [s.uz, s.ru, s.en].some((label) => label.toLocaleLowerCase(lang).includes(needle)),
    );
  }, [sectors.items, query, lang]);

  return (
    <section id="sectors" className="section">
      <div className="shell">
        <SectionHeading eyebrow={t.sectors.eyebrow} title={t.sectors.title} body={t.sectors.body} />

        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted dark:text-night-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.sectors.searchLabel}
                placeholder={t.sectors.searchPlaceholder}
                className="w-full rounded-full border border-line bg-card py-3 pr-4 pl-11 text-sm placeholder:text-muted focus:border-gold-500 focus:outline-none dark:border-night-line dark:bg-night-2 dark:placeholder:text-night-muted"
              />
            </div>
            <p aria-live="polite" className="text-sm text-muted dark:text-night-muted">
              {t.sectors.count(results.length, sectors.items.length)}
            </p>
          </div>
        </Reveal>

        {/* Horizontal rather than stacked: with only an icon and a name, a tall
            card is mostly empty. Laid out as a directory row the same content
            fills its box and twice as many fit above the fold. Two columns, not
            three — ten items divide evenly into two and leave a lone orphan in
            three. Reveal sits inside the <li>, since a wrapper between <ul> and
            <li> breaks list semantics. */}
        {results.length === 0 ? (
          <p className="mt-10 text-muted dark:text-night-muted">{t.state.empty}</p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {results.map((sector, i) => (
              <li key={sector.id}>
                <Reveal delay={Math.min(i, 6) * 0.03}>
                  <button
                    type="button"
                    onClick={() => setOpen(sector)}
                    className="card group flex w-full items-center gap-4 p-4 text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-500 dark:hover:border-gold-400"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/10 text-gold-700 transition-colors group-hover:bg-gold-500/20 dark:bg-gold-400/10 dark:text-gold-400">
                      <ContentIcon name={sector.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 font-display font-semibold text-navy-900 dark:text-white">
                      {sector[lang]}
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-muted transition-colors group-hover:text-gold-700 dark:text-night-muted dark:group-hover:text-gold-400"
                      aria-hidden="true"
                    />
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open ? <SectorDialog sector={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}

function SectorDialog({ sector, onClose }: { sector: Sector; onClose: () => void }) {
  const { t, lang } = useApp();
  const ref = useDialogBehaviour(true, onClose);
  const titleId = `sector-${sector.id}-title`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label={t.actions.close}
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/45 backdrop-blur-sm"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card relative w-full max-w-lg p-7 shadow-raised"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.actions.close}
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-line text-muted hover:text-navy-900 dark:border-night-line dark:text-night-muted dark:hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <span className="grid size-12 place-items-center rounded-full bg-gold-500/10 text-gold-700 dark:bg-gold-400/10 dark:text-gold-400">
          <ContentIcon name={sector.icon} className="size-6" />
        </span>
        <h3 id={titleId} className="mt-4 text-2xl">
          {sector[lang]}
        </h3>
        {/* No invented sector description: the Agency does not publish one. */}
        <p className="mt-3 text-sm leading-relaxed text-muted dark:text-night-muted">
          {t.sectors.modalNote}
        </p>
        <LinkButton
          href={sector.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full"
        >
          {t.actions.officialPage}
        </LinkButton>
        <p className="mt-3 text-center text-xs text-muted dark:text-night-muted">
          <ExternalAnchor href={sector.url}>invest.gov.uz</ExternalAnchor>
        </p>
      </div>
    </div>
  );
}
