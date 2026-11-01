/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * How EN 301 549 groups its requirements, per version, as core's
 * listProcedures and procedureChecklist show them (core's standard.groups,
 * docs/PROCEDURES.md in core): by chapter, and chapter 9 by the principles
 * and guidelines its clauses are numbered under, as WCAG's are (9.1
 * Perceivable, 9.1.1 Text alternatives, then 9.1.1.1).
 *
 * groupsOf(procedures) builds them from the requirements the procedures
 * give, by number, so every requirement is in exactly one group. Today they
 * are chapter 9's clauses: the standard's own requirements, which no rule
 * evaluates, have no procedures in the pack. Were one to gain a rule, a
 * chapter the pack gives as one requirement ('5'), and chapter 9's own
 * requirements after its principles (9.6, 9.7), would each be a group of
 * that one, titled as the requirement is; a chapter of several needs its
 * title in CHAPTERS.
 *
 * SOURCE: ETSI EN 301 549 V3.2.1 (2021-03) and V4.1.1 (2026-09), chapter and
 * clause headings.
 */

// The chapters that hold several requirements, by version where it differs.
const CHAPTERS = {
  9: () => 'Web'
};

// Chapter 9's headings: WCAG's principles and guidelines, as the standard
// titles them.
const WEB = {
  9.1: 'Perceivable',
  '9.1.1': 'Text alternatives',
  '9.1.2': 'Time-based media',
  '9.1.3': 'Adaptable',
  '9.1.4': 'Distinguishable',
  9.2: 'Operable',
  '9.2.1': 'Keyboard accessible',
  '9.2.2': 'Enough time',
  '9.2.3': 'Seizures and physical reactions',
  '9.2.4': 'Navigable',
  '9.2.5': 'Input modalities',
  9.3: 'Understandable',
  '9.3.1': 'Readable',
  '9.3.2': 'Predictable',
  '9.3.3': 'Input assistance',
  9.4: 'Robust',
  '9.4.1': 'Compatible'
};

const byNumber = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
};

const head = (id, parts) => id.split('.').slice(0, parts).join('.');

function titleOf(id) {
  if (!Object.prototype.hasOwnProperty.call(WEB, id)) {
    throw new Error(`groups.js: no heading for ${id}`);
  }
  return WEB[id];
}

// Chapter 9's clauses under their principle and guideline, then its own
// requirements (9.6, 9.7), each a group of that one, titled as it is.
function webGroups(ids, requirements) {
  const clauses = ids.filter((id) => id.split('.').length === 4);
  const own = ids
    .filter((id) => id.split('.').length === 2)
    .map((id) => ({ id, title: requirements[id].title, requirements: [id] }));
  const principles = [...new Set(clauses.map((id) => head(id, 2)))].sort(byNumber);
  return principles
    .map((p) => {
      const guidelines = [
        ...new Set(clauses.filter((id) => head(id, 2) === p).map((id) => head(id, 3)))
      ]
        .sort(byNumber)
        .map((g) => ({
          id: g,
          title: titleOf(g),
          requirements: clauses.filter((id) => head(id, 3) === g)
        }));
      return { id: p, title: titleOf(p), groups: guidelines };
    })
    .concat(own);
}

// One version's groups, from its procedures: { requirement: entry }.
function versionGroups(version, requirements) {
  const ids = Object.keys(requirements).sort(byNumber);
  const chapters = [...new Set(ids.map((id) => head(id, 1)))].sort(byNumber);
  return chapters.map((chapter) => {
    const own = ids.filter((id) => head(id, 1) === chapter);
    if (chapter === '9') {
      return { id: chapter, title: CHAPTERS[9](version), groups: webGroups(own, requirements) };
    }
    if (Object.prototype.hasOwnProperty.call(CHAPTERS, chapter)) {
      return { id: chapter, title: CHAPTERS[chapter](version), requirements: own };
    }
    if (own.length !== 1 || own[0] !== chapter) {
      throw new Error(`groups.js: chapter ${chapter} of ${version} needs a title`);
    }
    return { id: chapter, title: requirements[chapter].title, requirements: own };
  });
}

/** The groups of every version the procedures give: { version: [group] }. */
const groupsOf = (procedures) =>
  Object.fromEntries(
    Object.entries(procedures).map(([version, requirements]) => [
      version,
      versionGroups(version, requirements)
    ])
  );

module.exports = { groupsOf };
