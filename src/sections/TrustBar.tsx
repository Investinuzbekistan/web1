import { useApp } from '../lib/app-context';
import { usePrefersReducedMotion } from '../lib/hooks';
import { formatValue } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

/**
 * The TIIF 2026 results ticker.
 *
 * The forum is over, so this reads as a record, not a countdown. With reduced
 * motion the marquee becomes a plain wrapped list rather than a slower scroll —
 * a crawling headline is worse than a static one.
 */
export function TrustBar({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const reduced = usePrefersReducedMotion();
  const tiif = content.tiif_2026;

  const items = tiif.stats.map(
    (s) => `${s.prefix ?? ''}${formatValue(s.value, lang)}${s.suffix ?? ''} ${s.label[lang]}`,
  );

  const lead = (
    <span className="font-display font-semibold text-gold-300">{t.trust.prefix}</span>
  );

  if (reduced) {
    return (
      <section aria-label={t.trust.prefix} className="border-y border-navy-900/10 bg-navy-900 py-4">
        <div className="shell flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
          {lead}
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    );
  }

  // Two identical tracks, each 50% of the container, scrolled by one track width:
  // the seam lands exactly where the sequence repeats, so there is no jump.
  const track = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center gap-8 px-4" aria-hidden={ariaHidden || undefined}>
      {lead}
      {items.map((item) => (
        <span key={item} className="whitespace-nowrap text-sm text-white/85">
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label={t.trust.prefix} className="overflow-hidden bg-navy-900 py-4">
      <div className="flex w-max animate-[iu-marquee_44s_linear_infinite] hover:[animation-play-state:paused]">
        {track(false)}
        {track(true)}
      </div>
      <style>{`@keyframes iu-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
