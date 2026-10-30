'use strict';

/**
 * How a person assesses each clause by hand: every chapter 9 clause restates
 * one WCAG criterion, so it takes that criterion's procedures (core's
 * standard.procedures, docs/PROCEDURES.md in core), in both versions. Core
 * 1.15 reads them; with an older core the pack gives none, and these tests
 * say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const { EN301549_CLAUSES } = require('../clauses');
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
    assert.deepEqual(procedures[version], expected, version);
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
