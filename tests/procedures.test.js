'use strict';

/**
 * How a person assesses each requirement by hand (core's
 * standard.procedures, docs/PROCEDURES.md in core), in both versions: every
 * chapter 9 clause restates one WCAG criterion, so it takes that criterion's
 * procedures, and the standard's own requirements give theirs
 * (own-procedures.js). Core 1.15 reads them; with an older core the pack
 * gives none, and these tests say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const { EN301549_CLAUSES } = require('../clauses');
const { OWN_PROCEDURES } = require('../own-procedures');
const pack = require('..');

const reads = typeof core.proceduresFor === 'function' && !!pack.standard.procedures;
const skip = reads ? false : 'this core reads no procedures (core 1.15 does)';

test('every clause of each version takes the procedures of its criterion', { skip }, () => {
  const { procedures } = pack.standard;
  assert.deepEqual(Object.keys(procedures).sort(), Object.keys(EN301549_CLAUSES).sort());
  for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
    const expected = {};
    for (const [sc, { clause, title }] of Object.entries(rows)) {
      expected[clause] = { title, wcag: sc };
    }
    const own = OWN_PROCEDURES[version] || {};
    assert.deepEqual(procedures[version], { ...expected, ...own }, version);
    // No own requirement is a chapter 9 clause.
    for (const id of Object.keys(own)) assert.ok(!expected[id], `${version} ${id}`);
  }
});

test('core reads every clause with its criterion’s procedures, complete', { skip }, () => {
  let n = 0;
  for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
    for (const [sc, { clause, title }] of Object.entries(rows)) {
      const r = core.proceduresFor(clause, { packs: [pack], standard: 'en301549', version });
      assert.equal(r.standard, 'EN 301 549', clause);
      assert.equal(r.version, version);
      assert.equal(r.title, title);
      assert.equal(r.wcag, sc);
      assert.equal(r.complete, true, `${version} ${clause}`);
      assert.deepEqual(r.facets, core.proceduresFor(sc).facets);
      n++;
    }
  }
  assert.ok(n > 100, `only ${n} clauses`);
  // The latest version by default, and by the standard's name.
  assert.equal(
    core.proceduresFor('9.2.5.8', { packs: [pack], standard: 'EN 301 549' }).version,
    'V4.1.1'
  );
  assert.equal(
    core.proceduresFor('9.4.1.1', { packs: [pack], standard: 'en301549' }).version,
    'V3.2.1'
  );
});

test('core reads each of the standard’s own requirements with its own facets', { skip }, () => {
  for (const [version, rows] of Object.entries(OWN_PROCEDURES)) {
    for (const [id, { title, facets }] of Object.entries(rows)) {
      const r = core.proceduresFor(id, { packs: [pack], standard: 'en301549', version });
      assert.equal(r.standard, 'EN 301 549', id);
      assert.equal(r.version, version);
      assert.equal(r.title, title);
      assert.equal(r.wcag, undefined);
      assert.equal(r.complete, true);
      assert.deepEqual(r.rules, []);
      assert.deepEqual(
        r.facets.map((f) => [f.id, f.label, f.procedure, f.tools.map((t) => t.id), f.rules]),
        facets.map((f) => [
          f.id,
          f.label,
          { steps: f.steps, passWhen: f.passWhen, failWhen: f.failWhen },
          f.tools || [],
          []
        ]),
        `${version} ${id}`
      );
      for (const f of facets)
        assert.match(f.failWhen, /fails (EN 301 549|the clause of EN 301 549)/);
    }
  }
  // A requirement a version lacks gives nothing in it.
  assert.equal(
    core.proceduresFor('12.1.2', { packs: [pack], standard: 'en301549', version: 'V4.1.1' }),
    null
  );
  assert.equal(
    core.proceduresFor('12.1', { packs: [pack], standard: 'en301549', version: 'V3.2.1' }),
    null
  );
});
