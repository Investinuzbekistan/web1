import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

import { useApp } from '../lib/app-context';
import { formatDate, formatNumber } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';
import { loadFx, type FxResult } from '../lib/shared/fx';

/**
 * "1 USD = 11 839,59 soʻm" in the header.
 *
 * Progressive enhancement: the live CBU request may fail for any reason, in which
 * case the stored rate from content.json is shown with its own date. The date is
 * always visible, so a fallback rate is never mistaken for today's.
 */
export function FxWidget({ content }: { content: Content }) {
  const { lang, t } = useApp();
  const [fx, setFx] = useState<FxResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadFx(content).then((result) => {
      if (!cancelled) setFx(result);
    });
    return () => {
      cancelled = true;
    };
  }, [content]);

  if (!fx) return null;

  const usd = fx.rates.find((r) => r.ccy === 'USD');
  if (!usd) {
    return <span className="text-xs text-muted dark:text-night-muted">{t.fx.unavailable}</span>;
  }

  const live = fx.status === 'live';
  const dateLabel = fx.date ? t.fx.asOf(formatDate(fx.date, lang)) : '';

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-muted dark:text-night-muted"
      title={`${t.fx.label} · ${live ? t.fx.live : t.fx.stored}${dateLabel ? ` · ${dateLabel}` : ''}`}
    >
      <Radio
        className={`size-3 shrink-0 ${live ? 'text-gold-700 dark:text-gold-400' : 'opacity-50'}`}
        aria-hidden="true"
      />
      <span className="tabular-nums">
        1 USD = {formatNumber(usd.rate, lang, { maximumFractionDigits: 0 })} UZS
      </span>
      <span className="sr-only">
        {t.fx.label}. {live ? t.fx.live : t.fx.stored}. {dateLabel}
      </span>
      {dateLabel ? (
        <span className="hidden text-[11px] opacity-70 min-[1700px]:inline">· {dateLabel}</span>
      ) : null}
    </span>
  );
}
