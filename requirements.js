/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * EN 301 549's versions and requirements, in the shape core's
 * ruleMappedStandard takes: per version, each chapter 9 clause by its number,
 * with its title and the WCAG criterion it restates. Built from the clause
 * table (clauses.js), so the two cannot drift apart.
 *
 * VERSIONS: oldest first, each with the WCAG version it is built on.
 * REQUIREMENTS: { 'V4.1.1': { '9.1.4.3': { title, wcagSc: ['1.4.3'] } } }
 */

const { EN301549_VERSIONS, EN301549_CLAUSES } = require('./clauses');

const VERSIONS = EN301549_VERSIONS.map(({ version, wcagVersion }) => ({ version, wcagVersion }));

const REQUIREMENTS = Object.fromEntries(
  VERSIONS.map(({ version }) => [
    version,
    Object.fromEntries(
      Object.entries(EN301549_CLAUSES[version]).map(([sc, { clause, title }]) => [
        clause,
        { title, wcagSc: [sc] }
      ])
    )
  ])
);

module.exports = { VERSIONS, REQUIREMENTS };
