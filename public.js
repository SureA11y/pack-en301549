/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * The EN 301 549 chapter 9 clause for each WCAG Success Criterion, per
 * version of the standard: the table the pack builds its requirements and
 * rule map from, published so tools can ask the reverse question, such as
 * which criteria a given version requires, and which of them a scan never
 * covered.
 *
 *   const { EN301549_CLAUSES, en301549ClausesForSc } = require('@surea11y/pack-en301549/public');
 *   Object.keys(EN301549_CLAUSES['V3.2.1']); // the 50 WCAG 2.1 A and AA criteria V3.2.1 restates
 *   en301549ClausesForSc('2.5.8');           // [{ version: 'V4.1.1', clause: '9.2.5.8', title: 'Target size (minimum)' }]
 *
 * The same exports @surea11y/core/en301549 had up to core 1.12. The objects
 * are frozen: they are the pack's own table, not copies.
 */

const { EN301549_VERSIONS, EN301549_CLAUSES, en301549ClausesForSc } = require('./clauses');

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

deepFreeze(EN301549_VERSIONS);
deepFreeze(EN301549_CLAUSES);

module.exports = { EN301549_VERSIONS, EN301549_CLAUSES, en301549ClausesForSc };
