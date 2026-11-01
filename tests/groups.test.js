'use strict';

/**
 * The standard's groups (groups.js), which put its chapter 9 clauses under
 * WCAG's principles and guidelines, as the standard numbers them; and each
 * clause's relation to the criterion it restates. The standard's own
 * requirements, which no rule evaluates, have no procedures in the pack, so
 * no group either. Core 1.15 lists the procedures in these groups and reads
 * the relations both ways; with an older core the pack gives neither, and
 * the tests that read them through core say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const { REQUIREMENTS } = require('../requirements');
const { groupsOf } = require('../groups');
const pack = require('..');

const lists = typeof core.listProcedures === 'function' && !!pack.standard.groups;
const skip = lists ? false : 'this core lists no procedures (core 1.15 does)';

const GROUPS = groupsOf(REQUIREMENTS);

const placed = (groups) =>
  groups.flatMap((g) => (g.requirements || []).concat(placed(g.groups || [])));

test('every requirement is in exactly one group, in the standard’s order', () => {
  for (const [version, requirements] of Object.entries(REQUIREMENTS)) {
    const ids = placed(GROUPS[version]);
    assert.equal(new Set(ids).size, ids.length, `${version}: a requirement in two groups`);
    assert.deepEqual(ids.slice().sort(), Object.keys(requirements).sort(), version);
  }
});

test('chapter 9 is grouped by its principles and guidelines', () => {
  for (const version of Object.keys(REQUIREMENTS)) {
    const groups = GROUPS[version];
    assert.deepEqual(
      groups.map((g) => [g.id, g.title]),
      [['9', 'Web']],
      version
    );
    const web = groups[0];
    assert.deepEqual(
      web.groups.map((p) => [p.id, p.title]),
      [
        ['9.1', 'Perceivable'],
        ['9.2', 'Operable'],
        ['9.3', 'Understandable'],
        ['9.4', 'Robust']
      ]
    );
    const keyboard = web.groups[1].groups[0];
    assert.deepEqual([keyboard.id, keyboard.title], ['9.2.1', 'Keyboard accessible']);
    // Each clause under the guideline its number says.
    for (const p of web.groups) {
      for (const g of p.groups) {
        for (const id of g.requirements) assert.ok(id.startsWith(`${g.id}.`), `${version} ${id}`);
      }
    }
  }
  // 9.4.1.1 Parsing restates 4.1.1 in V3.2.1, and is void in V4.1.1.
  const robust = (v) => GROUPS[v][0].groups[3].groups[0].requirements;
  assert.equal(robust('V3.2.1')[0], '9.4.1.1');
  assert.equal(robust('V4.1.1')[0], '9.4.1.2');
});

test('a chapter of several requirements needs its title', () => {
  assert.throws(
    () => groupsOf({ 'V4.1.1': { 4.1: { title: 'x' }, 4.2: { title: 'y' } } }),
    /chapter 4 of V4\.1\.1 needs a title/
  );
  // A chapter given as one requirement is a group of that one, titled as it.
  assert.deepEqual(groupsOf({ 'V4.1.1': { 5: { title: 'Generic requirements' } } }), {
    'V4.1.1': [{ id: '5', title: 'Generic requirements', requirements: ['5'] }]
  });
});

test('core lists the standard in its groups', { skip }, () => {
  for (const version of Object.keys(REQUIREMENTS)) {
    const list = core.listProcedures({ packs: [pack], standard: 'en301549', version });
    assert.equal(list.version, version);
    assert.deepEqual(
      placed(list.groups).sort(),
      list.requirements.map((r) => r.id).sort(),
      version
    );
    assert.deepEqual(
      list.groups.map((g) => [g.id, g.title]),
      GROUPS[version].map((g) => [g.id, g.title])
    );
  }
  // Only what a person checks with a screen reader, in its groups.
  const sr = core.listProcedures({ packs: [pack], standard: 'en301549', tools: 'screen-reader' });
  assert.deepEqual(
    sr.groups.map((g) => g.id),
    ['9']
  );
});

test('core relates each clause to the criterion it restates, both ways', { skip }, () => {
  assert.deepEqual(
    core.relatedRequirements('1.4.3', { packs: [pack] }).map((r) => [r.id, r.version, r.relation]),
    [['9.1.4.3', 'V4.1.1', 'restates']]
  );
  assert.deepEqual(
    core
      .relatedRequirements('9.1.4.3', { packs: [pack], standard: 'en301549' })
      .map((r) => [r.id, r.relation]),
    [['1.4.3', 'restates']]
  );
  // The standard's own requirements have no procedures here, so no relation.
  assert.deepEqual(core.relatedRequirements('4.2.2', { packs: [pack], standard: 'en301549' }), []);
});
