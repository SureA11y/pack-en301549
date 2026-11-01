# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- How a person checks each clause by hand: with core 1.15 and later, `proceduresFor('9.1.4.3', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' })` gives the procedures of the WCAG criterion the clause restates, in both versions and every language core has them. Core gives procedures for the criteria its rules evaluate, so a clause has them where its criterion does; one whose criterion no core rule evaluates lists its facets with no procedure. The pack gives them from its clause table through core's kit, with no text of its own; an older core gives none and ignores them.
- The clauses in the standard's order, for reading it whole: with core 1.15 and later, `listProcedures({ packs: [en301549], standard: 'en301549' })` and `procedureChecklist` give every clause of a version under the principles and guidelines it is numbered by, as WCAG's are (9.1 Perceivable, 9.1.1 Text alternatives). Every clause is in exactly one group (`groups.js`). `relatedRequirements('1.4.3', { packs: [en301549] })` gives the clause that restates the criterion, and the reverse.
- With core 1.15 and later, a V4.1.1 list of procedures says in its header which edition is cited where, and that Annex C gives each clause's formal test (`standard.notes`).
- The standard in French, German, Spanish and Japanese as well as English, with core 1.15 and later: its clauses' and groups' titles and V4.1.1's note, keyed by the English they translate (`standard.lang: 'en'` and `standard.translations`, from `i18n/standard.<locale>.json`). Read in one of them, `listProcedures`, `procedureChecklist`, `proceduresFor` and a page made from them are in that language throughout, core's procedures of the chapter 9 clauses included, and a scan names the clauses in it; in a language the standard doesn't have, they are all in English. Clause titles follow UNE-EN 301549 in Spanish and DIN EN 301549 in German where those give them, and chapter 9's are WCAG's criteria as core names them. An older core ignores the translations. The HTML report's note above the clauses now names a clause as the translations do, « article » in French and 箇条 in Japanese, where it said « clause » and 条項.
- `standard-to-review.json` records the translations to check again because their English changed after they were made, each under the English as it is now with the English it was made from, and `npm run translations:review` lists them with the translation (`-- --json` for tools). A test fails on an entry no translation has or whose English is unchanged. It is for maintaining the translations and is not published.

The standard's own requirements (chapter 4, 9.6, 9.7, chapters 5 to 8, 10 to 13 and chapter 12) restate no WCAG criterion and no rule evaluates them, so the pack gives no procedures for them: a pack gives procedures for what its rules evaluate.

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
