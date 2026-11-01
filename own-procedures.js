/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * How a person assesses EN 301 549's own requirements by hand: the ones that
 * restate no WCAG criterion, and that no rule checks. They give the
 * standard's procedures (core's standard.procedures, docs/PROCEDURES.md in
 * core) beside chapter 9's, which take their criterion's, and nothing else:
 * no rule, rollup, profile entry or result.
 *
 * - Chapter 4, the functional performance statements (criteria, in V4.1.1),
 *   4.2.1 to 4.2.11: whole tasks done the way a person with that need does
 *   them. Single elements are the chapter 9 clauses' to check, and a
 *   procedure sends the person to the ones Annex B (Table B.2) relates to the
 *   statement rather than repeating them.
 * - Chapter 9's own requirements, beside the clauses that restate WCAG's
 *   criteria: 9.6, WCAG's five conformance requirements at Level AA (the
 *   WCAG version the standard's version is built on), and, in V4.1.1 only,
 *   9.7, which keeps a page from blocking or overriding the user's
 *   preferences. 9.5, WCAG's AAA criteria, is informative.
 * - Chapter 12, about the product's documentation and support, not its
 *   pages: 12.1.1, 12.1.2, 12.2.2, 12.2.3 and 12.2.4 in V3.2.1 (12.2.1 is
 *   informative), 12.1 to 12.5 in V4.1.1, which renumbered the chapter.
 * - Chapters 5, 6, 7, 8, 10, 11 and 13, one requirement each, by the
 *   chapter's number ('5'): for a web product, mostly whether the chapter
 *   applies, and a facet for each part of it that can. The annex that
 *   relates the standard to the Web Accessibility Directive (V3.2.1 Annex A,
 *   V4.1.1 Annex ZA, Table ZA.1 / A.1 "Web content") lists which of their
 *   clauses bear on web content.
 *
 * THE TEXT is in own-procedures.json, in English, so that it can be read and
 * edited as data; this file reads it, checks it and gives it the shape core
 * reads:
 *
 * OWN_PROCEDURES: { 'V4.1.1': { '4.2.1': { title, relatesTo, facets: [{ id,
 *   label, automation, tools, steps, passWhen, failWhen }] } } }
 *
 * NOTES: { 'V4.1.1': [text] }, what a page of a version's procedures says
 * first, in its header.
 *
 * In own-procedures.json:
 *
 * - requirements lists the requirements in order, each with its id, title
 *   and facets (or a note, for a void clause), and versions where it is in
 *   some versions only. A facet, likewise, has versions where it is in some
 *   versions only.
 * - Any value that differs between versions is an object keyed by version,
 *   { "V3.2.1": ..., "V4.1.1": ... }. In a list of steps, an item that names
 *   some versions only is left out of the others.
 * - A facet with a template ('related-clauses') takes its text from
 *   templates, with {id} the requirement's number and {column}, {need},
 *   {clauses} and {example} the facet's own fields.
 *
 * i18n/standard.<locale>.json translates the text, keyed by the English as a
 * version shows it, so a text changed in own-procedures.json is shown in
 * English until it is translated again.
 *
 * A chapter 4 statement also names, in relatesTo, the WCAG criteria it
 * relates to: in V4.1.1, those the chapter 9 clauses Table B.2 marks P for it
 * restate (annex-b.js); in V3.2.1, whose Annex B is not recorded, those the
 * chapter 9 clauses its procedure names restate. 9.6 names, in the data,
 * those of the clauses its fifth conformance requirement asks of all
 * content.
 *
 * Titles are the standard's own, per version; the procedures are not its
 * text. A procedure is guidance, and its wording may improve in any release.
 *
 * SOURCE: ETSI EN 301 549 V3.2.1 (2021-03) and V4.1.1 (2026-09).
 */

const { ANNEX_B } = require('./annex-b');
const { EN301549_VERSIONS } = require('./clauses');

const V3 = 'V3.2.1';
// The versions the pack has, which the data is to list, in the same order.
const VERSIONS = EN301549_VERSIONS.map(({ version }) => version);

