'use strict';

/**
 * Core 1.x keeps EN 301 549 built in, deprecated: a scan given the pack uses
 * the pack in place of the built-in, and core shows no deprecation notice.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { runa11yCoreOnHtml, pack } = require('./helpers/run.js');

const HTML =
  '<!doctype html><html lang="en"><head><title>t</title></head><body><main>' +
  '<img src="a.png"></main></body></html>';

function warningsOf(fn) {
  delete globalThis[Symbol.for('surea11y.deprecatedStandardsWarned')];
  const original = console.warn;
  const warnings = [];
  console.warn = (msg) => warnings.push(String(msg));
  try {
    return { value: fn(), warnings };
  } finally {
    console.warn = original;
  }
}

test('a scan given the pack uses it, with no deprecation notice', () => {
  const { value, warnings } = warningsOf(() =>
    [{ profile: 'en301549-v4.1.1' }, { profile: 'en301549-v3.2.1' }, { mappings: 'en301549' }].map(
      (engineOptions) => runa11yCoreOnHtml(HTML, { engineOptions, entryPointParity: false })
    )
  );
  for (const result of value) {
    assert.equal(result.skippedPacks, undefined, JSON.stringify(result.skippedPacks));
    assert.deepEqual(result.engine.packs, [`${pack.name}@${pack.version}`]);
  }
  assert.deepEqual(warnings, []);
});
