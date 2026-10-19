# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-19

### Added

- EN 301 549 chapter 9 (Web) as a pack for `@surea11y/core`, taken from core, which had it built in up to 1.12: the clause table for V3.2.1 and V4.1.1, published as `@surea11y/pack-en301549/public` with the exports `@surea11y/core/en301549` had; the clauses each of core's rules checks, derived from its WCAG criteria; `engineOptions.mappings: ['en301549']` (or `'en301549:V3.2.1'`, `'en301549:V4.1.1'`), which names on each result the entries core 1.12.1 named; one result per clause; and the profiles `en301549-v4.1.1` and `en301549-v3.2.1`, which run only the rules that check one of the version's clauses and report its clauses alone, judged by WCAG 2.2 and 2.1. Needs core 1.13.0 or later, where a scan given the pack uses it in place of core's deprecated built-in.
