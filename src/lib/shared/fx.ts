/**
 * Central Bank of Uzbekistan exchange rates — progressive enhancement.
 *
 * The live request is allowed to fail for any reason (offline, CORS, CBU down,
 * slow network). When it does we fall back to the rates stored in content.json
 * and say so, with the date they were published. A stale rate is never shown as
 * if it were today's.
 *
 * Copied into each site by scripts/sync-shared.mjs. Do not edit the copies.
 */
import type { Content } from './content-types';

export interface FxRate {
  ccy: string;
  /** UZS per one unit of `ccy`. */
  rate: number;
}

export interface FxResult {
  status: 'live' | 'fallback';
  /** ISO date the rates were published by the CBU. */
  date: string | null;
  rates: FxRate[];
  /** Present when the live request failed — useful for a quiet console note. */
  reason?: string;
}

interface CbuRow {
  Ccy: string;
  Rate: string;
  Nominal: string;
  Date: string;
}

/** CBU publishes dd.mm.yyyy. */
function toIso(ddmmyyyy: string): string | null {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function fromStored(content: Content, reason: string): FxResult {
  const { fallback, currencies } = content.live_data.fx;
  const rates = currencies
    .filter((ccy) => typeof fallback.rates[ccy] === 'number')
    .map((ccy) => ({ ccy, rate: fallback.rates[ccy] as number }));
  return { status: 'fallback', date: fallback.date, rates, reason };
}

/**
 * Fetch today's rates, or return the stored ones. Never rejects.
 * `timeoutMs` keeps a hanging request from delaying anything that awaits this.
 */
export async function loadFx(content: Content, timeoutMs = 6000): Promise<FxResult> {
  const { endpoint, currencies } = content.live_data.fx;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return fromStored(content, `CBU responded ${res.status}`);

    const rows: unknown = await res.json();
    if (!Array.isArray(rows)) return fromStored(content, 'CBU payload was not an array');

    const wanted = new Set(currencies);
    const rates: FxRate[] = [];
    let date: string | null = null;

    for (const row of rows as CbuRow[]) {
      if (!row || !wanted.has(row.Ccy)) continue;
      const rate = Number(row.Rate);
      const nominal = Number(row.Nominal || 1);
      if (!Number.isFinite(rate) || !Number.isFinite(nominal) || nominal === 0) continue;
      rates.push({ ccy: row.Ccy, rate: rate / nominal });
      date ??= toIso(row.Date);
    }

    if (rates.length !== currencies.length) {
      return fromStored(content, 'CBU feed was missing one of the requested currencies');
    }
    // Keep the order declared in content.json, not the CBU's.
    rates.sort((a, b) => currencies.indexOf(a.ccy) - currencies.indexOf(b.ccy));
    return { status: 'live', date, rates };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    return fromStored(content, reason);
  } finally {
    clearTimeout(timer);
  }
}

/** Convert an amount of `ccy` into UZS using a loaded rate table. */
export function toUzs(amount: number, ccy: string, rates: FxRate[]): number | null {
  const found = rates.find((r) => r.ccy === ccy);
  return found ? amount * found.rate : null;
}
