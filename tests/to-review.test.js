'use strict';

/**
 * standard-to-review.json lists the translations of the standard to check
 * again because their English changed after they were made, each under the
 * English as it is now, with the English it was made from. This keeps the
 * list honest: every entry names a locale and an English text that locale
 * translates, and English that has changed since, so an entry whose
 * translation was updated without removing it fails here.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  problemsOf,
  pendingOf,
  readRecord,
  readTranslations,
  LOCALES
} = require('../scripts/lib/to-review');
const pack = require('..');

test('the record covers the languages the standard is translated into', () => {
  assert.deepEqual(LOCALES, Object.keys(pack.standard.translations || {}).sort());
});

test('every entry is a translation whose English changed after it was made', () => {
  assert.deepEqual(problemsOf(readRecord(), readTranslations()), []);
});

const translations = { fr: { 'Press Tab.': 'Appuyer sur Tab.' } };

test('an entry gives the English it was made from, the English now and the translation', () => {
  const record = { $comment: 'x', fr: { 'Press Tab.': 'Press the Tab key.' } };
  assert.deepEqual(problemsOf(record, translations), []);
  assert.deepEqual(pendingOf(record, translations), [
    { locale: 'fr', was: 'Press the Tab key.', now: 'Press Tab.', translation: 'Appuyer sur Tab.' }
  ]);
});

test('a wrong entry is named', () => {
  assert.deepEqual(problemsOf({ it: {} }, translations), [
    'it: not a language the standard is translated into'
  ]);
  assert.deepEqual(problemsOf({ fr: ['Press Tab.'] }, translations), [
    'fr: is to map English texts to the English they were translated from'
  ]);
  assert.deepEqual(
    problemsOf({ fr: { 'Press Tab.': 'Press Tab.', 'Look.': 'Look up.' } }, translations),
    [
      'fr "Press Tab.": the English is unchanged, so the entry is to be removed',
      'fr "Look.": not translated'
    ]
  );
  assert.deepEqual(problemsOf({ fr: { 'Press Tab.': '' } }, translations), [
    'fr "Press Tab.": the English it was made from is missing'
  ]);
});
