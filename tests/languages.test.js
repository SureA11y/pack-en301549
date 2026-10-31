'use strict';

/**
 * The standard in French, German, Spanish and Japanese as well as English
 * (core's standard.lang and standard.translations, docs/PACKS.md in core):
 * its own procedures, its clauses' and chapters' titles and its notes, keyed
 * by the English they translate (i18n/standard.<locale>.json). Read in one
 * of them, the standard is in that language throughout, core's procedures
 * of the clauses that restate WCAG included. A core that reads no
 * translations ignores them, and these tests say so and stop.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const core = require('@surea11y/core');
const corePack = require('@surea11y/core/pack');
const pack = require('..');
const { runa11yCoreOnHtml } = require('./helpers/run');

const LOCALES = ['de', 'es', 'fr', 'ja'];
const reads =
  typeof corePack.packTranslationCoverage === 'function' &&
  typeof core.listProcedures === 'function';
const skip = reads ? false : 'this core reads no translations of a standard';

test('the standard is written in English and translated into four languages', () => {
  assert.equal(pack.standard.lang, 'en');
  assert.deepEqual(Object.keys(pack.standard.translations || {}).sort(), LOCALES);
});

test('every text of the standard has its translation in every language', { skip }, () => {
  const coverage = corePack.packTranslationCoverage(pack);
  assert.deepEqual(coverage.map((c) => c.locale).sort(), LOCALES);
  for (const c of coverage) {
    assert.deepEqual(c.missing, [], `${c.locale}: ${c.missing.length} texts not translated`);
    assert.ok(c.total > 500, `${c.locale}: ${c.total} texts`);
  }
  assert.deepEqual(corePack.checkPack(pack), []);
});

const list = (locale, version = 'V4.1.1') =>
  core.listProcedures({ packs: [pack], standard: 'en301549', version, locale });

test('read in one of its languages, nothing of the standard is left in another', { skip }, () => {
  for (const locale of LOCALES) {
    for (const version of ['V3.2.1', 'V4.1.1']) {
      const l = list(locale, version);
      assert.equal(l.locale, locale);
      assert.equal(l.notesLang === undefined || l.notesLang === locale, true, `${locale} notes`);
      const walk = (groups) => {
        for (const g of groups) {
          assert.equal(g.titleLang, locale, `${locale} ${version} group ${g.id}`);
          walk(g.groups);
        }
      };
      walk(l.groups);
      for (const r of l.requirements) {
        if (r.title) assert.equal(r.titleLang, locale, `${locale} ${version} ${r.id} title`);
        if (r.note) assert.equal(r.noteLang, locale, `${locale} ${version} ${r.id} note`);
        for (const f of r.facets) {
          if (f.lang) assert.equal(f.lang, locale, `${locale} ${version} ${r.id} ${f.id}`);
          if (f.procedureLang) assert.equal(f.procedureLang, locale, `${r.id} ${f.id}`);
        }
      }
    }
  }
});

test('a clause that restates WCAG reads core’s procedures in the same language', { skip }, () => {
  const fr = list('fr').requirements.find((r) => r.id === '9.1.1.1');
  const en = list('en').requirements.find((r) => r.id === '9.1.1.1');
  assert.notEqual(fr.title, en.title);
  const step = (r) => r.facets.find((f) => f.procedure).procedure.steps[0];
  assert.notEqual(step(fr), step(en));
  assert.equal(step(fr), step(core.proceduresFor('1.1.1', { locale: 'fr' })));
});

test('a language the standard lacks reads it in English, core’s procedures too', { skip }, () => {
  const pt = list('pt-BR');
  assert.equal(pt.locale, 'en');
  const own = pt.requirements.find((r) => r.id === '4.2.1');
  assert.equal(own.titleLang, 'en');
  assert.equal(own.title, list('en').requirements.find((r) => r.id === '4.2.1').title);
});

test('a scan names the clauses in the scan’s language', { skip }, () => {
  const html =
    '<!doctype html><html lang="fr"><head><title>T</title></head><body><main>' +
    '<img src="a.png"></main></body></html>';
  const scan = (locale) =>
    runa11yCoreOnHtml(html, { engineOptions: { profile: 'en301549-v4.1.1', locale } });
  const fr = scan('fr');
  const en = scan('en');
  const title = (result) =>
    result.rulesResults.find((r) => r.ruleId === 'en301549-V4.1.1-9.1.1.1').title;
  assert.notEqual(title(fr), title(en));
  const standard = fr.standards.find((s) => s.key === 'en301549');
  assert.equal(standard.titleLang, undefined);
});
