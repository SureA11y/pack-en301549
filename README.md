# @surea11y/pack-en301549

EN 301 549, the European accessibility standard, as a pack for [`@surea11y/core`](https://www.npmjs.com/package/@surea11y/core): chapter 9 (Web) in V3.2.1 and V4.1.1, the clause that restates each WCAG Level A and AA criterion, one result per clause, a profile per version, and `mappings: ['en301549']` to name the clauses on any scan's results.

Core has had EN 301 549 built in, deprecates it in 1.13 and removes it in 2.0.0. It moves here, so core keeps WCAG alone and a scan names EN 301 549 only when it is given the pack. The pack gives every result the WCAG and EN 301 549 entries core 1.12.1 gave it, in the same order (`tests/core-1.12.test.js`).

It automates what can be checked in the page, not an EN 301 549 audit: chapter 9 restates WCAG, so the pack judges each clause by core's rules for its criterion, and a scan gives results for the clauses one of those rules checks (30 of V4.1.1's 55 and 29 of V3.2.1's 50, with core 1.14's rules). Many rules ask (`cantTell`) where only a person can judge, and a conformance claim still needs a person to check every clause. Chapters 10 (non-web documents) and 11 (software) are out of scope.

It needs `@surea11y/core` 1.13.0 or later. From 1.13, a scan given the pack uses the pack's EN 301 549 in place of core's deprecated built-in, with no deprecation notice. Core 1.12 and earlier register the `en301549` key themselves, so a scan there skips the pack.

```sh
npm install @surea11y/core @surea11y/pack-en301549
```

### Switching from core's built-in

Add the pack to `engineOptions.packs` (in a page, with `packScript()`) and keep the profile and mapping names. `mappings: ['en301549']` gives every result the entries core gave. The profiles report one result per clause in place of WCAG rollups; `profile: 'wcag22-aa', mappings: ['en301549:V4.1.1']` keeps the WCAG rollups with their clauses. Read the clause table from `@surea11y/pack-en301549/public` instead of `@surea11y/core/en301549`.

## Using it

The pack runs wherever core runs. In each place, give the scan the pack, and either choose a profile or ask for the clauses with `mappings`:

| Where | How the scan gets the pack | Rendered page |
|---|---|---|
| Node, on a jsdom page (or `runa11yCoreOnHtml` from `@surea11y/core/testing`) | `packs: [en301549]` | no: the HTML as parsed, without layout |
| A browser driven by Playwright or Puppeteer, yours | `packScript([en301549])` injected after core's browser bundle | yes |
| Core's bindings (Playwright, Puppeteer, Selenium, WebdriverIO, Cypress) | `.withPacks(en301549)` | yes |
| Core's CLI, `@surea11y/cli` | `--pack @surea11y/pack-en301549` | no: static HTML, its scripts not run |
| A page with no driver: a `<script>` tag, a bookmarklet, a browser extension | a script file written once in Node, loaded after core's bundle | yes |

Where the page is rendered, the rules that measure the layout decide (9.2.5.8 Target size (minimum), the geometry of 9.1.4.3 Contrast); on jsdom they answer `notApplicable` or `cantTell`, and `engine.environment.layout` says which kind of scan it was. A clause can so pass in Node and fail in a browser, or the reverse. See core's [`LIMITATIONS.md`](https://github.com/SureA11y/core/blob/main/docs/LIMITATIONS.md).

### A scan against EN 301 549

```js
const { JSDOM } = require('jsdom');
const { runDomRulesInPage } = require('@surea11y/core');
const en301549 = require('@surea11y/pack-en301549');

const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;

const result = runDomRulesInPage('https://example.com/', null, {
  packs: [en301549],
  profile: 'en301549-v4.1.1'
});
result.engine.profile;     // 'en301549-v4.1.1'
result.engine.wcagVersion; // '2.2'
dom.window.close();
```

| Profile | Runs | Judged by | Reports |
|---|---|---|---|
| `en301549-v4.1.1` | every core rule mapped to a WCAG 2.2 A or AA criterion | WCAG 2.2 | one result per V4.1.1 clause, `en301549-V4.1.1-9.1.1.1` and so on |
| `en301549-v3.2.1` | every core rule mapped to a WCAG 2.1 A or AA criterion | WCAG 2.1, so 4.1.1 Parsing counts | one result per V3.2.1 clause, 9.4.1.1 included |

