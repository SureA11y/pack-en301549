'use strict';

/**
 * The baseline tests (tests/baseline*.test.js): the pack gives with this
 * core what it gave when its baseline was recorded (tests/helpers/baseline.js).
 * Skipped with a core no baseline was recorded with, or whose rules changed
 * since. Core's scenario pages are compared in shards, one test file each, so
 * they run side by side.
 */

const fs = require('node:fs');
const assert = require('node:assert/strict');
const b = require('./baseline.js');

const recorded = fs.existsSync(b.FILE) ? JSON.parse(fs.readFileSync(b.FILE, 'utf8')) : null;
const skip =
  (!recorded && `no baseline recorded with core ${b.CORE_VERSION}`) ||
  (recorded.catalog !== b.catalogHash() &&
    `core ${b.CORE_VERSION}'s rules changed since its baseline was recorded`);

const SHARDS = 4;

// Core's scenario pages in shard `n`: each one's scans, where the page is the
// one recorded.
function compareScenarios(n) {
  const pages = b.scenarioPages().filter((_, i) => i % SHARDS === n);
  const differences = [];
  let compared = 0;
  for (const page of pages) {
    const then = recorded.scenarios[page];
    if (!then) continue;
    const now = b.scenarioScans(page);
    if (now.page !== then.page) continue;
    for (const [options, hash] of Object.entries(then.scans)) {
      compared++;
      if (now.scans[options] !== hash) differences.push(`${page} ${options}`);
    }
  }
  return { compared, differences };
}

const scenarioSkip = skip || (!b.scenarioPages().length && 'no core checkout beside this one');

function scenarioTest(test, n) {
  test(
    `core's scenario pages, shard ${n + 1} of ${SHARDS}: every scan as recorded`,
    { skip: scenarioSkip },
    (t) => {
      const { compared, differences } = compareScenarios(n);
      // A page core has changed since is not compared: say how many were.
      t.diagnostic(`${compared} scans compared`);
      assert.deepEqual(differences, []);
    }
  );
}

module.exports = { assert, b, recorded, skip, scenarioTest };
