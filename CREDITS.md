# Credits and licences

Everything in this repository is either generated from the client's own logo
artwork, produced procedurally in code, or taken from a source with a licence
that permits this use. There are no stock photographs, and no third-party brand
logos.

---

## Imagery

**There are no photographs anywhere in the three sites.** Every visual is
generated at runtime or at build time:

| Visual | Where | How it is made |
|---|---|---|
| Girih lattice background | Site 1, hero | Repeating SVG `<pattern>` written in `GirihPattern.tsx` — two squares and a circle per tile, ~700 bytes |
| Donut chart | Site 1, GDP structure | Recharts, from `content.json` |
| Regional salary bars | Site 1, human capital | Plain CSS bars, from `content.json` |
| Open Graph cards | All three | `scripts/process-logos.mjs`, composed as SVG and rasterised with sharp |
| Rotating globe | Site 2, prologue | three.js — a generated lat/long wireframe, a marker over Tashkent and great-circle arcs. No texture, no model |
| Arc fallback | Site 2, prologue | Inline SVG ellipses, shown when WebGL is unavailable or motion is reduced |
| Silk Road corridor | Site 2, chapter I | A hand-authored schematic SVG path. Diagrammatic, not a map — it makes no territorial claim |
| Project beeswarm | Site 2, chapter IV | Inline SVG, one dot per project on a logarithmic investment axis, packed in code from `forum-2026.json` |
| Thematic direction icons | Site 2, chapter III | Eight glyphs drawn by hand on one 24-unit grid in `ThemeIcon.vue` |
| Film grain | Site 2 | An inline `feTurbulence` SVG data URI at 3.5% opacity |
| Region choropleth | Site 3, map | d3-geo, over the boundary data below |

## Geographic data

**geoBoundaries** — Open Administrative Boundaries, gbOpen release.

- Dataset: Uzbekistan ADM1 (2017), 14 first-order administrative divisions
- Licence: **Open Data Commons Open Database License (ODbL) 1.0**
- Source URL: `https://github.com/wmgeolab/geoBoundaries` (release `9469f09`)
- Upstream source: `wambachers-osm.website/boundaries/`
- Citation: Runfola, D. et al. (2020) *geoBoundaries: A global database of political
  administrative boundaries.* PLoS ONE 15(4): e0231866.

Processing (`scripts/build-geo.mjs`): properties reduced to the region `id` used
in `content.json`, rings simplified with Douglas–Peucker and rounded to four
decimals, and rewound to the orientation d3-geo expects. 6 206 positions → 2 733;
170 KB → 49 KB. The ODbL requires that this derived database stay under the same
licence, which it does; the attribution appears in the site 3 footer.

## Typefaces

All self-hosted through [Fontsource](https://fontsource.org); nothing is fetched
from a third-party CDN at runtime.

| Family | Licence | Used by |
|---|---|---|
| Inter | SIL Open Font License 1.1 | Site 1 — body |
| Manrope | SIL Open Font License 1.1 | Site 1 — headings |
| Fraunces | SIL Open Font License 1.1 | Site 2 — headings |
| Space Grotesk | SIL Open Font License 1.1 | Site 2 — body |
| IBM Plex Sans | SIL Open Font License 1.1 | Site 3 — interface |
| IBM Plex Mono | SIL Open Font License 1.1 | Site 3 — figures |

Note on site 3: IBM Plex places the Uzbek apostrophes `ʻ` (U+02BB) and `ʼ`
(U+02BC) on a 0.6em advance, which splits every word containing one. A
`@font-face` claiming only those two codepoints borrows them from a system UI
font; see the comment at the top of `site-3-explorer/src/styles/app.css`.

## Icons

- **Lucide** (site 1) — ISC licence. Fifteen icons are imported by name through
  `ContentIcon.tsx`; the namespace import that would pull in the whole set is
  deliberately avoided.
- Sites 2 and 3 use no icon package. Site 2 draws its few marks as inline SVG;
  site 3 uses single typographic glyphs.

## Logo artwork

`logo/` contains the client's own artwork and is **never modified** — it is
opened read-only and every derived asset is written to `brand/`. Provenance,
extraction method and the colours measured from it are documented in
`brand/LOGO_INVENTORY.md`.

The State Emblem of the Republic of Uzbekistan appears in two of the supplied
families. It is **not extracted from the agency artwork** (`logo/invest Uzb 2.*`):
those pages are a concept rendering and must not carry state insignia.

The emblem is also part of the Tourism Investment Forum lockup the organiser
issued (`brand/newlogo/`). That file is extracted, because it is the client's own
event mark, and `brand/svg/forum-lockup.svg` and `forum-emblem.svg` are built from
it — but **site 2 does not use them**. The site is built on the emblem-free
`forum-wordmark`, so nothing on the page carries state insignia. Switching to the
full lockup is a one-line change in `SiteChrome.vue` and `ChPrologue.vue` if the
client asks for it.

## Third-party organisations

Names of organisations that took part in TIIF 2026 appear as **text only**, from
`content.json`. No third-party logos, wordmarks or brand colours are used.

## Client source material

The Tourism Investment Forum content on site 2 comes from documents supplied by
the organiser for this project: the forum concept, the preliminary programme, and
the regional investment project one-pagers. They are read by
`scripts/build-forum-data.mjs` and are **not redistributed** — the originals stay
out of the repository and only the parsed facts are published.

The regional source material also contains initiator names, personal mobile
numbers, taxpayer identification numbers and bank details. **None of it is carried
into `forum-2026.json` or onto the page.**

## Data sources

Every figure on all three sites comes from `shared/data/content.json`, and each
one carries a source id resolved to a title, URL and access date in the footer of
each site. The full list is in `docs/SOURCES.md`.

Live exchange rates come from the Central Bank of Uzbekistan's public JSON feed
(`cbu.uz`). `invest.gov.uz` is linked to, never scraped.

## Software

Frameworks and libraries are listed in each site's `package.json`. The notable
ones — React, Vue, Svelte, Vite, Tailwind CSS, GSAP (standard licence, free for
this use), three.js, D3, Recharts, Lenis, Framer Motion, sharp, svgo, mupdf — are
MIT-licensed except where noted.
