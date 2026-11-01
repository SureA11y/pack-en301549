# @surea11y/pack-en301549

EN 301 549, the European accessibility standard, as a pack for [`@surea11y/core`](https://www.npmjs.com/package/@surea11y/core): chapter 9 (Web) in V3.2.1 and V4.1.1, the clause that restates each WCAG Level A and AA criterion, one result per clause, a profile per version, and `mappings: ['en301549']` to name the clauses on any scan's results.

Core has had EN 301 549 built in, deprecates it in 1.13 and removes it in 2.0.0. It moves here, so core keeps WCAG alone and a scan names EN 301 549 only when it is given the pack. The pack gives every result the WCAG and EN 301 549 entries core 1.12.1 gave it, in the same order (`tests/core-1.12.test.js`).

It automates what can be checked in the page, not an EN 301 549 audit: chapter 9 restates WCAG, so the pack judges each clause by core's rules for its criterion, and a scan gives results for the clauses one of those rules checks (30 of V4.1.1's 55 and 29 of V3.2.1's 50, with core 1.14's rules). Many rules ask (`cantTell`) where only a person can judge, and a conformance claim still needs a person to check every clause. With core 1.14, no clause passes: core's rules check only part of what each criterion asks, so where they all pass the clause is `cantTell` (`composite.rollup.cantTell.partialCheck`), as its WCAG criterion is. The scans cover chapter 9 alone; for the standard's other requirements, chapter 4's functional performance statements, chapter 12 and the other chapters, the pack says how a person assesses them by hand ([below](#the-standards-own-requirements)), with no rule or result.

It needs `@surea11y/core` 1.13.0 or later. From 1.13, a scan given the pack uses the pack's EN 301 549 in place of core's deprecated built-in, with no deprecation notice. Core 1.12 and earlier register the `en301549` key themselves, so a scan there skips the pack. With core 1.14.0 or later, a clause is judged as core judges the criterion it restates, and V3.2.1 keeps 4.1.1 Parsing; with 1.13, the pack behaves as its 1.0 releases do (see the [changelog](./CHANGELOG.md)).

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
| Core's CLI, `@surea11y/cli` | `--pack @surea11y/pack-en301549` | no: static HTML, its scripts not run; yes with `--browser` (`@surea11y/cli` 1.4.0) |
| A page with no driver: a `<script>` tag, a bookmarklet, a browser extension | a script file written once in Node, loaded after core's bundle | yes |

Where the page is rendered, the rules that measure the layout decide (9.2.5.8 Target size (minimum), the geometry of 9.1.4.3 Contrast); on jsdom they answer `notApplicable` or `cantTell`, and `engine.environment.layout` says which kind of scan it was. A clause can so be `cantTell` in Node and fail in a browser, or the reverse. See core's [`LIMITATIONS.md`](https://github.com/SureA11y/core/blob/main/docs/LIMITATIONS.md).

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
| `en301549-v3.2.1` | every core rule mapped to a WCAG 2.1 A or AA criterion | WCAG 2.1, with 4.1.1 Parsing, which the 2023 errata count as satisfied and V3.2.1 keeps (`keepsParsing`) | one result per V3.2.1 clause, 9.4.1.1 included |

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
const { listenerHookScript, addHowToCheck } = require('@surea11y/core');
const en301549 = require('@surea11y/pack-en301549');

const engineOptions = { packs: [`${en301549.name}@${en301549.version}`], profile: 'en301549-v4.1.1' };