// What a procedure may need besides a browser: core's tools.
const TOOLS = ['keyboard', 'pointer', 'screen-reader', 'zoom', 'contrast-theme', 'devtools'];
const AUTOMATION = ['full', 'partial', 'manual'];
// The fields a facet gives, in the order core has always been given them.
const FACET_FIELDS = ['label', 'automation', 'tools', 'steps', 'passWhen', 'failWhen'];
const REQUIRED = ['label', 'automation', 'steps', 'passWhen', 'failWhen'];
// The fields a facet with a template fills in, besides {id}.
const TEMPLATE_FIELDS = ['column', 'need', 'clauses', 'example'];

const fail = (where, message) => {
  throw new Error(`own-procedures.json, ${where}: ${message}`);
};

// A value keyed by version: an object whose keys are all versions.
const isByVersion = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0 &&
  Object.keys(value).every((k) => VERSIONS.includes(k));

// Whether something lists v among its versions (all of them without a list).
function inVersion(item, v, where) {
  if (item.versions === undefined) return true;
  if (!Array.isArray(item.versions) || !item.versions.length) {
    fail(where, 'versions is to be a list of versions');
  }
  for (const x of item.versions) {
    if (!VERSIONS.includes(x)) fail(where, `unknown version ${x}`);
  }
  return item.versions.includes(v);
}

// A value as version v shows it: undefined where v has none. In a list, an
// item keyed by version that names v is v's, and one that doesn't is left
// out.
function forVersion(value, v, where) {
  if (isByVersion(value)) return forVersion(value[v], v, where);
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const x = forVersion(item, v, where);
      return x === undefined ? [] : [x];
    });
  }
  if (value !== null && typeof value === 'object') {
    fail(where, `an object keyed by version is to name only ${VERSIONS.join(' and ')}`);
  }
  return value;
}

// A template's text with its fields filled in.
function fill(text, fields, where) {
  return text.replace(/\{(\w+)\}/g, (_, name) => {
    if (!(name in fields)) fail(where, `the template has an unknown field {${name}}`);
    return fields[name];
  });
}

// In V4.1.1, the clauses a related-clauses facet names as examples are taken
// from Table B.2: those of the picks it marks P for the criterion, chapter 9's
// first, then the others in the table's order. A pick it does not mark P is
// an error.
const isWeb = (clause) => clause.startsWith('9.');
function primaryExamples(v, id, picks) {
  const { primary } = ANNEX_B[v][id];
  const missing = picks.filter((c) => !primary.includes(c));
  if (missing.length) {
    throw new Error(`EN 301 549 ${v} Table B.2 does not mark ${missing.join(', ')} P for ${id}`);
  }
  const named = primary.filter((c) => picks.includes(c));
  return named.filter(isWeb).concat(named.filter((c) => !isWeb(c)));
}

// A chapter 4 statement relates to WCAG criteria (relatesTo: core's
// relatedRequirements reads it both ways), those its chapter 9 clauses
// restate: '9.1.4.3' restates 1.4.3.
//
// - V4.1.1: every chapter 9 clause Table B.2 marks P for it. 9.6 and 9.7
//   restate no criterion. S marks are left out: Annex B gives them as
//   partial support, "some users may use the feature in specific
//   situations", and the procedure still sends the person to every clause
//   marked P or S, as Annex C's first check asks.
// - V3.2.1, whose Annex B is not recorded: the chapter 9 clauses its
//   procedure names, not every one Table B.2 marks.
const criterionOf = (clause) => clause.split('.').slice(1).join('.');
const byNumber = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
};
const primaryWeb = (v, id) =>
  ANNEX_B[v][id].primary.filter((c) => isWeb(c) && c !== '9.6' && c !== '9.7');

