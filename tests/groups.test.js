'use strict';

/**
 * The standard's groups (groups.js), which put its requirements in its
 * chapters, and chapter 9's under WCAG's principles and guidelines; and the
 * WCAG criteria each chapter 4 statement relates to (relatesTo, in
 * own-procedures.js). Core 1.15 lists the procedures in these groups and
 * reads relatesTo both ways; with an older core the pack gives neither, and
 * the tests that read them through core say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const { EN301549_CLAUSES } = require('../clauses');
const { OWN_PROCEDURES } = require('../own-procedures');
const { REQUIREMENTS } = require('../requirements');
const { groupsOf } = require('../groups');
const pack = require('..');

const lists = typeof core.listProcedures === 'function' && !!pack.standard.groups;
const skip = lists ? false : 'this core lists no procedures (core 1.15 does)';

// Every requirement of each version, chapter 9's and the standard's own.
const ALL = Object.fromEntries(
  Object.keys(REQUIREMENTS).map((v) => [v, { ...REQUIREMENTS[v], ...OWN_PROCEDURES[v] }])
);
const GROUPS = groupsOf(ALL);

const placed = (groups) =>
  groups.flatMap((g) => (g.requirements || []).concat(placed(g.groups || [])));

test('every requirement is in exactly one group, in the standard’s order', () => {
  for (const [version, requirements] of Object.entries(ALL)) {
    const ids = placed(GROUPS[version]);
    assert.equal(new Set(ids).size, ids.length, `${version}: a requirement in two groups`);
    assert.deepEqual(ids.slice().sort(), Object.keys(requirements).sort(), version);
  }
});

test('the groups are the chapters, and chapter 9’s principles and guidelines', () => {
  for (const version of Object.keys(ALL)) {
    const groups = GROUPS[version];
    assert.deepEqual(
      groups.map((g) => g.id),
      ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
      version
    );
    // A chapter the pack gives as one requirement is a group of that one.
    for (const g of groups.filter((x) => !['4', '9', '12'].includes(x.id))) {
      assert.deepEqual(g.requirements, [g.id]);
      assert.equal(g.title, OWN_PROCEDURES[version][g.id].title);
    }
    const web = groups.find((g) => g.id === '9');
    assert.equal(web.title, 'Web');
    // Its principles, then its own requirements, each a group of that one.
    assert.deepEqual(
      web.groups.map((p) => [p.id, p.title, p.requirements || []]),
      [
        ['9.1', 'Perceivable', []],
        ['9.2', 'Operable', []],
        ['9.3', 'Understandable', []],
        ['9.4', 'Robust', []],
        ['9.6', 'WCAG conformance requirements', ['9.6']],
        ...(version === 'V4.1.1' ? [['9.7', 'User preferences for web pages', ['9.7']]] : [])
      ]
    );
    const keyboard = web.groups[1].groups[0];
    assert.deepEqual([keyboard.id, keyboard.title], ['9.2.1', 'Keyboard accessible']);
    // Each clause under the guideline its number says.
    for (const p of web.groups.slice(0, 4)) {
      for (const g of p.groups) {
        for (const id of g.requirements) assert.ok(id.startsWith(`${g.id}.`), `${version} ${id}`);
      }
    }
  }
  assert.equal(
    GROUPS['V3.2.1'].find((g) => g.id === '12').title,
    'Documentation and support services'
  );
  assert.equal(
    GROUPS['V4.1.1'].find((g) => g.id === '12').title,
    'Information about products and services'
  );
  // 9.4.1.1 Parsing is in V3.2.1 only.
  const robust = (v) => GROUPS[v].find((g) => g.id === '9').groups[3].groups[0].requirements;
  assert.ok(robust('V3.2.1').includes('9.4.1.1'));
  assert.ok(!robust('V4.1.1').includes('9.4.1.1'));
});

test('9.6 relates to the criteria its non-interference names', () => {
  for (const [version, rows] of Object.entries(OWN_PROCEDURES)) {
    const entry = rows['9.6'];
    const steps = entry.facets.find((f) => f.id === 'non-interference').steps.join(' ');
    assert.deepEqual(entry.relatesTo, ['1.4.2', '2.1.2', '2.2.2', '2.3.1'], version);
    for (const sc of entry.relatesTo) {
      assert.ok(steps.includes(EN301549_CLAUSES[version][sc].clause), `${version} ${sc}`);
    }
  }
});

test('a chapter 4 statement relates to the criteria of the clauses its procedure names', () => {
  for (const [version, rows] of Object.entries(OWN_PROCEDURES)) {
    for (const [id, entry] of Object.entries(rows)) {
      const at = `${version} ${id}`;
      if (id === '9.6') continue;
      const related = entry.facets.find((f) => f.id === 'related-clauses');
      if (!related) {
        assert.equal(entry.relatesTo, undefined, at);
        continue;
      }
      assert.ok(id.startsWith('4.'), at);
      assert.ok(entry.relatesTo.length > 0, at);
      assert.equal(new Set(entry.relatesTo).size, entry.relatesTo.length, at);
      // Each a criterion one of the version's clauses restates, named in the
      // procedure's steps as that clause.
      const steps = related.steps.join(' ');
      for (const sc of entry.relatesTo) {
        const clause = EN301549_CLAUSES[version][sc];
        assert.ok(clause, `${at}: ${sc} is no criterion ${version} restates`);
        assert.ok(steps.includes(clause.clause), `${at}: ${clause.clause} not named`);
      }
    }
  }
});

test('core lists the standard in its chapters', { skip }, () => {
  for (const version of Object.keys(ALL)) {
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
  // Only what a person checks with a screen reader, in its chapters.
  const sr = core.listProcedures({ packs: [pack], standard: 'en301549', tools: 'screen-reader' });
  assert.ok(sr.groups.some((g) => g.id === '4') && sr.groups.some((g) => g.id === '9'));
});

test('core relates the clauses and the statements to WCAG, both ways', { skip }, () => {
  const to143 = core
    .relatedRequirements('1.4.3', { packs: [pack] })
    .map((r) => [r.id, r.version, r.relation]);
  assert.deepEqual(to143, [
    ['4.2.2', 'V4.1.1', 'relatesTo'],
    ['9.1.4.3', 'V4.1.1', 'restates']
  ]);
  assert.deepEqual(
    core.relatedRequirements('4.2.2', { packs: [pack], standard: 'en301549' }).map((r) => r.id),
    OWN_PROCEDURES['V4.1.1']['4.2.2'].relatesTo
  );
  assert.deepEqual(
    core
      .relatedRequirements('9.1.4.3', { packs: [pack], standard: 'en301549' })
      .map((r) => [r.id, r.relation]),
    [['1.4.3', 'restates']]
  );
  // A chapter relates to no criterion.
  assert.deepEqual(core.relatedRequirements('5', { packs: [pack], standard: 'en301549' }), []);
});