await page.addInitScript({ content: listenerHookScript() }); // Puppeteer: evaluateOnNewDocument
await page.goto(url);
await page.evaluate(fs.readFileSync(require.resolve('@surea11y/core/browser'), 'utf8'));
await page.evaluate(packScript([en301549]));
const inPage = await page.evaluate(
  (options) => window.a11ycore.runa11yCoreInPage(location.href, null, options, null),
  engineOptions
);
inPage.skippedPacks; // undefined: the page ran the pack
const result = addHowToCheck(inPage, { packs: [en301549] });
```

Inject both into every frame you scan. The scan gives the clauses a scan in Node gives (`tests/browser.test.js`).

The two lines around the scan are optional, and need core 1.14. Core's hooks run before the page's own scripts, so some rules see what those scripts do. With the listener hook, a `role="button"` given a click handler from script that nothing can focus fails 9.2.1.1, where without it the clause asks. `internalsHookScript()` and `liveRegionHookScript()` do the same for `ElementInternals` and status messages (9.4.1.3); see core's [`BINDING_AUTHORS_GUIDE.md`](https://github.com/SureA11y/core/blob/main/docs/BINDING_AUTHORS_GUIDE.md). The engine in the page leaves out the steps to answer each question (`howToCheck`), and `addHowToCheck` adds them in Node, as a scan in Node has them.

### With core's bindings

The bindings register the pack in the page, and in every frame with `.frames(true)`, and those built on core 1.14 install its hooks and add the steps to each question for you:

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

Install the pack in the project beside `@surea11y/cli`. The CLI scans the HTML as it is, without running its scripts. From `@surea11y/cli` 1.4.0, `--browser` scans the page in headless Chromium through Playwright, with its scripts run and core's hooks installed, and the pack runs there too:

```sh
npx surea11y scan https://example.com/ --browser --pack @surea11y/pack-en301549 --profile en301549-v4.1.1
```

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

- Check `skippedPacks` before treating a scan as complete: a scan that skips the pack still finishes, without the clauses. `engine.packs` names the pack that ran with its installed version, such as `@surea11y/pack-en301549@1.1.0`.
- Read the clauses from `rulesResults` (`meta.standard === 'EN 301 549'`) under the profiles, or from `meta.normativeMappings` with `mappings`. `result.standards` names EN 301 549, so core's HTML, SARIF and JUnit reporters render a stored result the same wherever they run, with or without the pack installed.
- Say what the scan was: a result is automated checks on one page in one state, not an audit, and many clauses come back `cantTell` or are not checked at all. The clause table (below) lists the clauses a scan didn't cover.
- Say which kind of page it scanned (`engine.environment.layout`), since the layout rules decide only in a rendered page.

Core's [`BUILDING_ON_CORE.md`](https://github.com/SureA11y/core/blob/main/docs/BUILDING_ON_CORE.md) covers the rest: which runner, when to scan, presenting results, comparing runs.

### Checking a clause by hand

Most clauses come back `cantTell` or are not checked at all, for a person to finish. With a core that has test procedures (1.15 and later), each clause gives the steps for that, the procedures of the WCAG criterion it restates, in every language core has them:

```js
const { proceduresFor } = require('@surea11y/core');