Under either profile, `rulesResults` holds EN 301 549's clauses and nothing of WCAG. A rule's result in `checksResults` still names its WCAG criterion, followed by its clause, in `meta.normativeMappings`, and the clauses it counts towards in `rollupIds`. A best-practice rule, or one mapped only to AAA criteria, doesn't run: no clause restates its criteria.

```js
const clauses = result.rulesResults.filter((r) => r.meta && r.meta.standard === 'EN 301 549');
clauses.filter((r) => r.outcome === 'fail').map((r) => r.ruleId); // ['en301549-V4.1.1-9.1.1.1', ...]
```

### The clauses on a WCAG scan

`engineOptions.mappings` names the clauses on the results of any scan, without changing what runs or what it decides. With the whole standard, both versions; with `en301549:V4.1.1` or `en301549:V3.2.1`, that version only:

```js
runDomRulesInPage(url, null, { packs: [en301549], profile: 'wcag22-aa', mappings: ['en301549:V4.1.1'] });
```

A rule names the clause of each of its criteria; a WCAG rollup names the clause of its own criterion, whichever of its rules decided it. SARIF tags each rule `en301549-9.1.1.1`, JUnit adds an `en301549` property per clause, and the HTML report shows the clause beside each criterion.

### In a browser you drive

A pack is prepared in Node, where `@surea11y/core/pack` reads core's rules, so it reaches the page as a script: inject core's browser bundle, then `packScript()`, and name the pack in `engineOptions.packs` as `name@version` (see core's [Packs in a page](https://github.com/SureA11y/core/blob/main/docs/INTEGRATION.md#packs-in-a-page)). In Playwright or Puppeteer:

```js
const fs = require('node:fs');
const { packScript } = require('@surea11y/core/pack');
const en301549 = require('@surea11y/pack-en301549');

const engineOptions = { packs: [`${en301549.name}@${en301549.version}`], profile: 'en301549-v4.1.1' };

await page.goto(url);
await page.evaluate(fs.readFileSync(require.resolve('@surea11y/core/browser'), 'utf8'));
await page.evaluate(packScript([en301549]));
const result = await page.evaluate(
  (options) => window.a11ycore.runa11yCoreInPage(location.href, null, options, null),
  engineOptions
);
result.skippedPacks; // undefined: the page ran the pack
```

Inject both into every frame you scan. The scan gives the clauses a scan in Node gives (`tests/browser.test.js`).

### With core's bindings

The bindings register the pack in the page, and in every frame with `.frames(true)`:

```js
const { A11yCoreBuilder } = require('@surea11y/playwright'); // or puppeteer, selenium, webdriverio
const en301549 = require('@surea11y/pack-en301549');

const results = await new A11yCoreBuilder({ page })
  .withPacks(en301549)
  .options({ profile: 'en301549-v4.1.1' })
  .analyze();
```

In Cypress, `.withPacks('@surea11y/pack-en301549')` takes the package name, and the binding's plugin prepares the pack in Node. A pack the page didn't run is a `'pack-skipped'` gap in `getScanGaps(results)`.

### From the CLI

```sh
npx surea11y scan ./dist/index.html --pack @surea11y/pack-en301549 --profile en301549-v4.1.1
```

Install the pack in the project beside `@surea11y/cli`. The CLI scans the HTML as it is, without running its scripts: a page its scripts build needs a browser.

### In a page of your own: a script tag, an extension

A page with no driver, such as a manual check, a bookmarklet or a browser extension's content script, loads the pack as it loads core: as a file. Build one file in Node, core's browser bundle with the pack registered after it, from the core you will ship:

```sh
node -e "const fs = require('node:fs'); const { buildBrowserBundle } = require('@surea11y/core/pack'); fs.writeFileSync('surea11y-en301549.js', buildBrowserBundle({ packs: [require('@surea11y/pack-en301549')] }))"
```

```html
<script src="surea11y-en301549.js"></script>
<script>
  const result = a11ycore.runa11yCoreInPage(location.href, null, {
    packs: ['@surea11y/pack-en301549@<version>'], // the version the file was built with
    profile: 'en301549-v4.1.1'
  }, null);
</script>
```

The pack's script runs only with the core it was prepared with, since it carries the catalog core and the pack make together: a page with another core's bundle runs the scan without the pack, and lists it in `skippedPacks` naming the two versions. One file can't fall out of step that way. Build it again when you update core or the pack, and update the `name@version` the page names with it: `require('@surea11y/pack-en301549').version` gives the installed version. For the same reason the pack ships no prebuilt file: it would fit one core release, and the pack supports every one from 1.13.0.

Where core's bundle is already on the page (a tool that loads it for its own scans, a language side file after it), load `packScript([en301549])` from `@surea11y/core/pack` after the bundle instead, written to a file with the same core. Either is plain functions, so it runs where a Content Security Policy forbids `eval`.

### Building a tool on it

An extension, an online validator, a dashboard or a CI step runs the pack in one of the places above. A validator that loads a URL in a headless browser on the server is the browser case; one that checks the HTML it is given, without its scripts, is the jsdom case. For any of them:

- Check `skippedPacks` before treating a scan as complete: a scan that skips the pack still finishes, without the clauses. `engine.packs` names the pack that ran with its installed version, such as `@surea11y/pack-en301549@1.0.1`.
- Read the clauses from `rulesResults` (`meta.standard === 'EN 301 549'`) under the profiles, or from `meta.normativeMappings` with `mappings`. `result.standards` names EN 301 549, so core's HTML, SARIF and JUnit reporters render a stored result the same wherever they run, with or without the pack installed.
- Say what the scan was: a result is automated checks on one page in one state, not an audit, and many clauses come back `cantTell` or are not checked at all. The clause table (below) lists the clauses a scan didn't cover.
- Say which kind of page it scanned (`engine.environment.layout`), since the layout rules decide only in a rendered page.

Core's [`BUILDING_ON_CORE.md`](https://github.com/SureA11y/core/blob/main/docs/BUILDING_ON_CORE.md) covers the rest: which runner, when to scan, presenting results, comparing runs.

### The clause table

`@surea11y/pack-en301549/public` publishes the table, with the exports `@surea11y/core/en301549` had up to core 1.12, for tools that ask the reverse question, such as which criteria a version requires that a scan did not cover:

```js
const { EN301549_CLAUSES, en301549ClausesForSc } = require('@surea11y/pack-en301549/public');

Object.keys(EN301549_CLAUSES['V3.2.1']); // the 50 WCAG 2.1 A and AA criteria V3.2.1 restates
en301549ClausesForSc('2.5.8');           // [{ version: 'V4.1.1', clause: '9.2.5.8', title: 'Target size (minimum)' }]
```

A clause on a result is a correspondence between two published documents, not a conformance claim. Which version a given law requires is outside the pack.

## What it brings

- **The clause table** (`clauses.js`): for V3.2.1 (2021-03, WCAG 2.1, with 9.4.1.1 Parsing) and V4.1.1 (2026-09, WCAG 2.2, adding 2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7 and 3.3.8, with 9.4.1.1 void), each clause's number and the version's own title, from the ETSI text. The requirements (`requirements.js`) are built from it.
- **The mapping** (`rule-map.js`): each core rule checks the clause of each WCAG criterion it maps to, in every version that has it. It is derived from the installed core's rule catalog, so a rule core adds is checked under the profiles with no change here.
- **One result per clause** a rule checks, in its own section of the HTML report.
- **Two profiles**, `en301549-v4.1.1` and `en301549-v3.2.1`: EN 301 549 alone, judged by the WCAG version each is built on.
- **A note for the HTML report** above the clauses, in English, French, German, Spanish and Japanese.

The pack has no rules of its own: chapter 9 asks nothing WCAG doesn't.

## Tests

Install Chromium once with `npx playwright install chromium`. `npm test` checks the formatting, lints, checks the docs (`surea11y-pack docs --check`, `docs/RULE_CATALOG.md`), then runs `tests/`: the clause table against WCAG's criteria per version, what each profile runs and reports, the mappings option, a scan in Chromium with `packScript`, and every result on core's scenario pages against core 1.12.1's (installed as `core-1.12`; it reads the pages from a core checkout beside this one, `../core`, and is skipped without one). They scan with the pack through `@surea11y/core/testing` (`tests/helpers/run.js`).

## Licence

The code is under the [Mozilla Public License 2.0](./LICENSE), as `@surea11y/core` is.
