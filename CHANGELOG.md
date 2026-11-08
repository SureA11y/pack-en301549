# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - Unreleased

Needs `@surea11y/core` 1.16 (`~1.16.0`). For core 1.13 to 1.15, use 1.2.

### Added

- **The standard as data** (`standard-data.js`, core's format `surea11y-standard/1`): every version's clauses, the rule map from the installed core, the groups, the notes and the profiles. A pack built on EN 301 549 starts from it with core's `deriveStandard`, through `standardDataOf(require('@surea11y/pack-en301549').standard)`, rather than copying the pack's tables ([README](./README.md#building-a-standard-on-en-301-549)).

### Changed

- The standard is built from that data with core's `standardFromData`, in place of `ruleMappedStandard`. Every result, rollup, procedure, group, note and translation is as before: the baseline recorded with core 1.16 by 1.2.0's code is the same, scan for scan on core's 141 scenario pages, except for the two changes below.
- The pack's `core` range is `~1.16.0`, and `describePacks` lists the experimental API it uses (`standard data`). `standardFromData` is experimental in core until 1.18.0, so a later minor may change it: the pack takes no later minor until then.

## [1.2.0] - 2026-11-05

Needs `@surea11y/core` 1.15.0 for the changes below; with an older core the pack behaves as 1.1.0 does.

### Added

- How a person checks each clause by hand: `proceduresFor`, `listProcedures` and `procedureChecklist` give each clause the procedures of the WCAG criterion it restates, listed under chapter 9's principles and guidelines (`groups.js`), with a note on V4.1.1's editions and Annex C; `relatedRequirements` goes from a criterion to its clause and back. The standard's own requirements, which no rule evaluates, have none.
- The standard in French, German, Spanish and Japanese: clause and group titles and V4.1.1's note, following UNE-EN 301549 and DIN EN 301549 where those give them. Procedures, worksheets and a scan read in one of them are in that language throughout.

### Changed

- With core 1.15, a clause follows core's WCAG grading: where only WAI-ARIA or the HTML content model is broken, its ARIA and HTML structure rules ask instead of failing, and `aria-owns-valid` no longer counts toward 9.4.1.2, as core maps it to 1.3.1 only.

## [1.1.0] - 2026-10-26

Needs `@surea11y/core` 1.14.0 for the changes below; with 1.13 the pack behaves as 1.0.1 does, as 1.13 ignores the options it now gives.

### Fixed

- Under the `en301549-v3.2.1` profile, a duplicate id keeps failing 9.4.1.1 with core 1.14. Core 1.14 follows the 2023 errata to WCAG 2.0 and 2.1, which count 4.1.1 Parsing as satisfied, unless the profile says its standard keeps the criterion's text; V3.2.1 does, and its profile now says so (`keepsParsing: true`). Without it, core 1.14 asks about a duplicate id there instead of failing it, and warns once that the profile loses 4.1.1.

### Changed

- A clause's result is `notApplicable` only where the WCAG rollup of the criterion it restates is, as core 1.14.0 judges WCAG's (`applicability: 'wcag'`): where core's rules don't see every case the criterion applies to and all of them found nothing, the clause is `cantTell` (`composite.rollup.cantTell.partialCoverage`), so 9.1.2.2 agrees with WCAG 1.2.2 in the same report. Clauses about links, form fields, focusable elements, labelled components, pointer targets and markup stay `notApplicable` when there is nothing to check. Under `mappings: ['en301549']`, the WCAG rollups name the same clauses as before.
- No clause passes with core 1.14, as no WCAG criterion does: core's rules check only part of what each criterion asks, so a clause whose rules all pass is `cantTell` (`composite.rollup.cantTell.partialCheck`), for a person to check the rest.
- Developed and tested against core 1.14.0. Its new rules check their clauses with no change here, as the map is derived from core's catalog, and `docs/RULE_CATALOG.md` lists them: 9.1.4.5, 9.3.3.1 and 9.4.1.3 get their first rules (`image-of-text`, `invalid-field-error-message`, `live-region-announcements`), and `click-handler-keyboard-operable`, `widget-keyboard-focusable`, `focus-not-removed-by-script`, `moving-content-pausable`, `aria-owns-valid` and `aria-expanded-state-mismatch` join the clauses of their criteria.

## [1.0.1] - 2026-10-20

### Changed

- Supports Node 22.13.0 or later, and is tested on Node 22, 24 and 26.

## [1.0.0] - 2026-10-19

### Added

- EN 301 549 chapter 9 (Web) as a pack for `@surea11y/core`, taken from core, which had it built in up to 1.12: the clause table for V3.2.1 and V4.1.1, published as `@surea11y/pack-en301549/public` with the exports `@surea11y/core/en301549` had; the clauses each of core's rules checks, derived from its WCAG criteria; `engineOptions.mappings: ['en301549']` (or `'en301549:V3.2.1'`, `'en301549:V4.1.1'`), which names on each result the entries core 1.12.1 named; one result per clause; and the profiles `en301549-v4.1.1` and `en301549-v3.2.1`, which run only the rules that check one of the version's clauses and report its clauses alone, judged by WCAG 2.2 and 2.1. Needs core 1.13.0 or later, where a scan given the pack uses it in place of core's deprecated built-in.
