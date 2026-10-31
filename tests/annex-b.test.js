'use strict';

/**
 * Annex B of EN 301 549 V4.1.1 as data (annex-b.js): the clauses Table B.2
 * marks P and S for each clause 4.2 criterion. docs/annex-b-v4.1.1.md gives
 * the same lists with their pages; these tests keep the two the same.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('fs');
const path = require('path');

const { ANNEX_B } = require('../annex-b');
const { EN301549_CLAUSES } = require('../clauses');

const DOC = readFileSync(path.join(__dirname, '..', 'docs', 'annex-b-v4.1.1.md'), 'utf8');
const CRITERIA = Array.from({ length: 11 }, (_, i) => `4.2.${i + 1}`);

const TITLES = {
  '4.2.1': 'Usage without vision',
  '4.2.2': 'Usage with limited vision',
  '4.2.3': 'Usage without perception of colour',
  '4.2.4': 'Usage without hearing',
  '4.2.5': 'Usage with limited hearing',
  '4.2.6': 'Usage with no or limited vocal capability',
  '4.2.7': 'Usage with limited manipulation or strength',
  '4.2.8': 'Usage with limited reach',
  '4.2.9': 'Minimize photosensitive seizure triggers',
  '4.2.10': 'Usage with limited cognition, language or learning',
  '4.2.11': 'Privacy'
};

test('Annex B holds every clause 4.2 criterion of V4.1.1, and V4.1.1 only', () => {
  assert.deepEqual(Object.keys(ANNEX_B), ['V4.1.1']);
  assert.deepEqual(Object.keys(ANNEX_B['V4.1.1']), CRITERIA);
  for (const [id, row] of Object.entries(ANNEX_B['V4.1.1'])) {
    assert.match(row.column, /^[A-Z]+$/, id);
    assert.ok(row.primary.length > 0, id);
    for (const c of row.primary.concat(row.secondary)) {
      assert.match(c, /^(5|6|7|8|9|10|11|12|13)(\.\d+)+$/, `${id} ${c}`);
    }
  }
  assert.ok(Object.isFrozen(ANNEX_B['V4.1.1']['4.2.1'].primary));
});

test('no clause is both primary and secondary, or listed twice, for one criterion', () => {
  for (const [id, { primary, secondary }] of Object.entries(ANNEX_B['V4.1.1'])) {
    const all = primary.concat(secondary);
    assert.equal(new Set(all).size, all.length, id);
  }
});

test('every chapter 9 clause in it is a clause of V4.1.1, or 9.6 or 9.7', () => {
  const clauses = new Set(Object.values(EN301549_CLAUSES['V4.1.1']).map((c) => c.clause));
  clauses.add('9.6');
  clauses.add('9.7');
  for (const [id, { primary, secondary }] of Object.entries(ANNEX_B['V4.1.1'])) {
    for (const c of primary.concat(secondary).filter((x) => x.startsWith('9.'))) {
      assert.ok(clauses.has(c), `${id}: ${c} is no clause of V4.1.1`);
    }
  }
});

// '**Primary (176)**: p. 129: 5.1.2.1, 5.1.2.2; p. 130: 5.1.3.7' to its
// clauses, checking the count it gives.
function listed(section, label) {
  const m = section.match(new RegExp(`^\\*\\*${label} \\((\\d+)\\)\\*\\*: (.*)$`, 'm'));
  assert.ok(m, `no ${label} list`);
  const clauses = m[2].split('; ').flatMap((part) => {
    const [, list] = part.match(/^p\. \d+: (.*)$/);
    return list.split(', ');
  });
  assert.equal(clauses.length, Number(m[1]), `${label} count`);
  return clauses;
}

test('it matches the lists in docs/annex-b-v4.1.1.md', () => {
  const block = DOC.split('ANNEX_B_V4.1.1\n')[1].split('\nANNEX_C_TEST')[0].split('\n');
  assert.equal(block.length, CRITERIA.length);
  for (const [i, id] of CRITERIA.entries()) {
    const row = ANNEX_B['V4.1.1'][id];
    // The column, as Table B.1 gives it.
    const number = id.replace(/\./g, '\\.');
    const key = DOC.match(new RegExp(`^\\| (\\w+) +\\| [^|]+\\| ${number} +\\|$`, 'm'));
    assert.equal(key && key[1], row.column, `${id} column`);
    // The criterion's own section, with pages.
    const section = DOC.split(`\n## ${id} `)[1].split('\n## ')[0];
    assert.ok(section.startsWith(`${TITLES[id]} (column ${row.column})`), `${id} heading`);
    assert.deepEqual(listed(section, 'Primary'), [...row.primary], `${id} primary`);
    assert.deepEqual(listed(section, 'Secondary'), [...row.secondary], `${id} secondary`);
    // The hand-off block at the end.
    const [, at, primary, secondary] = block[i].match(/^(\S+) primary: (.*) \| secondary: (.*)$/);
    assert.equal(at, id);
    assert.deepEqual(primary.split(', '), [...row.primary], `${id} block primary`);
    assert.deepEqual(secondary.split(', '), [...row.secondary], `${id} block secondary`);
  }
});
