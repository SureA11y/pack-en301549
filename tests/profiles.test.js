'use strict';

/**
 * The pack's profiles, en301549-v4.1.1 and en301549-v3.2.1: EN 301 549
 * alone, the core rules that check one of the version's clauses, judged by
 * the WCAG version it is built on, with one result per clause and no WCAG
 * ones.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { getChecksCatalog } = require('@surea11y/core');
const { runa11yCoreOnHtml, pack } = require('./helpers/run.js');
const { RULE_REQUIREMENTS } = require('../rule-map');
const { REQUIREMENTS } = require('../requirements');

const PAGE =
  '<!doctype html><html lang="en"><head><title>Home</title></head><body><main>' +
  '<h1>Library</h1><img src="logo.png"><p id="a">Opening hours</p><p id="a">Access</p>' +
  '<button style="width:10px;height:10px;padding:0"></button></main></body></html>';

const PROFILES = { 'en301549-v4.1.1': 'V4.1.1', 'en301549-v3.2.1': 'V3.2.1' };

const scan = (profile, html = PAGE) => runa11yCoreOnHtml(html, { engineOptions: { profile } });
const ran = (result) => result.checksResults.map((c) => c.ruleId).sort();
const check = (result, id) => result.checksResults.find((c) => c.ruleId === id);
const rollup = (result, id) => result.rulesResults.find((r) => r.ruleId === id);

test('the pack has one profile per version, and each targets its version', () => {
  assert.deepEqual(Object.keys(pack.standard.profiles).sort(), Object.keys(PROFILES).sort());
  for (const [name, version] of Object.entries(PROFILES)) {
    assert.equal(pack.standard.profiles[name].version, version, name);
  }
});

test('each profile runs the core rules that check one of its clauses, and nothing else', () => {
  for (const [profile, version] of Object.entries(PROFILES)) {
    const result = scan(profile);
    assert.equal(result.engine.profile, profile);
    assert.deepEqual(ran(result), Object.keys(RULE_REQUIREMENTS[version]).sort(), profile);
    // No best-practice rule, and no AAA one, runs.
    assert.ok(!ran(result).includes('region'), profile);
    assert.ok(!ran(result).includes('contrast-enhanced'), profile);
  }
});

test('each profile reports its clauses and no WCAG criteria', () => {
  for (const [profile, version] of Object.entries(PROFILES)) {
    const result = scan(profile);
    assert.ok(result.rulesResults.length > 20, profile);
    for (const r of result.rulesResults) {
      assert.match(
        r.ruleId,
        new RegExp(`^en301549-${version.replace(/\./g, '\\.')}-9\\.`),
        profile
      );
      const [, clause] = r.ruleId.split(`${version}-`);
      assert.ok(REQUIREMENTS[version][clause], `${profile} ${r.ruleId}`);
    }
    assert.deepEqual(
      result.standards.map((s) => s.key),
      ['en301549']
    );
  }
});

test('a clause rollup names its clause, and its title is the version’s own', () => {
  const v4 = rollup(scan('en301549-v4.1.1'), 'en301549-V4.1.1-9.1.1.1');
  assert.equal(v4.outcome, 'fail');
  assert.equal(v4.title, 'Non-text content');
  assert.deepEqual(
    v4.meta.normativeMappings.map((m) => `${m.standard} ${m.version} ${m.requirement}`),
    ['EN 301 549 V4.1.1 9.1.1.1']
  );
  // V3.2.1 says "Captions" where V4.1.1 says "Subtitles".
  const titleOf = (id) => pack.standard.composites().find((c) => c.id === id && c.meta).meta.title;
  assert.equal(titleOf('en301549-V3.2.1-9.1.2.2'), 'Captions (pre-recorded)');
  assert.match(titleOf('en301549-V4.1.1-9.1.2.2'), /^Subtitles/);
});

test('V3.2.1 is judged by WCAG 2.1, so a duplicate id fails 9.4.1.1', () => {
  const result = scan('en301549-v3.2.1');
  assert.equal(result.engine.wcagVersion, '2.1');
  assert.equal(check(result, 'duplicate-id').outcome, 'fail');
  assert.equal(rollup(result, 'en301549-V3.2.1-9.4.1.1').outcome, 'fail');
});

test('V4.1.1 is judged by WCAG 2.2: 9.4.1.1 is void, and 2.5.8 has a clause', () => {
  const result = scan('en301549-v4.1.1');
  assert.equal(result.engine.wcagVersion, '2.2');
  assert.equal(check(result, 'duplicate-id'), undefined);
  assert.equal(rollup(result, 'en301549-V4.1.1-9.4.1.1'), undefined);
  assert.ok(check(result, 'target-size-minimum'), 'target-size-minimum runs');
  assert.ok(rollup(result, 'en301549-V4.1.1-9.2.5.8'));
  assert.equal(check(scan('en301549-v3.2.1'), 'target-size-minimum'), undefined);
});

test('a profile switches on its own version’s clauses on every rule', () => {
  for (const [profile, version] of Object.entries(PROFILES)) {
    const result = scan(profile);
    assert.deepEqual(result.engine.mappings, [`en301549:${version}`]);
    const img = check(result, 'img-alt-present');
    assert.deepEqual(
      img.meta.normativeMappings.filter((m) => m.standard === 'EN 301 549').map((m) => m.version),
      [version]
    );
  }
});

test('a rule reads the standard and version its profile targets as ctx.standard', () => {
  const probe = {
    id: 'en301549-probe',
    meta: { title: 'probe', tags: ['en301549'], wcagSc: [] },
    runInPage: `function runInPage(ctx) {
      return { outcome: ctx.standard && ctx.standard.version === 'V3.2.1' ? 'pass' : 'fail', occurrences: [] };
    }`
  };
  const result = runa11yCoreOnHtml(PAGE, {
    engineOptions: { profile: 'en301549-v3.2.1', customRules: [probe] },
    entryPointParity: false
  });
  assert.equal(check(result, 'en301549-probe').outcome, 'pass');
});

test('the rule map covers every core rule mapped to a Level A or AA criterion', () => {
  const aOrAA = (version) => new Set(Object.values(REQUIREMENTS[version]).map((r) => r.wcagSc[0]));
  for (const version of Object.values(PROFILES)) {
    const expected = getChecksCatalog()
      .filter((r) => (r.wcagSc || []).some((sc) => aOrAA(version).has(sc)))
      .map((r) => r.ruleId)
      .sort();
    assert.deepEqual(Object.keys(RULE_REQUIREMENTS[version]).sort(), expected, version);
  }
});
