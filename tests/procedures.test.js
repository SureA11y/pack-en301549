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

// The standard's own requirements, by version, with their titles as each
// version gives them: chapter 4, chapter 12 and, by number, the chapters
// besides 9.
const CHAPTER_4 = {
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
const OWN = {
  'V3.2.1': {
    ...CHAPTER_4,
    5: 'Generic requirements',
    6: 'ICT with two-way voice communication',
    7: 'ICT with video capabilities',
    8: 'Hardware',
    10: 'Non-web documents',
    11: 'Software',
    '12.1.1': 'Accessibility and compatibility features',
    '12.1.2': 'Accessible documentation',
    '12.2.2': 'Information on accessibility and compatibility features',
    '12.2.3': 'Effective communication',
    '12.2.4': 'Accessible documentation',
    13: 'ICT providing relay or emergency service access'
  },
  'V4.1.1': {
    ...CHAPTER_4,
    5: 'Generic requirements',
    6: 'ICT supporting real-time bidirectional communication',
    7: 'ICT with video capabilities',
    8: 'Hardware',
    10: 'Non-web documents',
    11: 'Non-web software',
    12.1: 'Accessible information about products',
    12.2: 'Accessible information about services',
    12.3: 'Accessibility and compatibility features',
    12.4: 'Electronic program guides',
    12.5: 'Electronic program guide display',
    13: 'ICT providing relay or emergency service access'
  }
};

test('the own requirements are chapters 4 and 12 and the other chapters, in both versions', () => {
  assert.deepEqual(Object.keys(OWN_PROCEDURES).sort(), Object.keys(EN301549_CLAUSES).sort());
  for (const [version, rows] of Object.entries(OWN)) {
    const own = OWN_PROCEDURES[version];
    assert.deepEqual(Object.keys(own).sort(), Object.keys(rows).sort(), version);
    for (const [id, title] of Object.entries(rows)) {
      assert.equal(own[id].title, title, `${version} ${id}`);
    }
  }
});

test('every facet of an own requirement is well formed', () => {
  const TOOLS = ['keyboard', 'pointer', 'screen-reader', 'zoom', 'contrast-theme', 'devtools'];
  const text = (v) => typeof v === 'string' && v.trim() !== '' && v === v.trim();
  for (const [version, rows] of Object.entries(OWN_PROCEDURES)) {
    for (const [id, { facets }] of Object.entries(rows)) {
      const at = `${version} ${id}`;
      assert.ok(Array.isArray(facets) && facets.length > 0, at);
      const ids = facets.map((f) => f.id);
      assert.equal(new Set(ids).size, ids.length, `${at}: facet ids repeat`);
      for (const f of facets) {
        const fa = `${at} ${f.id}`;
        assert.match(f.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, fa);
        assert.ok(text(f.label), fa);
        assert.equal(f.automation, 'manual', fa);
        assert.ok(f.tools === undefined || f.tools.every((t) => TOOLS.includes(t)), fa);
        assert.ok(f.steps.length >= 1 && f.steps.length <= 8, fa);
        assert.ok(f.steps.every(text), fa);
        assert.ok(text(f.passWhen) && text(f.failWhen), fa);
        // A failure names the requirement, or the clause of it, it fails.
        assert.match(f.failWhen, /which fails (EN 301 549|the clause of EN 301 549)/, fa);
      }
    }
  }
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
      for (const f of facets) assert.match(f.failWhen, /EN 301 549/);
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
