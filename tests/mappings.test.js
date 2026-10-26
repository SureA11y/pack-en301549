'use strict';

/**
 * engineOptions.mappings with the pack: a scan of any selection names the
 * EN 301 549 clauses of each result's WCAG criteria when asked, by the whole
 * standard or by version, and a WCAG rollup names the clause of its own
 * criterion whichever rules decided. Without asking, a result names WCAG
 * only. Core kept these tests up to 1.12, when the table was its own.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { runa11yCoreOnHtml, clausesOf } = require('./helpers/run.js');

const HTML =
  '<!doctype html><html lang="en"><head><title>t</title></head><body><main>' +
  '<img src="a.png"></main></body></html>';

function captureWarnings(fn) {
  const original = console.warn;
  const warnings = [];
  console.warn = (msg) => warnings.push(String(msg));
  try {
    return { value: fn(), warnings };
  } finally {
    console.warn = original;
  }
}

const scan = (engineOptions, html = HTML) => runa11yCoreOnHtml(html, { engineOptions });
const atomic = (r) => r.checksResults.find((c) => c.ruleId === 'img-alt-present');
const composite = (r, sc) => r.rulesResults.find((c) => c.ruleId.startsWith(`wcag-${sc}-`));

test('with the pack and no mappings, a result names WCAG only', () => {
  const result = scan({});
  assert.equal('mappings' in result.engine, false);
  for (const r of result.checksResults.concat(result.rulesResults)) {
    assert.deepEqual(clausesOf(r), [], r.ruleId);
  }
});

test('naming the standard adds every version of each clause', () => {
  const result = scan({ mappings: ['en301549'] });
  assert.deepEqual(result.engine.mappings, ['en301549']);
  assert.deepEqual(clausesOf(atomic(result)), ['V3.2.1 9.1.1.1', 'V4.1.1 9.1.1.1']);
  assert.deepEqual(clausesOf(composite(result, '1.1.1')), ['V3.2.1 9.1.1.1', 'V4.1.1 9.1.1.1']);
  // The WCAG entry stays first.
  assert.equal(composite(result, '1.1.1').meta.normativeMappings[0].standard, 'WCAG');
});

test('naming a version adds only that version', () => {
  const result = scan({ mappings: 'en301549:V3.2.1' });
  assert.deepEqual(result.engine.mappings, ['en301549:V3.2.1']);
  assert.deepEqual(clausesOf(atomic(result)), ['V3.2.1 9.1.1.1']);
});

test('names and versions are matched case-insensitively and reported canonically', () => {
  assert.deepEqual(scan({ mappings: ' EN301549:v4.1.1 , en301549:V3.2.1' }).engine.mappings, [
    'en301549:V3.2.1',
    'en301549:V4.1.1'
  ]);
  assert.deepEqual(scan({ mappings: 'en301549:V4.1.1, en301549' }).engine.mappings, ['en301549']);
});

test('a WCAG rollup names the clause of its own criterion, in the versions that have it', () => {
  const result = scan({ mappings: 'en301549' });
  const versions = (sc) => clausesOf(composite(result, sc)).map((c) => c.split(' ')[0]);
  assert.deepEqual(versions('1.1.1'), ['V3.2.1', 'V4.1.1']);
  assert.deepEqual(versions('2.5.8'), ['V4.1.1']);
  assert.deepEqual(versions('4.1.1'), ['V3.2.1']);
  assert.deepEqual(versions('1.4.6'), []);
  // Not the other clauses its rules check: input-image-alt-present also
  // checks 4.1.2, and the 1.1.1 rollup is still only 9.1.1.1.
  assert.deepEqual(
    [...new Set(clausesOf(composite(result, '1.1.1')).map((c) => c.split(' ')[1]))],
    ['9.1.1.1']
  );
});

test('a WCAG rollup names its clause whichever rules decided, or when none applied', () => {
  for (const [html, sc, outcome] of [
    [HTML, '1.1.1', 'fail'],
    [HTML, '1.2.2', 'notApplicable']
  ]) {
    const c = composite(scan({ mappings: 'en301549' }, html), sc);
    // From core 1.14, a criterion whose rules don't find every case it
    // applies to is cantTell where they all are notApplicable.
    if (c.data.details.reasonCode === 'composite.rollup.cantTell.partialCoverage') {
      assert.equal(c.outcome, 'cantTell', sc);
    } else assert.equal(c.outcome, outcome, sc);
    assert.equal(clausesOf(c).length, 2, sc);
  }
});

test('an unknown version is ignored with a warning', () => {
  const { value, warnings } = captureWarnings(() =>
    scan({ mappings: ['en301549:V9.9.9', 'en301549:V3.2.1'] })
  );
  assert.deepEqual(value.engine.mappings, ['en301549:V3.2.1']);
  assert.ok(warnings.some((w) => w.includes('"en301549:V9.9.9"')));
});

test('a WCAG profile with mappings names the clauses, and runs what it ran', () => {
  const both = scan({ profile: 'wcag22-aa', mappings: 'en301549:V4.1.1' });
  const wcag = scan({ profile: 'wcag22-aa' });
  assert.equal(both.engine.profile, 'wcag22-aa');
  assert.deepEqual(
    both.checksResults.map((c) => [c.ruleId, c.outcome]),
    wcag.checksResults.map((c) => [c.ruleId, c.outcome])
  );
  assert.deepEqual(clausesOf(atomic(both)), ['V4.1.1 9.1.1.1']);
});
