'use strict';

/**
 * Records what the pack gives with the installed core, in
 * tests/fixtures/baseline/core-<version>.json, for the baseline tests to
 * compare against: run it once per core version, from a pack that gives what
 * it gave before (see tests/helpers/baseline.js). It never writes over a
 * baseline: a difference from one is a change to look at, not to record.
 * Core's scenario pages are read from a checkout beside this one (../core).
 */

const fs = require('node:fs');
const path = require('node:path');
const b = require('../tests/helpers/baseline.js');

if (fs.existsSync(b.FILE)) {
  console.error(`${path.relative(process.cwd(), b.FILE)} is already recorded: not written.`);
  process.exit(1);
}
const pages = b.scenarioPages();
if (!pages.length) {
  console.error(`No scenario pages in ${b.SCENARIOS}: clone core beside this repository.`);
  process.exit(1);
}

const scenarios = {};
pages.forEach((page, i) => {
  scenarios[page] = b.scenarioScans(page);
  if ((i + 1) % 20 === 0) console.log(`${i + 1} of ${pages.length} pages`);
});

const baseline = {
  core: b.CORE_VERSION,
  catalog: b.catalogHash(),
  coreProcedures: b.coreProcedures(),
  pack: b.packFacts(),
  pages: b.pageScans(),
  procedures: b.clauseProcedures(),
  scenarios
};
fs.mkdirSync(path.dirname(b.FILE), { recursive: true });
fs.writeFileSync(b.FILE, JSON.stringify(baseline, null, 1) + '\n');
console.log(`Wrote ${path.relative(process.cwd(), b.FILE)}: ${pages.length} scenario pages.`);