// A facet as version v shows it, with the clauses it names, if any.
function facetFor(data, entry, id, v, where) {
  let source = entry;
  let clauses = null;
  if (entry.template !== undefined) {
    const template = (data.templates || {})[entry.template];
    if (!template) fail(where, `unknown template ${entry.template}`);
    const picks = forVersion(entry.clauses, v, where);
    if (!Array.isArray(picks) || !picks.length) fail(where, 'clauses is to list clauses');
    clauses = v === V3 ? picks : primaryExamples(v, id, picks);
    const fields = { id };
    for (const k of TEMPLATE_FIELDS) {
      const value = forVersion(entry[k], v, where);
      if (value === undefined) fail(where, `the template needs ${k}`);
      fields[k] = k === 'clauses' ? clauses.join(', ') : value;
    }
    const fillAll = (value) =>
      Array.isArray(value)
        ? value.map(fillAll)
        : typeof value === 'string'
          ? fill(value, fields, where)
          : value;
    source = Object.fromEntries(
      Object.keys(template).map((k) => [k, fillAll(forVersion(template[k], v, where))])
    );
  }
  const facet = { id: entry.id };
  for (const k of FACET_FIELDS) {
    const value = forVersion(source[k], v, where);
    if (value !== undefined) facet[k] = value;
  }
  for (const k of REQUIRED) {
    if (facet[k] === undefined) fail(where, `${k} is missing in ${v}`);
  }
  if (!AUTOMATION.includes(facet.automation)) fail(where, `unknown automation ${facet.automation}`);
  if (!facet.steps.length || facet.steps.some((s) => typeof s !== 'string' || !s)) {
    fail(where, `steps is to list one step or more, as text, in ${v}`);
  }
  for (const k of ['label', 'passWhen', 'failWhen']) {
    if (typeof facet[k] !== 'string' || !facet[k]) fail(where, `${k} is to be text in ${v}`);
  }
  for (const tool of facet.tools || []) {
    if (!TOOLS.includes(tool)) fail(where, `unknown tool ${tool}`);
  }
  return { facet, clauses };
}

// A requirement as version v shows it.
function requirementFor(data, entry, v) {
  const where = entry.id;
  const title = forVersion(entry.title, v, where);
  if (typeof title !== 'string' || !title) fail(where, `title is missing in ${v}`);
  if (entry.note !== undefined) return { title, note: forVersion(entry.note, v, where) };
  const named = [];
  const facets = [];
  for (const f of entry.facets || []) {
    const at = `${where} ${f.id}`;
    if (!inVersion(f, v, at)) continue;
    const { facet, clauses } = facetFor(data, f, entry.id, v, at);
    if (facets.some((x) => x.id === facet.id)) fail(at, `two facets ${facet.id} in ${v}`);
    facets.push(facet);
    if (clauses) named.push(...clauses);
  }
  if (!facets.length) fail(where, `no facet in ${v}`);
  if (named.length) {
    const clauses = v === V3 ? named : primaryWeb(v, entry.id);
    const relatesTo = [...new Set(clauses.map(criterionOf))].sort(byNumber);
    return { title, relatesTo, facets };
  }
  if (entry.relatesTo !== undefined) return { title, relatesTo: entry.relatesTo, facets };
  return { title, facets };
}

function versionOf(data, v) {
  const out = {};
  for (const entry of data.requirements) {
    if (typeof entry.id !== 'string' || !entry.id) fail('requirements', 'a requirement has no id');
    if (!inVersion(entry, v, entry.id)) continue;
    if (Object.hasOwn(out, entry.id)) fail(entry.id, `listed twice in ${v}`);
    out[entry.id] = requirementFor(data, entry, v);
  }
  return out;
}

/**
 * The procedures and notes of own-procedures.json, or of data of the same
 * shape, in the shape core reads; throws, naming the place, on data that is
 * not well formed. Exported so that the tests, and a tool that edits the
 * file, check data as the pack reads it.
 */
function buildOwnProcedures(data) {
  if (!data || typeof data !== 'object') fail('the file', 'is to be an object');
  if (JSON.stringify(data.versions) !== JSON.stringify(VERSIONS)) {
    fail('versions', `is to list ${VERSIONS.join(' and ')}`);
  }
  if (!Array.isArray(data.requirements)) fail('requirements', 'is to be a list');
  const notes = data.notes || {};
  for (const [v, list] of Object.entries(notes)) {
    if (!VERSIONS.includes(v)) fail('notes', `unknown version ${v}`);
    if (!Array.isArray(list) || list.some((n) => typeof n !== 'string' || !n)) {
      fail('notes', `${v} is to list notes, as text`);
    }
  }
  return {
    OWN_PROCEDURES: Object.fromEntries(VERSIONS.map((v) => [v, versionOf(data, v)])),
    NOTES: notes
  };
}

const { OWN_PROCEDURES, NOTES } = buildOwnProcedures(require('./own-procedures.json'));

module.exports = { OWN_PROCEDURES, NOTES, buildOwnProcedures };
