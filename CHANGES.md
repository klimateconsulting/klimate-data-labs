# Data Labs Redesign — Changes Summary

Visual reskin of the Data Labs hub + all dashboards to match the 2026 klimateconsulting.com
redesign (light editorial system). Same data, same interactivity, new skin.

## Added
- `assets/labs-shell.css` — the shared shell: slim `#0a3a66` header ("DATA LABS" + links),
  4-color sector stripe, white title block (icon + question-style H1 + data-source pills),
  `.labs-panel` / `.labs-kpi` cards, underline tabs (`.labs-tabs`), pill tabs
  (`.labs-pill-tabs`), footer strip. Every page links this; edit once, applies everywhere.
- `CHANGES.md` (this file).

## Changed
- `index.html` (hub) — light redesign; 6 dashboard cards with sector top rules.
- `ca-water/` — shell header/title/footer, underline tabs (slug routing intact), panels/KPIs
  restyled via a scoped `<style id="labs-reskin">` block, Plotly traces recolored to brand
  (blue `#0F4C81` primary, yellow `#FFAD05` dry/warning, green `#70A288` secondary, grid
  `#E7EAEE`). Pricing paywall, password unlock, maps, and all data untouched.
- `enms/` — shell + white form panel, KPI cards, recommendation cards with system-colored
  left borders, Chart.js palette → brand colors, Montserrat chart font.
- `food-ag/` — shell chrome around the React app; internal header hidden; tab nav restyled to
  pill tabs; cards flattened to bordered panels. App bundle untouched.
- `enms-insights/` — shell chrome; theme custom-properties overridden to brand palette;
  2-col case-study grid; program badge colors (ISO/SEP/Ready) updated — the only bundle edit
  anywhere (one hardcoded color object in `assets/index-*.js`).
- `sargassum/` — shell header/stripe/footer only; its own dark interior kept as-is (no mock).

## Notes
- All pages keep their data pipelines and behavior; this was CSS/markup + chart-color config.
- Charts depending on third-party CDNs (plot.ly, cdnjs, d3js.org) could not render in the
  build sandbox (proxy-blocked) — layout verified by screenshot, chart colors by code review.
  Verify charts visually after deploying the branch.
