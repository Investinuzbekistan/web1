import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Check, Copy, Mail, MapPin, Phone, Send } from 'lucide-react';

import { Button, ExternalAnchor, Reveal, SectionHeading } from '../components/primitives';
import { useApp } from '../lib/app-context';
import { usePersistentState } from '../lib/hooks';
import type { Content } from '../lib/shared/content-types';

const DRAFT_KEY = 'iu-enquiry-draft';

/** Investment size buckets. Index 0 means "prefer not to say". */
const AMOUNT_BUCKETS = ['', '< $1M', '$1–10M', '$10–50M', '$50–100M', '$100M+'] as const;

interface Draft {
  name: string;
  company: string;
  country: string;
  email: string;
  sector: string;
  amount: number;
  message: string;
}

const EMPTY: Draft = { name: '', company: '', country: '', email: '', sector: '', amount: 0, message: '' };

type Errors = Partial<Record<keyof Draft, string>>;
type Status = 'idle' | 'submitting' | 'sent' | 'failed';

export function Contact({ content }: { content: Content }) {
  const { t, lang } = useApp();
  const contacts = content.organization.contacts;

  const [draft, setDraft, clearDraft] = usePersistentState<Draft>(DRAFT_KEY, EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  // Whether a draft was restored is decided once, from what was in storage at
  // mount — not from the live draft, which the visitor is about to start typing
  // into. usePersistentState reads synchronously, so this is available here.
  const [showRestored] = useState(() => Boolean(draft.name || draft.email || draft.message));
  const firstErrorRef = useRef<HTMLFormElement | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft({ ...draft, [key]: value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (value: Draft): Errors => {
    const next: Errors = {};
    const name = value.name.trim();
    if (!name) next.name = t.contact.errors.nameRequired;
    else if (name.length < 2) next.name = t.contact.errors.nameShort;

    const email = value.email.trim();
    if (!email) next.email = t.contact.errors.emailRequired;
    // Deliberately permissive: one @, a dot in the domain, no spaces. Anything
    // stricter rejects valid addresses.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = t.contact.errors.emailInvalid;

    if (!value.country.trim()) next.country = t.contact.errors.countryRequired;

    const message = value.message.trim();
    if (!message) next.message = t.contact.errors.messageRequired;
    else if (message.length < 10) next.message = t.contact.errors.messageShort;

    return next;
  };

  const body = useMemo(() => {
    const sectorName =
      content.sectors.items.find((s) => s.id === draft.sector)?.[lang] ?? t.contact.form.sectorAny;
    const amount = AMOUNT_BUCKETS[draft.amount] || t.contact.form.amountAny;
    return [
      `${t.contact.form.name}: ${draft.name}`,
      `${t.contact.form.company}: ${draft.company || '—'}`,
      `${t.contact.form.country}: ${draft.country}`,
      `${t.contact.form.email}: ${draft.email}`,
      `${t.contact.form.sector}: ${sectorName}`,
      `${t.contact.form.amount}: ${amount}`,
      '',
      draft.message,
    ].join('\n');
  }, [draft, content.sectors.items, lang, t]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      firstErrorRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setStatus('submitting');
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;

    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...draft, amount: AMOUNT_BUCKETS[draft.amount] || null, lang }),
        });
        if (!res.ok) throw new Error(`endpoint responded ${res.status}`);
        setStatus('sent');
        clearDraft();
        return;
      } catch {
        setStatus('failed');
        return;
      }
    }

    // No backend in this project: hand the message to the visitor's mail client.
    const subject = `${t.contact.title} — ${draft.name}`;
    const href = `mailto:${contacts.emails[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setStatus('sent');
  };

  return (
    <section id="contact" className="section bg-paper-2/60 dark:bg-night-2/40">
      <div className="shell">
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} body={t.contact.body} />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <Reveal>
            {status === 'sent' ? (
              <div className="card p-8">
                <span className="grid size-12 place-items-center rounded-full bg-gold-500/15 text-gold-700 dark:bg-gold-400/15 dark:text-gold-400">
                  <Check className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl">{t.contact.success.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted dark:text-night-muted">
                  {import.meta.env.VITE_FORM_ENDPOINT
                    ? t.contact.success.posted
                    : t.contact.success.mailto}
                </p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={() => {
                    setStatus('idle');
                    clearDraft();
                  }}
                >
                  {t.contact.clearDraft}
                </Button>
              </div>
            ) : (
              <form ref={firstErrorRef} noValidate onSubmit={onSubmit} className="card p-6 md:p-8">
                {showRestored ? (
                  <p className="mb-6 rounded-lg border border-line bg-paper px-4 py-3 text-sm text-muted dark:border-night-line dark:bg-night dark:text-night-muted">
                    {t.contact.draftRestored}
                  </p>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    name="name"
                    label={t.contact.form.name}
                    required
                    value={draft.name}
                    error={errors.name}
                    onChange={(v) => set('name', v)}
                    autoComplete="name"
                  />
                  <Field
                    name="company"
                    label={t.contact.form.company}
                    value={draft.company}
                    onChange={(v) => set('company', v)}
                    autoComplete="organization"
                    hint={t.contact.form.optional}
                  />
                  <Field
                    name="country"
                    label={t.contact.form.country}
                    required
                    value={draft.country}
                    error={errors.country}
                    onChange={(v) => set('country', v)}
                    autoComplete="country-name"
                  />
                  <Field
                    name="email"
                    type="email"
                    label={t.contact.form.email}
                    required
                    value={draft.email}
                    error={errors.email}
                    onChange={(v) => set('email', v)}
                    autoComplete="email"
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-navy-900 dark:text-white">
                      {t.contact.form.sector}
                    </span>
                    <select
                      name="sector"
                      value={draft.sector}
                      onChange={(e) => set('sector', e.target.value)}
                      className="rounded-lg border border-line bg-card px-4 py-3 text-sm focus:border-gold-500 focus:outline-none dark:border-night-line dark:bg-night"
                    >
                      <option value="">{t.contact.form.sectorAny}</option>
                      {content.sectors.items.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector[lang]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-navy-900 dark:text-white">
                        {t.contact.form.amount}
                      </span>
                      <span className="tabular-nums text-muted dark:text-night-muted">
                        {AMOUNT_BUCKETS[draft.amount] || t.contact.form.amountAny}
                      </span>
                    </span>
                    <input
                      name="amount"
                      type="range"
                      min={0}
                      max={AMOUNT_BUCKETS.length - 1}
                      step={1}
                      value={draft.amount}
                      onChange={(e) => set('amount', Number(e.target.value))}
                      aria-valuetext={AMOUNT_BUCKETS[draft.amount] || t.contact.form.amountAny}
                      className="mt-3 w-full accent-gold-500"
                    />
                  </label>
                </div>

                <Field
                  className="mt-5"
                  name="message"
                  label={t.contact.form.message}
                  required
                  multiline
                  value={draft.message}
                  error={errors.message}
                  onChange={(v) => set('message', v)}
                />

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? t.contact.form.submitting : t.contact.form.submit}
                    <Send className="size-4" aria-hidden="true" />
                  </Button>
                  <span className="text-xs text-muted dark:text-night-muted">
                    {t.contact.draftSaved}
                  </span>
                </div>

                {status === 'failed' ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-lg border border-gold-500/40 bg-gold-500/[0.07] px-4 py-3 text-sm dark:border-gold-400/35 dark:bg-gold-400/[0.07]"
                  >
                    <strong className="font-semibold">{t.contact.failure.title}.</strong>{' '}
                    {t.contact.failure.body}
                  </p>
                ) : null}
              </form>
            )}
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex flex-col gap-4">
              <ContactRow icon={<Phone className="size-4" />} label={t.contact.phone}>
                <a href={contacts.phone_href} className="hover:underline">
                  {contacts.phone}
                </a>
                <CopyButton value={contacts.phone} />
              </ContactRow>

              {contacts.emails.map((email) => (
                <ContactRow key={email} icon={<Mail className="size-4" />} label={t.contact.email}>
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                  <CopyButton value={email} />
                </ContactRow>
              ))}

              <ContactRow icon={<MapPin className="size-4" />} label={t.contact.address}>
                <span>{contacts.address[lang]}</span>
                <ExternalAnchor
                  href={contacts.map_url}
                  className="text-xs text-gold-700 dark:text-gold-400"
                >
                  {t.contact.openMap}
                </ExternalAnchor>
              </ContactRow>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-navy-900/5 text-navy-900 dark:bg-white/10 dark:text-white">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted dark:text-night-muted">{label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm break-words">
          {children}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          },
          () => setCopied(false),
        );
      }}
      aria-label={`${t.actions.copy}: ${value}`}
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold-700 dark:text-night-muted dark:hover:text-gold-400"
    >
      {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
      {copied ? t.actions.copied : t.actions.copy}
    </button>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  required,
  multiline,
  type = 'text',
  autoComplete,
  hint,
  className = '',
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  hint?: string;
  className?: string;
}) {
  const errorId = `${name}-error`;
  const shared = `w-full rounded-lg border bg-card px-4 py-3 text-sm placeholder:text-muted focus:outline-none dark:bg-night ${
    error
      ? 'border-gold-700 dark:border-gold-400'
      : 'border-line focus:border-gold-500 dark:border-night-line'
  }`;

  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-navy-900 dark:text-white">
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </span>
        {hint ? <span className="text-xs text-muted dark:text-night-muted">{hint}</span> : null}
      </span>

      {multiline ? (
        <textarea
          name={name}
          value={value}
          rows={5}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}

      {error ? (
        <span id={errorId} role="alert" className="text-xs text-gold-700 dark:text-gold-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}
