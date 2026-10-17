# @surea11y/pack-en301549

EN 301 549, the European accessibility standard, as a pack for [`@surea11y/core`](https://github.com/SureA11y/core#readme): chapter 9 (Web) in V3.2.1 and V4.1.1, the clause that restates each WCAG Level A and AA criterion, one result per clause, a profile per version, and `mappings: ['en301549']` to name the clauses on any scan's results.

Core had EN 301 549 built in up to 1.12. It moved here, as RGAA moved to [`@surea11y/pack-rgaa`](https://github.com/SureA11y/pack-rgaa), so core keeps WCAG alone and a scan names EN 301 549 only when it is given the pack. The pack gives every result the WCAG and EN 301 549 entries core 1.12.1 gave it, in the same order (`tests/core-1.12.test.js`).

It automates what can be checked in the page, not an EN 301 549 audit: chapter 9 restates WCAG, so the pack judges each clause by core's rules for its criterion, and a scan gives results for the clauses one of those rules checks (27 of V4.1.1's 55 and 26 of V3.2.1's 50, with core 1.12's rules). Many rules ask (`cantTell`) where only a person can judge, and a conformance claim still needs a person to check every clause. Chapters 10 (non-web documents) and 11 (software) are out of scope.

It needs a `@surea11y/core` without EN 301 549 built in: core 1.12 and earlier register the `en301549` key themselves, so a scan there skips the pack. Until that core is released, the pack is developed against core's `en301549-pack` branch.

It isn't on npm: install it from this repository:

```sh
npm install github:SureA11y/core#en301549-pack github:SureA11y/pack-en301549
```

npm installs it as `@surea11y/pack-en301549`, so the examples below, and the CLI's `--pack @surea11y/pack-en301549`, name it as they would a published package.

## Using it

The pack runs wherever core runs: in Node on a jsdom page, in a real browser driven by Playwright or Puppeteer, from the command line, and in core's browser bindings. In each, give the scan the pack, and either choose a profile or ask for the clauses with `mappings`.

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

### In a browser

A pack is prepared in Node, so it reaches the page as a script: inject `packScript()` after core's browser bundle, and name the pack in `engineOptions.packs` as `name@version` (see [Packs in a page](https://github.com/SureA11y/core/blob/main/docs/INTEGRATION.md#packs-in-a-page)):

```js
const { runa11yCoreInPage } = require('@surea11y/core');
const { packScript } = require('@surea11y/core/pack');
const en301549 = require('@surea11y/pack-en301549');

const engineOptions = { packs: [`${en301549.name}@${en301549.version}`], profile: 'en301549-v4.1.1' };

await page.evaluate(packScript([en301549]));
const result = await page.evaluate(runa11yCoreInPage, page.url(), null, engineOptions, null);
```

Core's bindings register it with `.withPacks(en301549)`, and the CLI takes `--pack @surea11y/pack-en301549 --profile en301549-v4.1.1`, as for any pack.

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

`npm test` checks the formatting, lints, checks the docs (`surea11y-pack docs --check`, `docs/RULE_CATALOG.md`), then runs `tests/`: the clause table against WCAG's criteria per version, what each profile runs and reports, the mappings option, a scan in Chromium with `packScript`, and every result on core's scenario pages against core 1.12.1's (installed as `core-1.12`; it reads the pages from a core checkout beside this one, `../core`, and is skipped without one). They scan with the pack through `@surea11y/core/testing` (`tests/helpers/run.js`).

## Licence

The code is under the [Mozilla Public License 2.0](./LICENSE), as `@surea11y/core` is.
