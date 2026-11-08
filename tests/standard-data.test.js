'use strict';

/**
 * The pack's standard is built from data (core's format
 * surea11y-standard/1, standard-data.js), and a pack built on EN 301 549
 * starts from that data: standardDataOf(pack.standard) gives it, frozen, and
 * core's deriveStandard builds on it.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  standardDataOf,
  checkStandardData,
  deriveStandard,
  standardFromData,
  checkPack
} = require('@surea11y/core/pack');
const pack = require('..');
const { STANDARD_DATA } = require('../standard-data');
const { EN301549_CLAUSES } = require('../clauses');

test('the pack’s standard gives back its data, sound and frozen', () => {
  const data = standardDataOf(pack.standard);
  assert.ok(data, 'standardDataOf gives the data');
  assert.deepEqual(checkStandardData(data), []);
  assert.deepEqual(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(STANDARD_DATA)));
  assert.ok(Object.isFrozen(data) && Object.isFrozen(data.data['V4.1.1'].requirements));
  for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
    assert.equal(
      Object.keys(data.data[version].requirements).length,
      Object.keys(rows).length,
      version
    );
  }
  assert.deepEqual(checkPack(pack), []);
});

test('a standard built on it takes its clauses, rule map and procedures', () => {
  const base = standardDataOf(pack.standard);
  const clauses = Object.keys(base.data['V4.1.1'].requirements);
  const own = {
    format: 'surea11y-standard/1',
    key: 'eu-test',
    standard: 'EU Test',
    lang: 'en',
    options: { applicability: 'wcag', ruleMapped: false },
    versions: [
      { version: '1', wcagVersion: '2.2', basedOn: [{ standard: 'en301549', version: 'V4.1.1' }] }
    ],
    data: {
      1: {
        requirements: Object.fromEntries(
          clauses.map((id) => [id, { basedOn: [{ standard: 'en301549', id }] }])
        ),
        ruleMap: {}
      }
    },
    profiles: { 'eu-test-1': { version: '1', tags: ['eu-test'], mappedRules: true } }
  };
  const derived = deriveStandard([base], own);
  assert.deepEqual(checkStandardData(derived), []);
  const st = standardFromData(derived);
  const ids = (s, v) => s.composites().filter((c) => c.meta.version === v);
  assert.equal(ids(st, '1').length, ids(pack.standard, 'V4.1.1').length);
  const first = ids(st, '1')[0];
  const same = ids(pack.standard, 'V4.1.1')[0];
  assert.deepEqual(first.checksIds, same.checksIds);
  assert.equal(first.meta.title, same.meta.title);
  assert.deepEqual(first.meta.standardMappings[0].basedOn, [
    // The version is the one the derived version is built on, so it is left out.
    { standard: 'en301549', id: same.meta.criterion }
  ]);
  assert.deepEqual(
    Object.keys(st.procedures['1']),
    Object.keys(pack.standard.procedures['V4.1.1'])
  );
});
