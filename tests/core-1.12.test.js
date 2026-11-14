'use strict';

/**
 * The pack names what core 1.12.1 named with EN 301 549 built in: on every
 * scenario page of core's rules, each result of a scan with mappings:
 * ['en301549'] (and with V3.2.1 alone, at WCAG 2.1) carries the same WCAG and
 * EN 301 549 entries, in the same order, as core 1.12.1's own (installed as
 * core-1.12). So a tool that read core's clauses reads the pack's the same.
 *
 * Core's scenario pages come with its source, not its package, so the test
 * reads them from a checkout beside this one (../core), and is skipped
 * without one.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { runa11yCoreOnHtml } = require('./helpers/run.js');

const FIXTURES = path.join(__dirname, '..', '..', 'core', 'tests', 'fixtures');
let before = null;
try {
  before = require('core-1.12/testing');
} catch {
  before = null;
}
const skip =
  (!before && 'core-1.12 is not installed') ||
  (!fs.existsSync(FIXTURES) && 'no core checkout beside this one');

// Criteria core has mapped rules to since 1.12.1, on purpose: the WCAG
// entries for them, and the clauses restating them, are left out of the
// comparison; every other entry of those rules is still compared.
const ADDED_SINCE = {
  'mouse-only-event-handlers': ['2.1.3'], // core 1.14.0: AAA, no clause
  'css-focus-indicator-suppressed': ['1.4.11', '2.4.13'], // core 1.17.0: 1.4.11 is clause 9.1.4.11
  'focus-not-removed-by-script': ['2.4.13'], // core 1.17.0: AAA, no clause
  'iframe-focusable-content': ['2.1.3'], // core 1.17.0
  'server-side-image-map-absent': ['2.1.3'], // core 1.17.0
  'widget-keyboard-focusable': ['2.1.3'] // core 1.17.0
};

const entries = (r) => {
  const added = ADDED_SINCE[r.ruleId] || [];
  return JSON.stringify(
    ((r.meta && r.meta.normativeMappings) || [])
      .filter((m) =>
        m.standard === 'WCAG'
          ? !added.includes(m.requirement)
          : m.standard === 'EN 301 549' && !(m.wcagSc || []).some((sc) => added.includes(sc))
      )
      .map((m) => [m.standard, m.version || null, m.requirement, m.title || null, m.wcagSc || []])
  );
};

test('every result names the entries core 1.12.1 named', { skip }, () => {
  const pages = fs.readdirSync(FIXTURES).filter((f) => f.endsWith('-all-scenarios.html'));
  assert.ok(pages.length > 100);
  const cases = [
    [{ mappings: 'en301549' }, { mappings: 'en301549' }],
    [{ profile: 'en301549-v3.2.1' }, { mappings: 'en301549:V3.2.1', wcagVersion: '2.1' }]
  ];
  let compared = 0;
  const differences = [];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(FIXTURES, page), 'utf8');
    for (const [then, now] of cases) {
      const a = before.runa11yCoreOnHtml(html, { engineOptions: then, entryPointParity: false });
      const b = runa11yCoreOnHtml(html, { engineOptions: now, entryPointParity: false });
      const byId = new Map(b.checksResults.concat(b.rulesResults).map((r) => [r.ruleId, r]));
      for (const r of a.checksResults.concat(a.rulesResults)) {
        const same = byId.get(r.ruleId);
        if (!same) continue;
        compared++;
        if (entries(r) !== entries(same)) differences.push(`${page} ${r.ruleId}`);
      }
    }
  }
  assert.ok(compared > 10000, `${compared} results compared`);
  assert.deepEqual(differences.slice(0, 20), []);
});
