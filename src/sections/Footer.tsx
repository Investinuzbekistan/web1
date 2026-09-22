import { ArrowUp, Info } from 'lucide-react';

import { ExternalAnchor } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { formatDate } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Footer({ content }: { content: Content }) {
  const { t, lang, theme } = useApp();
  const org = content.organization;

  return (
    <footer className="border-t border-line bg-paper pt-16 pb-10 dark:border-night-line dark:bg-night">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
          <div>
            <img
              src={theme === 'dark' ? 'brand/logo-gold-white.svg' : 'brand/logo-gold-primary.svg'}
              alt="Invest in Uzbekistan"
              width={200}
              height={59}
              className="h-11 w-auto"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted dark:text-night-muted">
              {org.name[lang]}
            </p>
            <p className="mt-4 text-sm">
              <ExternalAnchor href={org.contacts.website} className="text-gold-700 dark:text-gold-400">
                invest.gov.uz
              </ExternalAnchor>
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-sm font-semibold text-navy-900 dark:text-white">
                {t.footer.usefulLinks}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {content.useful_links.map((link) => (
                  <li key={link.url}>
                    <ExternalAnchor
                      href={link.url}
                      className="text-muted hover:text-navy-900 dark:text-night-muted dark:hover:text-white"
                    >
                      {link.label}
                    </ExternalAnchor>
                  </li>
                ))}
              </ul>
            </div>

            {/* Every figure on the page traces back to one of these. */}
            <div>
              <h2 className="font-display text-sm font-semibold text-navy-900 dark:text-white">
                {t.sources.sectionTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted dark:text-night-muted">
                {t.sources.sectionBody}
              </p>
              <ol className="mt-4 flex flex-col gap-2.5 text-xs">
                {content.sources.map((source) => (
                  <li key={source.id} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-gold-700 tabular-nums dark:text-gold-400">
                      {source.id}
                    </span>
                    <span className="text-muted dark:text-night-muted">
                      <ExternalAnchor href={source.url} className="hover:text-navy-900 dark:hover:text-white">
                        {source.title}
                      </ExternalAnchor>
                      {/* No opacity: the muted tone is already the lightest one
                          that clears AA, and 80% of it does not. */}
                      <span className="block tabular-nums">{formatDate(source.accessed, lang)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {content.meta.disclaimer_enabled ? (
          <div className="mt-14 rounded-card border border-line bg-paper-2 p-5 dark:border-night-line dark:bg-night-2">
            <p className="flex items-start gap-3 text-sm leading-relaxed">
              <Info className="mt-0.5 size-4 shrink-0 text-gold-700 dark:text-gold-400" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-navy-900 dark:text-white">
                  {t.footer.disclaimerTitle}.
                </strong>{' '}
                {t.footer.disclaimer}
              </span>
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted dark:border-night-line dark:text-night-muted">
          <p>{t.footer.rights(new Date().getFullYear())}</p>
          {/* Honest about the Russian text: it was translated, not supplied. */}
          {lang === 'ru' && content.meta.ru_machine ? (
            <p className="max-w-md">{t.sources.machineTranslation}</p>
          ) : null}
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-navy-900 dark:hover:text-white">
            <ArrowUp className="size-3.5" aria-hidden="true" />
            {t.actions.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
