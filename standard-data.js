/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * EN 301 549 as standard data (core's format surea11y-standard/1): its
 * versions, chapter 9's clauses, the rule map, the groups, the notes and the
 * profiles, in one plain object. The pack's standard is built from it
 * (core's standardFromData), and a pack built on EN 301 549 starts from it
 * (core's deriveStandard), reading it from the pack:
 *
 *   const { standardDataOf, deriveStandard } = require('@surea11y/core/pack');
 *   const base = standardDataOf(require('@surea11y/pack-en301549').standard);
 *
 * The rule map is derived from the installed core's catalog (rule-map.js),
 * so a rule core adds is in it with no change here.
 */

const { VERSIONS, REQUIREMENTS } = require('./requirements');
const { RULE_REQUIREMENTS } = require('./rule-map');
const { groupsOf } = require('./groups');

const NAMESPACE = 'en301549';
const STANDARD = 'EN 301 549';

const wcagVersionOf = (v) => VERSIONS.find((x) => x.version === v).wcagVersion;

// What a page of a version's procedures says first, in its header.
const NOTES = {
  'V4.1.1': [
    "EN 301 549 V4.1.1 was published on 2 September 2026. Until it is cited in the Official Journal of the European Union, V3.2.1 remains the edition cited under the Web Accessibility Directive, and no edition is yet cited under the European Accessibility Act. Say which edition you tested against in every report. Annex C of the standard gives the formal test for each clause; these procedures expand on it and don't replace it."
  ]
};

// EN 301 549 alone: the rules that check one of the version's clauses
// (mappedRules), and nothing else, so results hold its clauses and no WCAG
// criteria. With no WCAG tag to imply it, the profile names the WCAG version
// the standard's version is built on, so 4.1.1 Parsing counts under V3.2.1
// and not under V4.1.1. V3.2.1 keeps 4.1.1's text (clause 9.4.1.1), which
// the 2023 errata to WCAG 2.1 don't amend, so it says keepsParsing: a
// duplicate id under it still fails, where it would be asked about.
const profile = (v) => ({
  version: v,
  tags: [NAMESPACE],
  mappedRules: true,
  wcagVersion: wcagVersionOf(v),
  ...(wcagVersionOf(v) === '2.2' ? {} : { keepsParsing: true })
});

// The groups are chapter 9's principles and guidelines, by number, of every
// clause of the version (groups.js).
const GROUPS = groupsOf(REQUIREMENTS);

const STANDARD_DATA = {
  format: 'surea11y-standard/1',
  key: NAMESPACE,
  standard: STANDARD,
  lang: 'en',
  // Every clause restates its WCAG criterion: it takes the criterion's
  // procedures, and is notApplicable only where the criterion's WCAG rollup
  // is.
  options: { applicability: 'wcag', ruleMapped: false },
  versions: VERSIONS,
  data: Object.fromEntries(
    VERSIONS.map(({ version }) => [
      version,
      {
        groups: GROUPS[version],
        requirements: REQUIREMENTS[version],
        ruleMap: RULE_REQUIREMENTS[version] || {},
        ...(NOTES[version] ? { notes: NOTES[version] } : {})
      }
    ])
  ),
  profiles: {
    'en301549-v4.1.1': profile('V4.1.1'),
    'en301549-v3.2.1': profile('V3.2.1')
  }
};

module.exports = { STANDARD_DATA, NAMESPACE, STANDARD };
