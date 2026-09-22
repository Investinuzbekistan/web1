import { Reveal, SectionHeading } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { pickSuffixed } from '../lib/shared/content';
import type { Content } from '../lib/shared/content-types';

export function Journey({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const steps = content.investor_journey;

  return (
    <section id="journey" className="section">
      <div className="shell">
        <SectionHeading eyebrow={t.journey.eyebrow} title={t.journey.title} />

        <ol className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          {/* The connector sits behind the markers and only exists on wide screens,
              where the steps actually read left-to-right. */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute top-5 right-[10%] left-[10%] hidden h-px bg-line md:block dark:bg-night-line"
          />

          {steps.map((step, i) => (
            <li key={step.step}>
              <Reveal
                delay={Math.min(i, 5) * 0.08}
                className="relative flex gap-4 md:flex-col md:gap-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-500 bg-paper font-display text-sm font-semibold text-gold-700 tabular-nums dark:bg-night dark:text-gold-400">
                  {step.step}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted dark:text-night-muted">
                    {t.journey.stepLabel(step.step)}
                  </p>
                  <h3 className="mt-1 text-lg leading-snug">{step[lang]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted dark:text-night-muted">
                    {pickSuffixed<string>(step as unknown as Record<string, unknown>, 'desc', lang)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
