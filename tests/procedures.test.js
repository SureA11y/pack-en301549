'use strict';

/**
 * How a person assesses each requirement by hand (core's
 * standard.procedures, docs/PROCEDURES.md in core), in both versions: every
 * chapter 9 clause restates one WCAG criterion, so it takes that criterion's
 * procedures, which core gives where one of its rules evaluates it. The
 * standard's own requirements (chapter 4, 9.6, 9.7, chapters 5 to 8 and 10
 * to 13), which no rule evaluates, have none here. Core 1.15 reads them;
 * with an older core the pack gives none, and these tests say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const { EN301549_CLAUSES } = require('../clauses');
const pack = require('..');

const reads = typeof core.proceduresFor === 'function' && !!pack.standard.procedures;

// A core that lists the procedures (1.15) also names, in a general
// procedure, the requirement it is read under: "which fails EN 301 549
// 9.1.4.3", where the criterion read alone says "which fails WCAG 1.4.3". A
// finding's steps (variants) keep naming WCAG.
const namesRequirement = typeof core.listProcedures === 'function';
const under = (facets, sc, clause) =>
  facets.map((f) =>
    f.procedure
      ? {
          ...f,
          procedure: {
            ...f.procedure,
            failWhen: f.procedure.failWhen.replace(`WCAG ${sc}`, `EN 301 549 ${clause}`)
          }
        }
      : f
  );
const skip = reads ? false : 'this core reads no procedures (core 1.15 does)';

test(
  'every clause of each version takes the procedures of its criterion, and nothing else does',
  { skip },
  () => {
    const { procedures } = pack.standard;
    assert.deepEqual(Object.keys(procedures).sort(), Object.keys(EN301549_CLAUSES).sort());
    for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
      const expected = {};
      for (const [sc, { clause, title }] of Object.entries(rows)) {
        expected[clause] = { title, wcag: sc };
      }
      assert.deepEqual(procedures[version], expected, version);
    }
  }
);

test(
  'core reads every clause with its criterion’s procedures, complete where core’s are',
  { skip },
  () => {
    let n = 0;
    let complete = 0;
    for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
      for (const [sc, { clause, title }] of Object.entries(rows)) {
        const r = core.proceduresFor(clause, { packs: [pack], standard: 'en301549', version });
        assert.equal(r.standard, 'EN 301 549', clause);
        assert.equal(r.version, version);
        assert.equal(r.title, title);
        assert.equal(r.wcag, sc);
        // The criterion's facets, whose procedures say the clause fails where
        // core names the requirement it reads them under (1.15), and the
        // criterion where it doesn't. A criterion no core rule evaluates has
        // its facets and no procedure, so neither is complete.
        const criterion = core.proceduresFor(sc);
        assert.equal(r.complete, criterion.complete, `${version} ${clause}`);
        if (r.complete) complete++;
        assert.deepEqual(
          r.facets,
          namesRequirement ? under(criterion.facets, sc, clause) : criterion.facets
        );
        n++;
      }
    }
    assert.ok(n > 100, `only ${n} clauses`);
    assert.ok(complete > 30, `only ${complete} clauses with procedures`);
    // The latest version by default, and by the standard's name.
    assert.equal(
      core.proceduresFor('9.2.5.8', { packs: [pack], standard: 'EN 301 549' }).version,
      'V4.1.1'
    );
    // 9.4.1.1 is void in V4.1.1: V3.2.1, which has it, is the latest version
    // that does.
    assert.equal(
      core.proceduresFor('9.4.1.1', { packs: [pack], standard: 'en301549', version: 'V4.1.1' }),
      null
    );
    assert.equal(
      core.proceduresFor('9.4.1.1', { packs: [pack], standard: 'en301549' }).version,
      'V3.2.1'
    );
  }
);

// The standard's own requirements, which restate no WCAG criterion and which
// no rule evaluates: the pack gives no procedures for them, in either
// version. A pack's own requirement has procedures where its rules evaluate
// it (docs/PACKS.md in core).
const OWN = [
  '4.2.1',
  '4.2.11',
  '5',
  '6',
  '7',
  '8',
  '9.6',
  '9.7',
  '10',
  '11',
  '12.1',
  '12.1.1',
  '13'
];

test(
  'the standard’s own requirements, which no rule evaluates, have no procedures',
  { skip },
  () => {
    for (const version of Object.keys(EN301549_CLAUSES)) {
      for (const id of OWN) {
        assert.equal(
          core.proceduresFor(id, { packs: [pack], standard: 'en301549', version }),
          null,
          `${version} ${id}`
        );
      }
    }
  }
);
