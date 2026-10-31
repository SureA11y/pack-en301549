/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * EN 301 549, the European accessibility standard, as a pack for
 * @surea11y/core: chapter 9 (Web), which restates the WCAG Level A and AA
 * Success Criteria clause by clause, in V3.2.1 (built on WCAG 2.1, with
 * 9.4.1.1 Parsing) and V4.1.1 (built on WCAG 2.2).
 *
 * - A profile per version, en301549-v4.1.1 and en301549-v3.2.1, runs the
 *   rules that check one of that version's clauses, judged by the WCAG
 *   version it is built on, and reports one result per clause and no WCAG
 *   ones:
 *
 *     runDomRulesInPage(url, null, { packs: [en301549], profile: 'en301549-v4.1.1' })
 *
 * - engineOptions.mappings: ['en301549'] (or 'en301549:V4.1.1') names the
 *   clauses on the results of any other scan, a WCAG one say, as core did
 *   for itself up to 1.12.
 *
 * Every clause restates a WCAG criterion, so a rule names the clauses of its
 * criteria and a WCAG rollup the clause of its own, whichever of its rules
 * decided the outcome: what core's built-in table gave.
 */

const { definePack, ruleMappedStandard } = require('@surea11y/core/pack');
const { name, version } = require('./package.json');
const { VERSIONS, REQUIREMENTS } = require('./requirements');
const { RULE_REQUIREMENTS } = require('./rule-map');
const { en301549ClausesForSc } = require('./clauses');
const { OWN_PROCEDURES } = require('./own-procedures');
const { groupsOf } = require('./groups');

const NAMESPACE = 'en301549';
const STANDARD = 'EN 301 549';

const wcagVersionOf = (v) => VERSIONS.find((x) => x.version === v).wcagVersion;

// A rollup per clause, grouping the rules that check it, the checks of the
// two tables and, from core 1.15, the clauses' procedures, from core's kit. Each clause restates its WCAG criterion,
// so it is notApplicable only where the criterion's WCAG rollup is (core
// 1.14.0 and later; an older core ignores the option).
const { composites, validate, procedures } = ruleMappedStandard({
  standard: STANDARD,
  tag: NAMESPACE,
  versions: VERSIONS,
  requirements: REQUIREMENTS,
  ruleMap: RULE_REQUIREMENTS,
  applicability: 'wcag'
});

// The entries for a rule or a WCAG rollup: the clause that restates each of
// its WCAG criteria, in criterion order and oldest version first. A WCAG
// rollup's criterion is its own, so the 1.1.1 rollup is clause 9.1.1.1, and
// names it whichever of its rules decided. A pack's own rule is mapped by no
// other standard's criteria, so another pack's rule gains no clause.
function mappingsFor({ wcagSc }) {
  const out = [];
  for (const sc of Array.isArray(wcagSc) ? wcagSc : []) {
    for (const c of en301549ClausesForSc(sc)) {
      out.push({
        standard: STANDARD,
        version: c.version,
        requirement: c.clause,
        title: c.title,
        wcagSc: [String(sc)]
      });
    }
  }
  return out;
}

// Each version's procedures: chapter 9's, then the standard's own
// requirements' (own-procedures.js).
const withOwnProcedures = (procedures) =>
  Object.fromEntries(
    VERSIONS.map(({ version }) => [
      version,
      { ...procedures[version], ...(OWN_PROCEDURES[version] || {}) }
    ])
  );

// EN 301 549 alone: the rules that check one of the version's clauses
// (mappedRules), and nothing else, so results hold its clauses and no WCAG
// criteria. With no WCAG tag to imply it, the profile names the WCAG version
// the standard's version is built on, so 4.1.1 Parsing counts under V3.2.1
// and not under V4.1.1. V3.2.1 keeps 4.1.1's text (clause 9.4.1.1), which
// the 2023 errata to WCAG 2.1 don't amend, so it says keepsParsing: from core
// 1.14 a duplicate id under it then still fails, where it would be asked
// about. Core 1.13 and earlier ignore the key.
const profile = (v) => ({
  version: v,
  tags: [NAMESPACE],
  mappedRules: true,
  wcagVersion: wcagVersionOf(v),
  ...(wcagVersionOf(v) === '2.2' ? {} : { keepsParsing: true })
});

module.exports = definePack({
  name,
  version,
  namespace: NAMESPACE,
  // Core 1.12 and earlier refuse a second en301549 key; from 1.13 the pack
  // replaces core's deprecated built-in.
  core: '>=1.13.0',
  description:
    'EN 301 549 chapter 9 (Web), V3.2.1 and V4.1.1: a profile per version and a result per clause.',
  standard: {
    key: NAMESPACE,
    standard: STANDARD,
    versions: VERSIONS.map((v) => v.version),
    profiles: {
      'en301549-v4.1.1': profile('V4.1.1'),
      'en301549-v3.2.1': profile('V3.2.1')
    },
    ruleTag: NAMESPACE,
    mappingsFor,
    composites,
    validate,
    // How a person assesses each requirement by hand, from core 1.15 on: a
    // chapter 9 clause takes the procedures of the WCAG criterion it
    // restates, and the standard's own requirements (chapters 4, 12 and the
    // others) give theirs, with no rule or result; groups puts them in the
    // standard's chapters (groups.js). An older core gives none for chapter
    // 9, and the pack gives it neither, as before.
    ...(procedures
      ? {
          procedures: withOwnProcedures(procedures),
          groups: groupsOf(withOwnProcedures(procedures))
        }
      : {}),
    report: { noteKey: 'en301549_report_note' }
  },
  // The note above the standard's results in the HTML report, per locale.
  dictionaries: Object.fromEntries(
    ['de', 'en', 'es', 'fr', 'ja'].map((locale) => [locale, require(`./i18n/${locale}.json`)])
  )
});
