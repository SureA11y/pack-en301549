/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * Which clauses each of core's rules checks, per version of EN 301 549.
 *
 * Chapter 9 restates WCAG one criterion at a time, so a rule checks the
 * clause of each WCAG criterion it maps to, in every version that has that
 * clause: duplicate-id (4.1.1) checks 9.4.1.1 in V3.2.1 and nothing in
 * V4.1.1, where the clause is void. The map is derived from the installed
 * core's rule catalog rather than written out, so a rule core adds or maps
 * anew is checked under the standard's profiles with no change here. A rule
 * that maps to no Level A or AA criterion (a best practice, an AAA check)
 * checks no clause and is not listed.
 *
 * RULE_REQUIREMENTS: { 'V4.1.1': { 'img-alt-present': { requirements:
 *   ['9.1.1.1'], note } } }
 */

const { getChecksCatalog } = require('@surea11y/core');
const { VERSIONS, REQUIREMENTS } = require('./requirements');

// Per version, the clause that restates each criterion: { '1.4.3': '9.1.4.3' }.
const CLAUSE_OF = Object.fromEntries(
  VERSIONS.map(({ version }) => [
    version,
    Object.fromEntries(
      Object.entries(REQUIREMENTS[version]).map(([clause, { wcagSc }]) => [wcagSc[0], clause])
    )
  ])
);

function rowsFor(version, catalog) {
  const rows = {};
  for (const { ruleId, wcagSc } of catalog) {
    const pairs = (Array.isArray(wcagSc) ? wcagSc : [])
      .map((sc) => [String(sc), CLAUSE_OF[version][String(sc)]])
      .filter(([, clause]) => clause);
    if (!pairs.length) continue;
    rows[ruleId] = {
      requirements: [...new Set(pairs.map(([, clause]) => clause))],
      note: pairs.map(([sc, clause]) => `${clause} restates WCAG ${sc}.`).join(' ')
    };
  }
  return rows;
}

const CATALOG = getChecksCatalog().map((r) => ({ ruleId: r.ruleId, wcagSc: r.wcagSc }));

const RULE_REQUIREMENTS = Object.fromEntries(
  VERSIONS.map(({ version }) => [version, rowsFor(version, CATALOG)])
);

module.exports = { RULE_REQUIREMENTS, rowsFor };
