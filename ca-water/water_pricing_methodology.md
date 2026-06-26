# CA Water Pricing — Scrape Methodology & Playbook

Pilot run: 18 June 2026. Author: Cowork research pass (hand-off to Claude Code for scaling and build).

## Purpose

There is no single source for water prices per California water/irrigation agency. Prices live in scattered, inconsistent places: district rates pages, Agricultural Water Management Plans (AWMPs), board meeting minutes, budgets, Prop 218 notices, LAFCO Municipal Service Reviews, and occasional academic or commercial compilations. This document records how the pilot scraped that data for 20 agencies, what worked, what to watch for, and how to scale a parallel-agent pipeline to the full district list.

## What the pilot proved

A fan-out of parallel research agents, one assigned a handful of agencies, can locate published rates and capture a live source link for the large majority of real irrigation districts. Of 20 missing-data districts targeted: 14 returned a usable numeric rate, 4 returned rate structure plus a source but no clean dollar figure, and 2 (Scott Valley, Stratford) genuinely publish nothing online and need a phone/PRA request. The bottleneck is not search; it is that small districts often post scanned-image minutes or no website at all.

## Source hierarchy (try in this order)

1. **District rates / rules-and-regulations page or rate-schedule PDF** — best. Current, authoritative, e.g. Anderson-Cottonwood's 2026 water-service application ($87/acre + $135 fee), El Dorado ID's adopted 2026 rate schedule.
2. **Agricultural Water Management Plan (AWMP)** — most districts >25,000 irrigated acres must file one; it usually has a "water rates / pricing" section describing structure even when no current dollar figure is posted. DWR hosts these.
3. **Board meeting minutes / agenda packets** — many districts set the year's rate by board motion each spring (e.g. Exeter, Ivanhoe, Stone Corral set 2025 per-AF rates in May/June minutes). Often the only place the current number exists. Frequently scanned images — needs OCR.
4. **District budget** — adopted budgets list assessment-per-acre and rate assumptions.
5. **Prop 218 / Prop 26 notices** — published when a district raises rates; gives the new schedule and effective date (e.g. Lindsay-Strathmore's 2025 zone rates).
6. **LAFCO Municipal Service Reviews (MSR)** — county LAFCO reviews reproduce rate schedules for every district in the county. Invaluable for districts with no website (e.g. Yuba LAFCO MSR carried Camp Far West and Cordua rates; Amador LAFCO carried Jackson Valley). Often dated, so flag the year.
7. **Compilations / studies** — see key sources below.
8. **Local news** — covers Prop 218 hearings and rate fights; use only when nothing official resolves, mark confidence medium.

## Key cross-cutting sources (the closest things to a "one-stop shop")

- **UC Merced, "Understanding Water Rate Amid Drought" (Dec 2025)** — https://wsm.ucmerced.edu/wp-content/uploads/2025/12/understanding_water_rate.pdf — compiles variable ($/AF) and fixed ($/AF) agricultural rates for ~80 districts across 17 Central Valley counties (Tables A1a normal-year, A1b dry-year) plus selected coastal/southern counties (Table A2). Data spans 2006–2024 (most-recent-available per district), so figures can lag a district's current adopted rate, but it is the single richest starting table. In the pilot it filled gaps for Provident ($60/AF + $2), James ($112/AF + $21) and Laguna's fixed charge, and cross-validated Alpaugh exactly.
- **AQUAOSO, California Agricultural Water Prices** — https://aquaoso.com/blog/california-agricultural-water-prices/ — commercial blog aggregating district rates; cited by the UC Merced study. Useful as a second cross-check.
- **DWR AWMP library** — central repository of every filed Ag Water Management Plan.
- **County LAFCO websites** — each county's MSRs cover all districts in that county.

Recommended scaling approach: pre-load the UC Merced table and AQUAOSO list as a baseline, then run agents only to (a) refresh districts to their current adopted rate and (b) cover districts absent from those compilations.

## Search patterns that worked (per agency)

- `"<agency> water rates"`, `"<agency> rates and charges"`
- `"<agency> Agricultural Water Management Plan"` (then search the PDF for "rate" / "$")
- `"<agency> board minutes water rate <year>"`
- `"<agency> Prop 218 water rate"`
- `"<agency> budget assessment per acre"`
- `"<county> LAFCO municipal service review"` for website-less districts

## Pitfalls and rules learned

- **Scanned-image minutes/rate PDFs** (Stone Corral, Maxwell, Provident, Ivanhoe) have no machine-readable text. Render with OCR (pdftoppm + tesseract) and mark confidence medium since OCR can misread digits.
- **JavaScript-shell sites** (CivicEngage, Wix, Vision/Streamline gov templates — e.g. Solano ID's sidwater.org) return an empty page to a plain fetch. Use a JS-rendering browser (Chrome MCP) to read the real rates page, or fall back to the cached search snippet.
- **Name ≠ function.** Some "Irrigation Districts" are domestic drinking-water utilities (Durham ID), and some district "rates" are SGMA groundwater management fees, not water-sales rates (Galt ID). Tag these and exclude from ag price comparisons.
- **Wholesale vs landowner rate.** A figure in minutes may be a wheeling/transfer rate to another agency, not what landowners pay (Provident's $18.16/AF). Confirm whose rate it is.
- **Rate year matters.** Tulare Lake Basin rates more than double in critically dry years; always capture the effective year and water-year type. Never present a dry-year and normal-year figure as comparable.
- **Charge basis varies.** Per acre, per AF, per cubic foot (El Dorado), per crop/duty (Maxwell, Cordua), per connection. Normalize before charting (see build spec).
- **Don't fabricate.** If nothing resolves, mark `not-found` with the district contact number rather than guessing.

## Schema (enriched)

`agency_name, county, type, rate_year, rate_structure, fixed_charge_per_acre, volumetric_min_per_af, volumetric_max_per_af, tier_detail, water_type, charge_basis, notes, source_url, source_type, confidence, date_accessed`

- `rate_structure`: flat | tiered | fixed+volumetric | per-acre assessment | mixed | not-found
- `source_type`: rates page | AWMP | board minutes | budget | prop218 | LAFCO MSR | rules & regs | study | news | not-found
- `confidence`: high (district's own current doc) | medium (compilation, OCR, or dated official doc) | low (news, very dated, or wholesale-only)

## Scaling plan for Claude Code

1. Seed the table from the UC Merced study + AQUAOSO list (covers ~80 districts immediately).
2. Build a reusable agent prompt (the pilot prompt is a good template) that takes a batch of ~4 agency names and returns the schema JSON. Run in batches; ~4 agencies/agent kept results reliable.
3. Add an OCR fallback step for scanned PDFs and a JS-render (headless browser) fallback for shell sites.
4. Prioritize by type: Irrigation Districts (115) → Water Districts (359) → Water Storage (7) → Water Conservation (9). Skip "Other"/"Water Company"/"Community Service" unless specifically needed.
5. Dedupe sub-service-area rows (e.g. the many "Nevada Irrigation District - <place>" and "Solano Irrigation District - <place>" entries share the parent district's rates).
6. Write every result with a live `source_url` and `confidence`; queue `not-found` districts for a manual phone/PRA pass.

## Long-tail learnings (water-district sweep)

Scaling into the ~300 small Water Districts surfaced a clear pattern that should shape expectations and the build:

- **Most of the long tail does not publish a rate.** A large share are tiny (<2,000 acres), single-landowner, dormant, or have no website at all. Many post only board agendas on Streamline/SpecialDistrict.org with no rate page.
- **Many "Water Districts" no longer sell water by volume.** A big fraction are now SGMA Groundwater Sustainability Agencies that levy only a per-acre groundwater assessment (e.g. Ballico-Cortez, New Stone, Aliso WD GSA, Mid-Valley, Raisin City at $0.75/acre) rather than delivering water at a $/AF rate. Capture the assessment and tag `charge_basis = per acre`.
- **Name ≠ function, again.** Several "Water Districts" are domestic/municipal utilities (Hilmar, Delhi, Mesa, Green Valley County, West Kern, Santa Nella, Pinedale) or wholesale-only (North of the River). Tag and exclude from ag comparisons.
- **The source list has errors.** Multiple rows had wrong counties (Tri-Valley=Fresno not Madera, Centinella=Merced not Imperial, Western Hills=Stanislaus not Fresno, several "Klamath" irrigation districts are physically in Oregon) or names that don't resolve to any registered district (Clayton, International, Family Farms, Salyer, Lansdale, Sierra). Agents flagged these; they should be reviewed/cleaned in the source agency list.
- **LAFCO MSRs and the State Controller (publicpay.ca.gov / bythenumbers.sco.ca.gov) are the best fallbacks** for website-less districts — they confirm existence, county, and often a per-acre assessment even when the district itself publishes nothing.
- **Best yield is the mid-size genuine ag districts** that keep a live rates page or AWMP (Merquin $39-70/AF, Tea Pot Dome $155-180/AF, Kings River, Eastside, Mercy Springs). Prioritize these; treat the micro-districts as a phone/PRA list.

Practical implication: a realistic "covered" universe is closer to ~150-200 genuine ag pricing agencies than 3,700 rows. The rest are best marked not-found-online with a contact, or excluded as domestic.

## Status

Master dataset (`master_water_pricing.csv` / `.json`): **212 agencies, 127 with a numeric rate**, all with source links and confidence flags. Built from prior KC research (43), UC Merced study (54), and three 2026 agent waves (pilot 20 + irrigation/storage/conservation 47 + water districts 48). Remaining: ~250 small/long-tail Water Districts (mostly micro/dormant/domestic) — best run unattended via scheduled task or as a manual contact list. Next: wire the master into the dashboard pricing tab (see `water_pricing_tab_build_spec.md`).
