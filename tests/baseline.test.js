'use strict';

/**
 * The pack gives what it gave when its baseline was recorded, with the core
 * it was recorded with (tests/helpers/baseline.js): its tables and standard,
 * the entries it names for each criterion, the scans the tests make, and how
 * core reads each chapter 9 clause's procedures in every locale. A
 * difference is a change in what the pack gives: look at it, never record
 * again. Core's scenario pages are in tests/baseline-scenarios-*.test.js.
 */

const test = require('node:test');
const { assert, b, recorded, skip } = require('./helpers/baseline-test.js');

// The report note's French and Japanese name a clause as the standard's
// translations do, « article » and 箇条 (i18n/standard.<locale>.json), where
// they said « clause » and 条項: compared without them.
const REWORDED = ['fr', 'ja'];
const withoutReworded = (facts) => {
  const out = JSON.parse(JSON.stringify(facts));
  for (const locale of REWORDED) {
    if (out.dictionaries && out.dictionaries[locale]) {
      delete out.dictionaries[locale].en301549_report_note;
    }
  }
  return out;
};

test('the pack holds what it held: tables, standard, mappings', { skip }, () => {
  // As written to the file: functions and undefined fields are not kept.
  assert.deepEqual(withoutReworded(b.packFacts()), withoutReworded(recorded.pack));
});

test('the tests’ pages scan as recorded, with every option', { skip }, () => {
  const now = b.pageScans();
  assert.deepEqual(Object.keys(now), Object.keys(recorded.pages));
  for (const [key, then] of Object.entries(recorded.pages)) {
    assert.deepEqual(now[key].outline, then.outline, key);
    assert.equal(now[key].hash, then.hash, key);
  }
});

// A clause's procedures are core's, read under the clause: a core whose own
// procedures have changed since (their wording, or how they name what fails)
// gives other ones, through no change in the pack.
const proceduresSkip =
  skip ||
  (recorded.coreProcedures !== undefined &&
    recorded.coreProcedures !== b.coreProcedures() &&
    `core ${b.CORE_VERSION}'s own procedures changed since its baseline was recorded`);

test(
  'core reads each chapter 9 clause’s procedures as recorded, in every locale',
  { skip: proceduresSkip },
  () => {
    const now = b.clauseProcedures();
    if (recorded.procedures === null) {
      assert.equal(now, null);
      return;
    }
    assert.ok(Object.keys(recorded.procedures).length > 500);
    for (const [key, hash] of Object.entries(recorded.procedures)) {
      assert.equal(now[key], hash, key);
    }
  }
);
