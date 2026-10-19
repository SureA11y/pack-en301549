# Changelog

All notable changes to this package are documented here. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Needs `@surea11y/core` 1.14.0; with 1.13 nothing changes.

### Changed

- A clause's result is `notApplicable` only where the WCAG rollup of the criterion it restates is, as core 1.14.0 judges WCAG's: where core's rules don't see every case the criterion applies to and all of them found nothing, the clause is `cantTell` (`composite.rollup.cantTell.partialCoverage`), so 9.1.2.2 agrees with WCAG 1.2.2 in the same report. Clauses about links, form fields, focusable elements, labelled components, pointer targets and markup stay `notApplicable` when there is nothing to check.
- Core 1.14.0's new rules check their clauses with no change here, as the map is derived from core's catalog: `click-handler-keyboard-operable` 9.2.1.1 and `moving-content-pausable` 9.2.2.2.

## [1.0.0] - 2026-10-17

### Added

- EN 301 549 chapter 9 (Web) as a pack for `@surea11y/core`, taken from core, which had it built in up to 1.12: the clause table for V3.2.1 and V4.1.1, published as `@surea11y/pack-en301549/public` with the exports `@surea11y/core/en301549` had; the clauses each of core's rules checks, derived from its WCAG criteria; `engineOptions.mappings: ['en301549']` (or `'en301549:V3.2.1'`, `'en301549:V4.1.1'`), which names on each result the entries core 1.12.1 named; one result per clause; and the profiles `en301549-v4.1.1` and `en301549-v3.2.1`, which run only the rules that check one of the version's clauses and report its clauses alone, judged by WCAG 2.2 and 2.1. Needs core 1.13.0 or later, where a scan given the pack uses it in place of core's deprecated built-in.
