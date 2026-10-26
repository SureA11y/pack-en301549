# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Under the `en301549-v3.2.1` profile, a duplicate id keeps failing 9.4.1.1 with core 1.14. Core 1.14 follows the 2023 errata to WCAG 2.0 and 2.1, which count 4.1.1 Parsing as satisfied, unless the profile says its standard keeps the criterion's text; V3.2.1 does, and its profile now says so (`keepsParsing: true`). Without it, core 1.14 asks about a duplicate id there instead of failing it, and warns once that the profile loses 4.1.1. Core 1.13 and earlier ignore the key, so nothing changes with them.

### Changed

- Developed and tested against core 1.14.0. `docs/RULE_CATALOG.md` lists the rules core 1.14 adds under the clauses of their criteria, such as `image-of-text` under 9.1.4.5 and `live-region-announcements` under 9.4.1.3. Under 1.14, a WCAG rollup whose rules are all `notApplicable` can be `cantTell` instead (`composite.rollup.cantTell.partialCoverage`), and the clauses it names are the same.

## [1.0.1] - 2026-10-20

### Changed

- Supports Node 22.13.0 or later, and is tested on Node 22, 24 and 26.

## [1.0.0] - 2026-10-19

### Added

- EN 301 549 chapter 9 (Web) as a pack for `@surea11y/core`, taken from core, which had it built in up to 1.12: the clause table for V3.2.1 and V4.1.1, published as `@surea11y/pack-en301549/public` with the exports `@surea11y/core/en301549` had; the clauses each of core's rules checks, derived from its WCAG criteria; `engineOptions.mappings: ['en301549']` (or `'en301549:V3.2.1'`, `'en301549:V4.1.1'`), which names on each result the entries core 1.12.1 named; one result per clause; and the profiles `en301549-v4.1.1` and `en301549-v3.2.1`, which run only the rules that check one of the version's clauses and report its clauses alone, judged by WCAG 2.2 and 2.1. Needs core 1.13.0 or later, where a scan given the pack uses it in place of core's deprecated built-in.
