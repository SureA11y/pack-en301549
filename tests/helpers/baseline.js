'use strict';

/**
 * What the pack gives, as the baseline records it (tests/fixtures/baseline):
 * its tables and standard, the entries mappingsFor names for each criterion,
 * the results of the scans the tests make, of core's scenario pages, and how
 * core reads each chapter 9 clause's procedures in every locale. A scan's
 * result is kept as a hash of all of it but its timestamp and timings, and
 * the tests' own pages also as their outcomes and clauses, readable in a
 * diff.
 *
 * Recorded once per core version (scripts/record-baseline.js), before the
 * pack gained anything; a test compares the pack against it. A difference is
 * a change in what the pack gives, never a reason to record again.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const core = require('@surea11y/core');
const { checkPack, describePacks } = require('@surea11y/core/pack');
const { runa11yCoreOnHtml, pack } = require('./run.js');
const { EN301549_VERSIONS, EN301549_CLAUSES } = require('../../clauses');
const { VERSIONS, REQUIREMENTS } = require('../../requirements');
const { RULE_REQUIREMENTS } = require('../../rule-map');

const DIR = path.join(__dirname, '..', 'fixtures', 'baseline');
const SCENARIOS = path.join(__dirname, '..', '..', '..', 'core', 'tests', 'fixtures');
const CORE_VERSION = require('@surea11y/core/package.json').version;
const FILE = path.join(DIR, `core-${CORE_VERSION}.json`);

const LOCALES = ['de', 'en', 'es', 'fr', 'ja'];

const hash = (value) =>
  crypto
    .createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');

// The installed core's rules, as the rule map reads them: a baseline is
// compared only with the core it was recorded with.
const catalogHash = () =>
  hash(
    core
      .getChecksCatalog()
      .map((r) => [r.ruleId, r.wcagSc || [], r.tags || []])
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  );

// The pages the tests scan, and the options they scan them with.
const PAGES = {
  mappings:
    '<!doctype html><html lang="en"><head><title>t</title></head><body><main>' +
    '<img src="a.png"></main></body></html>',
  profiles:
    '<!doctype html><html lang="en"><head><title>Home</title></head><body><main>' +
    '<h1>Library</h1><img src="logo.png"><p id="a">Opening hours</p><p id="a">Access</p>' +
    '<button style="width:10px;height:10px;padding:0"></button></main></body></html>',
  browser:
    '<!doctype html><html lang="en"><head><title>Home</title></head><body><main>' +
    '<h1>Library</h1><img src="logo.png"><a href="/x"></a><p id="a">x</p><p id="a">y</p>' +
    '</main></body></html>'
};

const PAGE_OPTIONS = [
  {},
  { mappings: ['en301549'] },
  { mappings: 'en301549' },
  { mappings: 'en301549:V3.2.1' },
  { mappings: 'en301549:V4.1.1' },
  { mappings: 'en301549:V3.2.1', wcagVersion: '2.1' },
  { profile: 'en301549-v4.1.1' },
  { profile: 'en301549-v3.2.1' },
  { profile: 'wcag22-aa' },
  { profile: 'wcag22-aa', mappings: 'en301549:V4.1.1' }
];

const SCENARIO_OPTIONS = [
  { mappings: 'en301549' },
  { mappings: 'en301549:V3.2.1', wcagVersion: '2.1' },
  { profile: 'en301549-v4.1.1' },
  { profile: 'en301549-v3.2.1' }
];

const optionsKey = (o) => JSON.stringify(o);

function scan(html, engineOptions) {
  const original = console.warn;
  console.warn = () => {};
  try {
    return runa11yCoreOnHtml(html, { engineOptions, entryPointParity: false });
  } finally {
    console.warn = original;
  }
}

function resultHash(result) {
  const { timestamp, perfStats, ...rest } = result;
  return hash(rest);
}

// A result's outcomes and EN 301 549 entries, one line each.
const outline = (result) =>
  result.checksResults
    .concat(result.rulesResults)
    .map((r) =>
      [
        r.ruleId,
        r.outcome,
        String((r.occurrences || []).length),
        ...((r.meta && r.meta.normativeMappings) || [])
          .filter((m) => m.standard === 'EN 301 549')
          .map((m) => `${m.version} ${m.requirement}`)
      ].join(' ')
    );

function pageScans() {
  const out = {};
  for (const [name, html] of Object.entries(PAGES)) {
    for (const options of PAGE_OPTIONS) {
      const result = scan(html, options);
      out[`${name} ${optionsKey(options)}`] = {
        hash: resultHash(result),
        outline: outline(result)
      };
    }
  }
  return out;
}

const scenarioPages = () =>
  fs.existsSync(SCENARIOS)
    ? fs
        .readdirSync(SCENARIOS)
        .filter((f) => f.endsWith('-all-scenarios.html'))
        .sort()
    : [];

// One page's scans, with a hash of the page itself: core's pages change with
// its checkout, and a page that changed is not compared.
function scenarioScans(page) {
  const html = fs.readFileSync(path.join(SCENARIOS, page), 'utf8');
  const scans = {};
  for (const options of SCENARIO_OPTIONS) {
    scans[optionsKey(options)] = resultHash(scan(html, options));
  }
  return { page: hash(html), scans };
}

// What the pack holds, without its functions.
function packFacts() {
  const { standard } = pack;
  const criteria = new Set();
  for (const rows of Object.values(EN301549_CLAUSES))
    Object.keys(rows).forEach((sc) => criteria.add(sc));
  for (const r of core.getChecksCatalog())
    (r.wcagSc || []).forEach((sc) => criteria.add(String(sc)));
  ['1.4.6', '2.1.3', '4.1.1', '9.9.9', ' 1.1.1 ', ''].forEach((sc) => criteria.add(sc));
  const mappings = {};
  for (const sc of [...criteria].sort()) {
    mappings[JSON.stringify(sc)] = standard.mappingsFor({ wcagSc: [sc] });
  }
  mappings.many = standard.mappingsFor({ wcagSc: ['1.1.1', '2.5.8', '4.1.1'] });
  mappings.none = standard.mappingsFor({});
  return {
    name: pack.name,
    version: pack.version,
    namespace: pack.namespace,
    core: pack.core,
    description: pack.description,
    rules: (pack.rules || []).map((r) => r.id),
    standard: {
      key: standard.key,
      standard: standard.standard,
      versions: standard.versions,
      profiles: standard.profiles,
      ruleTag: standard.ruleTag,
      report: standard.report,
      composites: standard.composites,
      fields: Object.keys(standard).sort()
    },
    dictionaries: pack.dictionaries,
    tables: { EN301549_VERSIONS, EN301549_CLAUSES, VERSIONS, REQUIREMENTS, RULE_REQUIREMENTS },
    mappings,
    checkPack: checkPack(pack),
    describePacks: describePacks([pack])
  };
}

// Core's own procedures for the criteria the chapter 9 clauses restate, read
// without the pack, in every locale, as one hash: null where this core reads
// no procedures. A clause's procedures are core's, read under the clause, so
// they are compared only while core's own are as they were recorded.
function coreProcedures() {
  if (typeof core.proceduresFor !== 'function') return null;
  const out = {};
  for (const rows of Object.values(EN301549_CLAUSES)) {
    for (const sc of Object.keys(rows)) {
      for (const locale of LOCALES)
        out[`${sc} ${locale}`] = hash(core.proceduresFor(sc, { locale }));
    }
  }
  return hash(out);
}

// How core reads each chapter 9 clause, by version and locale: null where
// this core reads no procedures.
function clauseProcedures() {
  if (typeof core.proceduresFor !== 'function') return null;
  const out = {};
  for (const [version, rows] of Object.entries(EN301549_CLAUSES)) {
    for (const { clause } of Object.values(rows)) {
      for (const locale of LOCALES) {
        const r = core.proceduresFor(clause, {
          packs: [pack],
          standard: 'en301549',
          version,
          locale
        });
        out[`${version} ${clause} ${locale}`] = hash(r);
      }
    }
  }
  return out;
}

module.exports = {
  CORE_VERSION,
  FILE,
  SCENARIOS,
  catalogHash,
  clauseProcedures,
  coreProcedures,
  packFacts,
  pageScans,
  scenarioPages,
  scenarioScans
};
