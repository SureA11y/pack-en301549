'use strict';

/**
 * In a page: core's browser bundle and the pack's packScript, then a scan
 * naming the pack, report the clauses a scan in Node reports, under each
 * profile and with mappings. Outcomes are not compared: Chromium lays the
 * page out and jsdom does not, so rules that measure decide differently.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const { chromium } = require('playwright');
const { packScript } = require('@surea11y/core/pack');
const { runa11yCoreOnHtml, pack } = require('./helpers/run.js');

const BUNDLE = fs.readFileSync(require.resolve('@surea11y/core/browser'), 'utf8');
const NAME = `${pack.name}@${pack.version}`;

const PAGE =
  '<!doctype html><html lang="en"><head><title>Home</title></head><body><main>' +
  '<h1>Library</h1><img src="logo.png"><a href="/x"></a><p id="a">x</p><p id="a">y</p>' +
  '</main></body></html>';

const OPTIONS = [
  { profile: 'en301549-v4.1.1' },
  { profile: 'en301549-v3.2.1' },
  { mappings: 'en301549' }
];

const summary = (result) => ({
  rollups: result.rulesResults.map((r) => r.ruleId).filter((id) => id.startsWith('en301549-')),
  clauses: result.checksResults.map((c) => [
    c.ruleId,
    (c.meta.normativeMappings || [])
      .filter((m) => m.standard === 'EN 301 549')
      .map((m) => `${m.version} ${m.requirement}`)
  ])
});

test('a scan in Chromium with packScript reports the clauses the scan in Node does', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(PAGE);
    await page.evaluate(BUNDLE);
    await page.evaluate(packScript([pack]));
    for (const options of OPTIONS) {
      const inPage = await page.evaluate(
        ([o, name]) =>
          window.a11ycore.runa11yCoreInPage(null, null, Object.assign({ packs: [name] }, o), null),
        [options, NAME]
      );
      assert.deepEqual(inPage.engine.packs, [NAME]);
      assert.equal(inPage.skippedPacks, undefined, JSON.stringify(inPage.skippedPacks));
      const inNode = runa11yCoreOnHtml(PAGE, { engineOptions: options, entryPointParity: false });
      assert.deepEqual(summary(inPage).clauses, summary(inNode).clauses, JSON.stringify(options));
      assert.deepEqual(summary(inPage).rollups, summary(inNode).rollups, JSON.stringify(options));
    }
  } finally {
    await browser.close();
  }
});