proceduresFor('9.1.4.3', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' });
// { standard: 'EN 301 549', id: '9.1.4.3', version: 'V4.1.1', title: 'Contrast (minimum)', wcag: '1.4.3', facets: [...] }
```

Each facet has what a person checks, the steps, what passes and what fails, the tools it needs and the core rules that cover it (core's [`PROCEDURES.md`](https://github.com/SureA11y/core/blob/main/docs/PROCEDURES.md)). `version` defaults to the latest that has the clause. In code that runs in a browser, `proceduresFrom` from `@surea11y/core/procedures` does the same with the dictionaries it imports. An older core gives none.

### The standard's own requirements

EN 301 549 asks more than chapter 9, and no scan answers it: how the product works for people with each kind of need, its documentation and support, and its parts that are not web pages. With core 1.15 and later, `proceduresFor` reads how a person assesses these too, in the shape it gives a clause, with the facets the pack writes for each (`own-procedures.json`, read by `own-procedures.js`):

| Requirements | V3.2.1 | V4.1.1 |
|---|---|---|
| Chapter 4, functional performance (statements in V3.2.1, criteria in V4.1.1) | `4.2.1` to `4.2.11` | `4.2.1` to `4.2.11` |
| Chapter 12 | `12.1.1`, `12.1.2`, `12.2.2`, `12.2.3`, `12.2.4` (Documentation and support services) | `12.1` to `12.5` (Information about products and services) |
| Chapter 9's own, beside its clauses | `9.6` (WCAG conformance requirements) | `9.6`, `9.7` (User preferences for web pages) |
| The other chapters, one requirement each | `5`, `6`, `7`, `8`, `10`, `11`, `13` | `5`, `6`, `7`, `8`, `10`, `11`, `13` |

```js
proceduresFor('4.2.1', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' });
// { standard: 'EN 301 549', id: '4.2.1', version: 'V4.1.1', title: 'Usage without vision', complete: true, rules: [], facets: [...] }

proceduresFor('12.1.2', { packs: [en301549], standard: 'en301549', version: 'V4.1.1' }); // null: V4.1.1 has 12.1 instead
```

How to read them:

- **A chapter 4 statement** is about whole tasks done the way a person with that need does them: with a screen reader and the screen off, enlarged, in greyscale, with the sound off. Its `related-clauses` facet sends the person to the clauses Annex B relates to it (in V3.2.1 the chapter 9 clauses Table B.2 marks primary or secondary, in V4.1.1 every clause it marks primary or secondary, in any chapter), which are assessed with their own procedures and results, rather than repeating them; its other facets are what only using the product shows. In V4.1.1 every criterion has one, 4.2.6, 4.2.8 and 4.2.11 included, and the clauses it names as examples are ones Table B.2 marks primary, chapter 9's first ([`annex-b.js`](annex-b.js)); in V3.2.1, 4.2.6, 4.2.8 and 4.2.11 have none.
- **Chapter 9's own requirements** are about the page as a whole. 9.6 is WCAG's five conformance requirements at Level AA: the clauses met or a conforming alternate version, the full page with nothing left out, every page of a process, ways of using technologies that assistive technologies support, and no content that gets in the way of the rest. 9.7, new in V4.1.1, keeps a page from blocking or overriding the user's own colours, text size, pointer and text cursor, unless that is essential.
- **Chapter 12** is about the product's documentation and support, not its pages; a documentation facet has the person assess each document against chapter 9 or 10 by its format.
- **A chapter** (`'5'`, `'11'`) is mostly a question of whether it applies to the product: each facet starts by deciding that, says to record it as not applicable where it isn't, and how to assess it where it is. For a web product, the parts that can apply have a facet of their own, such as activation of accessibility features (5.2) and simultaneous actions (5.9), video players (chapter 7) and, in V3.2.1, user preferences and authoring tools (11.7, 11.8). The pack's procedures for a chapter are by version: V4.1.1 moved authoring tools to 5.10, and puts a web view inside an app under chapter 11.

Every facet is `manual`: no rule claims it, so `rules` is empty and no scan gives these requirements a result. Their text is in English, French, German, Spanish and Japanese (`i18n/standard.<locale>.json`, see [Languages](#languages)), and the tools' labels as core has them. A chapter is keyed by its number, so in `standard.procedures` the chapters come before the clauses, as JavaScript orders whole-number keys; ask for a requirement by its id. The clause numbers and titles are the standard's; the procedures are written for the pack, and their wording may improve in any release.

#### Editing them

The text is data, in [`own-procedures.json`](own-procedures.json), so it can be read and changed without touching code:

- `requirements` lists each requirement in order, with its `id`, `title` and `facets`. A facet has its `label`, `automation`, `tools`, `steps`, `passWhen` and `failWhen`.
- A value that differs between versions is an object keyed by version, `{ "V3.2.1": "…", "V4.1.1": "…" }`. In a list of steps, an item that names one version only is left out of the other. `versions`, on a requirement or a facet, lists the versions it is in, where it isn't in both.
- A chapter 4 `related-clauses` facet takes its text from `templates`, filling in the requirement's number (`{id}`) and its own `column`, `need`, `clauses` and `example`. In V4.1.1 the clauses it names have to be ones Table B.2 marks primary for the criterion.
- `notes` is what a version's list of procedures says first.

`own-procedures.js` checks the file as it reads it: an unknown tool or version, a field missing in a version, an empty step list, two facets with one id or an unknown template field stops the pack loading, with the place named, and `npm test` fails. Changing an English text unpairs it from its translations, which are keyed by the English (`i18n/standard.<locale>.json`): update their keys and translations with it, or the text shows in English.

### The whole standard, in its chapters

With core 1.15 and later, core's `listProcedures` and `procedureChecklist` read every requirement of a version at once, in the standard's chapters (`groups.js`), and `relatedRequirements` goes between the clauses, the chapter 4 statements and WCAG ([`PROCEDURES.md`](https://github.com/SureA11y/core/blob/main/docs/PROCEDURES.md#listing-them) in core):

```js
const { listProcedures, procedureChecklist, relatedRequirements } = require('@surea11y/core');

listProcedures({ packs: [en301549], standard: 'en301549', version: 'V4.1.1' });
// { standard: 'EN 301 549', key: 'en301549', version: 'V4.1.1', requirements: [...], groups: [
//   { id: '4', title: 'Functional performance', requirements: ['4.2.1', …, '4.2.11'], groups: [] },
//   { id: '5', title: 'Generic requirements', requirements: ['5'], groups: [] },
//   …
//   { id: '9', title: 'Web', requirements: [], groups: [
//     { id: '9.1', title: 'Perceivable', requirements: [], groups: [
//       { id: '9.1.1', title: 'Text alternatives', requirements: ['9.1.1.1'], groups: [] }, … ] }, … ] },
//   … ] }

procedureChecklist({ packs: [en301549], standard: 'en301549', automation: ['manual', 'partial'] });
// what a person does once each, in the same chapters: what a scan leaves to them

relatedRequirements('1.4.3', { packs: [en301549] });
// [{ id: '4.2.2', relation: 'relatesTo', … }, { id: '4.2.10', relation: 'relatesTo', … },
//  { id: '9.1.4.3', relation: 'restates', … }]
relatedRequirements('4.2.2', { packs: [en301549], standard: 'en301549' });
// the WCAG criteria of the chapter 9 clauses Table B.2 marks primary for 4.2.2: 1.1.1, 1.2.1, 1.3.3, …
```

- **The chapters** are the groups, in number order: chapter 4's statements, chapter 12's requirements, and each other chapter, which the pack gives as one requirement, as a group of that one. Chapter 9's clauses are under the principles and guidelines they are numbered by, as WCAG's are (9.1 Perceivable, 9.1.1 Text alternatives), and its own requirements, 9.6 and 9.7, follow them, each a group of that one. Every requirement of a version is in exactly one group.
- **9.6 relates to WCAG** through the clauses its fifth conformance requirement asks of all content on the page, 9.1.4.2, 9.2.1.2, 9.2.2.2 and 9.2.3.1: `relatedRequirements('2.1.2', …)` gives 9.6 next to 9.2.1.2.
- **A chapter 4 statement relates to WCAG** through chapter 9 clauses Annex B (Table B.2) relates to it, and `relatesTo` lists the criteria they restate, in number order. How each version gets them:
  - **V4.1.1**: every chapter 9 clause Table B.2 marks primary for the criterion, as [`annex-b.js`](annex-b.js) records the table ([`docs/annex-b-v4.1.1.md`](docs/annex-b-v4.1.1.md) gives it with its pages). 9.6 and 9.7 restate no criterion, so they add none. Secondary marks are left out on purpose: Annex B defines them as partial support ("some users may use the feature in specific situations"). The procedure still sends the person to every clause marked primary or secondary, as Annex C's first check asks.
  - **V3.2.1**, whose Annex B is not recorded: the chapter 9 clauses its `related-clauses` facet names, from the same list, so the two can't differ. They are the ones the procedure names, not every clause the table marks.

### Languages

The standard is written in English and translated into French, German, Spanish and Japanese, with core 1.15 and later: its own procedures, the titles of its clauses, chapters and groups, and the note at the top of a version's procedures (`i18n/standard.<locale>.json`, keyed by the English they translate, as core's `standard.translations` reads them). Read in one of those languages, the standard is in that language throughout, core's procedures of the chapter 9 clauses included, and a scan names the clauses in it. In another language (Portuguese, say), it is all in English, core's procedures too, rather than English beside Portuguese.

```js
const { listProcedures } = require('@surea11y/core');
listProcedures({ packs: [en301549], standard: 'en301549', version: 'V4.1.1', locale: 'es' });
```

The clause titles follow each language's published text where there is one: in Spanish, UNE-EN 301549; in German, DIN EN 301549 (the chapters of V3.2.1); chapter 9's, which restate WCAG's criteria, as core names those criteria in each language. A clause that only V4.1.1 has is translated in the same style. `packTranslationCoverage(en301549)` from `@surea11y/core/pack` says what each translation leaves out; a test holds every language to every text.

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
- **How to check each clause by hand**, with core 1.15 and later: the procedures of the criterion it restates.
- **How to assess the standard's own requirements by hand**, with core 1.15 and later: chapter 4, chapter 9's own (9.6, 9.7), chapter 12 and the other chapters, in both versions (`own-procedures.json`), in English, French, German, Spanish and Japanese.
- **The standard's chapters** (`groups.js`), which core's lists of procedures show the requirements in, and the WCAG criteria each chapter 4 statement relates to, with core 1.15 and later.
- **A note for the HTML report** above the clauses, in English, French, German, Spanish and Japanese.

The pack has no rules of its own: chapter 9 asks nothing WCAG doesn't, and the standard's own requirements are for a person to assess.

## Tests

Install Chromium once with `npx playwright install chromium`. `npm test` checks the formatting, lints, checks the docs (`surea11y-pack docs --check`, `docs/RULE_CATALOG.md`), then runs `tests/`: the clause table against WCAG's criteria per version, what each profile runs and reports, the mappings option, a scan in Chromium with `packScript` and with core's listener hook, the procedures of every clause and own requirement, and every result on core's scenario pages against core 1.12.1's (installed as `core-1.12`; it reads the pages from a core checkout beside this one, `../core`, and is skipped without one). They scan with the pack through `@surea11y/core/testing` (`tests/helpers/run.js`).

A baseline (`tests/baseline*.test.js`, `tests/fixtures/baseline/core-<version>.json`) holds what the pack gave with each core it was recorded with: its tables and standard, the entries it names for each criterion, every scan the tests make, the scans of core's scenario pages, and how core reads each chapter 9 clause's procedures in every locale. The tests compare the pack against it, and skip with a core no baseline was recorded with or whose rules have changed since; the comparison of the clauses' procedures, which are core's text, also skips with a core whose own procedures have changed since. A difference is a change in what the pack gives: look at it, never record it again. `node scripts/record-baseline.js` records one for a new core, from a pack that gives what it gave before; it never writes over one.

## Licence

The code is under the [Mozilla Public License 2.0](./LICENSE), as `@surea11y/core` is.
