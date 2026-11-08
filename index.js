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

const { definePack, standardFromData } = require('@surea11y/core/pack');
const { name, version } = require('./package.json');
const { STANDARD_DATA, NAMESPACE, STANDARD } = require('./standard-data');
const { en301549ClausesForSc } = require('./clauses');

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

// The standard's own text in French, German, Spanish and Japanese, keyed by
// the English it translates: its clauses' and chapters' titles and its
// notes (i18n/standard.<locale>.json). Core reads the standard in one of
// its languages, its procedures of the clauses that restate WCAG included.
const TRANSLATIONS = Object.fromEntries(
  ['de', 'es', 'fr', 'ja'].map((locale) => [locale, require(`./i18n/standard.${locale}.json`)])
);

module.exports = definePack({
  name,
  version,
  namespace: NAMESPACE,
  // The standard is built from data (core's standardFromData), experimental
  // in core until 1.18.0: a later minor may change it, so the range takes
  // none.
  core: '~1.16.0',
  description:
    'EN 301 549 chapter 9 (Web), V3.2.1 and V4.1.1: a profile per version and a result per clause.',
  // A rollup per clause, grouping the rules that check it, the clauses'
  // procedures, groups and notes, all from the standard's data
  // (standard-data.js), which a pack built on EN 301 549 starts from
  // (standardDataOf(pack.standard)).
  standard: standardFromData(STANDARD_DATA, {
    mappingsFor,
    report: { noteKey: 'en301549_report_note' },
    translations: TRANSLATIONS
  }),
  // The note above the standard's results in the HTML report, per locale.
  dictionaries: Object.fromEntries(
    ['de', 'en', 'es', 'fr', 'ja'].map((locale) => [locale, require(`./i18n/${locale}.json`)])
  )
});
