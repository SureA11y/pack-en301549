# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- How a person checks each clause by hand: with core 1.15 and later, `proceduresFor('9.1.4.3', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' })` gives the procedures of the WCAG criterion the clause restates, in both versions and every language core has them. The pack gives them from its clause table through core's kit, with no text of its own; an older core gives none and ignores them.
- How a person assesses EN 301 549's own requirements by hand, the ones that restate no WCAG criterion: with core 1.15 and later, `proceduresFor('4.2.1', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' })` reads them in the shape of a clause's. They cover chapter 4's functional performance statements (`4.2.1` to `4.2.11`), chapter 12 (`12.1.1` to `12.2.4` in V3.2.1, `12.1` to `12.5` in V4.1.1, which renumbered it) and chapters 5, 6, 7, 8, 10, 11 and 13 by number (`'5'`), in both versions, each with the version's own title. A chapter 4 statement sends the person to the chapter 9 clauses Annex B relates to it and adds whole tasks done the way a person with that need does them; a chapter starts by deciding whether it applies. They are in English, as core gives a pack's own procedures, and add no rule, rollup, profile entry or result: with an older core the pack gives what it gave before.
- The standard's chapters, for reading it whole: with core 1.15 and later, `listProcedures({ packs: [en301549], standard: 'en301549' })` and `procedureChecklist` give every requirement of a version in its chapters, chapter 4's statements, chapter 12's requirements and each other chapter, with chapter 9's clauses under the principles and guidelines they are numbered by (9.1 Perceivable, 9.1.1 Text alternatives). Every requirement is in exactly one group (`groups.js`).
- Each chapter 4 statement names the WCAG criteria it relates to (`relatesTo`): those of the chapter 9 clauses its procedure sends the person to, from Annex B. With core 1.15 and later, `relatedRequirements('1.4.3', { packs: [en301549] })` gives 4.2.2 next to 9.1.4.3, and `relatedRequirements('4.2.2', { packs: [en301549], standard: 'en301549' })` its criteria.

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
