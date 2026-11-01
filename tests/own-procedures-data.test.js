'use strict';

/**
 * The text of the standard's own requirements is data
 * (own-procedures.json), read and checked by own-procedures.js: what is
 * well formed gives the procedures core reads, and what is not is refused
 * with the place named, so a mistake made while editing the file fails here
 * rather than in a page.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const DATA = require('../own-procedures.json');
const { OWN_PROCEDURES, NOTES, buildOwnProcedures } = require('../own-procedures');
const { files } = require('../package.json');

const copy = () => structuredClone(DATA);
const requirement = (data, id) => data.requirements.find((r) => r.id === id);
const facet = (data, id, facetId) => requirement(data, id).facets.find((f) => f.id === facetId);
const refused = (data, message) => assert.throws(() => buildOwnProcedures(data), message);

test('the pack reads own-procedures.json, and reading it leaves it as it is', () => {
  const data = copy();
  const built = buildOwnProcedures(data);
  assert.deepEqual(built.OWN_PROCEDURES, OWN_PROCEDURES);
  assert.deepEqual(built.NOTES, NOTES);
  assert.deepEqual(data, DATA);
});

test('the package publishes own-procedures.json beside the code that reads it', () => {
  assert.ok(files.includes('own-procedures.js'));
  assert.ok(files.includes('own-procedures.json'));
});

test('each requirement is listed once, and each value given by version differs between them', () => {
  const ids = DATA.requirements.map((r) => r.id);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  // A requirement in two entries is so only for versions that don't overlap.
  for (const id of twice) {
    const versions = DATA.requirements.filter((r) => r.id === id).flatMap((r) => r.versions || []);
    assert.equal(new Set(versions).size, versions.length, id);
  }
  // A value the same in every version is written once.
  const same = [];
  const walk = (value, where) => {
    if (Array.isArray(value)) return value.forEach((x, i) => walk(x, `${where}[${i}]`));
    if (!value || typeof value !== 'object') return;
    const keys = Object.keys(value);
    if (keys.length === DATA.versions.length && keys.every((k) => DATA.versions.includes(k))) {
      const texts = keys.map((k) => JSON.stringify(value[k]));
      if (texts.every((t) => t === texts[0])) same.push(where);
    }
    for (const k of keys) walk(value[k], `${where}.${k}`);
  };
  walk(DATA, 'data');
  assert.deepEqual(same, []);
});

test('a value given by version reads, in each, as that version gives it', () => {
  const data = copy();
  facet(data, '5', 'biometrics').passWhen = { 'V3.2.1': 'Three.', 'V4.1.1': 'Four.' };
  facet(data, '5', 'biometrics').steps.push({ 'V4.1.1': 'Only in four.' });
  const { OWN_PROCEDURES: built } = buildOwnProcedures(data);
  const v3 = built['V3.2.1']['5'].facets.find((f) => f.id === 'biometrics');
  const v4 = built['V4.1.1']['5'].facets.find((f) => f.id === 'biometrics');
  assert.equal(v3.passWhen, 'Three.');
  assert.equal(v4.passWhen, 'Four.');
  assert.equal(v4.steps.at(-1), 'Only in four.');
  assert.equal(v3.steps.length, v4.steps.length - 1);
});

test('what is not well formed is refused, naming where', () => {
  let data = copy();
  facet(data, '5', 'biometrics').tools = ['magnifying-glass'];
  refused(data, /5 biometrics: unknown tool magnifying-glass/);

  data = copy();
  facet(data, '5', 'biometrics').label = { 'V3.2.1': 'Three.', 'V5.0.0': 'Five.' };
  refused(data, /5 biometrics: an object keyed by version/);

  data = copy();
  facet(data, '5', 'biometrics').passWhen = { 'V3.2.1': 'Only in three.' };
  refused(data, /5 biometrics: passWhen is missing in V4\.1\.1/);

  data = copy();
  facet(data, '5', 'biometrics').steps = [];
  refused(data, /5 biometrics: steps is to list one step or more/);

  data = copy();
  facet(data, '5', 'biometrics').automation = 'sometimes';
  refused(data, /5 biometrics: unknown automation sometimes/);

  data = copy();
  facet(data, '5', 'biometrics').versions = ['V9'];
  refused(data, /5 biometrics: unknown version V9/);

  data = copy();
  requirement(data, '5').facets.push(structuredClone(facet(data, '5', 'biometrics')));
  refused(data, /5 biometrics: two facets biometrics/);

  data = copy();
  requirement(data, '5').title = '';
  refused(data, /5: title is missing/);

  data = copy();
  data.templates['related-clauses'].failWhen = 'A clause fails, such as {sample}.';
  refused(data, /4\.2\.1 related-clauses: the template has an unknown field \{sample\}/);

  data = copy();
  delete facet(data, '4.2.1', 'related-clauses').need;
  refused(data, /4\.2\.1 related-clauses: the template needs need/);

  data = copy();
  facet(data, '4.2.1', 'related-clauses').template = 'unrelated';
  refused(data, /4\.2\.1 related-clauses: unknown template unrelated/);

  data = copy();
  data.versions = ['V4.1.1'];
  refused(data, /versions: is to list V3\.2\.1 and V4\.1\.1/);

  data = copy();
  data.notes = { 'V4.1.1': [''] };
  refused(data, /notes: V4\.1\.1 is to list notes/);
});

test('in V4.1.1 a related-clauses facet names only clauses Table B.2 marks P', () => {
  const data = copy();
  facet(data, '4.2.3', 'related-clauses').clauses = ['9.1.3.3', '9.1.4.1', '9.2.1.1'];
  assert.throws(
    () => buildOwnProcedures(data),
    /V4\.1\.1 Table B\.2 does not mark 9\.2\.1\.1 P for 4\.2\.3/
  );
});
