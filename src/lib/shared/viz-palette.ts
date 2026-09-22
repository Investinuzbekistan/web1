/**
 * Validated data-visualisation palette, shared by all three sites.
 *
 * Every value here was produced by snapping the brand hues into the required
 * OKLCH lightness band and then checked with the dataviz validator — not picked
 * by eye. Re-run before changing anything:
 *
 *   node <dataviz>/scripts/validate_palette.js "<hexes>" --mode light  --surface "#FEFBF7"
 *   node <dataviz>/scripts/validate_palette.js "<hexes>" --mode dark   --surface "#201933"
 *
 * ## Categorical (donut / stacked parts-of-a-whole)
 *
 * Three of the four hues are the brand's own (teal, blue, gold from the logo);
 * the fourth is magenta, taken from the documented reference palette because the
 * brand has no fourth hue that clears the gates — navy and blue are the same hue
 * family and collapse into each other once navy is lifted into the lightness band.
 *
 * Slot order is the ring order and is the CVD-safety mechanism. A donut is a
 * stacked bar bent into a circle, so the test is the *adjacent* pairlist — plus
 * the wrap pair (last slice touches the first), which was validated separately.
 * teal and magenta sit opposite each other on purpose: in dark mode that pair
 * measures ΔE 2.7 under deuteranopia, so they must never be neighbours.
 *
 * Results (adjacent + wrap, both modes, re-checked against the re-derived
 * surfaces in scripts/build-neutrals.mjs):
 *   light — worst CVD ΔE 12.2, worst normal-vision ΔE 16.7, contrast WARN
 *   dark  — worst CVD ΔE 11.1, worst normal-vision ΔE 15.1, contrast PASS
 *
 * The light-mode contrast WARN (teal 2.83, magenta 2.61, gold 2.87 against the
 * paper surface) is NOT dismissable: every chart using this palette must ship a
 * relief channel. Both charts that use it carry direct value labels *and* a
 * text breakdown beside the plot.
 *
 * ## Sequential (choropleth / magnitude)
 *
 * One hue, light to dark. Blue is the brand's own and is the default. The ramp is
 * checked for lightness monotonicity, not adjacency CVD — running the categorical
 * validator on it fails by design.
 */

export interface VizMode {
  /** Categorical slots, in ring order. Assign by entity id, never by rank. */
  categorical: readonly string[];
  /** Single-series marks: nominal bars, sparklines, one-series lines. */
  single: string;
  /** Sequential ramp, near-zero to maximum. */
  sequential: readonly string[];
  surface: string;
  grid: string;
  axis: string;
  muted: string;
  ink: string;
}

export const VIZ: { light: VizMode; dark: VizMode } = {
  light: {
    categorical: ['#00AA95', '#006FB9', '#E87BA4', '#C68A32'],
    single: '#006FB9',
    sequential: ['#CDE2FB', '#9EC5F4', '#6DA7EC', '#3987E5', '#256ABF', '#184F95', '#0D366B'],
    surface: '#FEFBF7',
    grid: '#E6DED4',
    axis: '#C9C2B2',
    muted: '#746E65',
    ink: '#262261',
  },
  dark: {
    categorical: ['#00A38F', '#2885D0', '#D55181', '#C0842B'],
    single: '#2885D0',
    sequential: ['#0D366B', '#184F95', '#256ABF', '#3987E5', '#6DA7EC', '#9EC5F4', '#CDE2FB'],
    surface: '#201933',
    grid: '#37314A',
    axis: '#443E5C',
    muted: '#938FA0',
    ink: '#FFFFFF',
  },
};

/**
 * Colour for a category, keyed by its position in the *data file* — so a filter
 * that hides a category never repaints the survivors.
 */
export function categoricalColor(index: number, mode: 'light' | 'dark'): string {
  const slots = VIZ[mode].categorical;
  return slots[index % slots.length] as string;
}

/** Map a value in [min, max] onto the sequential ramp. */
export function sequentialColor(
  value: number,
  min: number,
  max: number,
  mode: 'light' | 'dark',
): string {
  const ramp = VIZ[mode].sequential;
  if (!Number.isFinite(value) || max <= min) return ramp[0] as string;
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))] as string;
}
