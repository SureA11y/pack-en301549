'use strict';

/**
 * The translations of the standard that are to be checked again
 * (standard-to-review.json): by locale, each English text as it is now, the
 * key its translation is under in i18n/standard.<locale>.json, with the
 * English the translation was made from. An entry is recorded when the
 * English changes, its translation moved to the new English, and removed
 * once the translation is updated.
 *
 * - problemsOf(record, translations): what is wrong with the record, as
 *   text: an unknown locale, an English text the locale has no translation
 *   under, or an entry whose English is unchanged, which is to be removed.
 * - pendingOf(record, translations): each entry, with the English it was
 *   made from (was), the English now (now) and the translation.
 *
 * translations is { locale: { english: text } }.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const RECORD_FILE = path.join(ROOT, 'standard-to-review.json');
const LOCALES = ['de', 'es', 'fr', 'ja'];

const isText = (v) => typeof v === 'string' && v.length > 0;
const entriesOf = (record) => Object.entries(record || {}).filter(([k]) => k !== '$comment');

function problemsOf(record, translations) {
  const problems = [];
  for (const [locale, entries] of entriesOf(record)) {
    const dict = translations[locale];
    if (!dict) {
      problems.push(`${locale}: not a language the standard is translated into`);
      continue;
    }
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
      problems.push(`${locale}: is to map English texts to the English they were translated from`);
      continue;
    }
    for (const [now, was] of Object.entries(entries)) {
      const short = now.length > 60 ? `${now.slice(0, 57)}...` : now;
      if (!isText(was))
        problems.push(`${locale} "${short}": the English it was made from is missing`);
      else if (!Object.hasOwn(dict, now)) problems.push(`${locale} "${short}": not translated`);
      else if (now === was) {
        problems.push(
          `${locale} "${short}": the English is unchanged, so the entry is to be removed`
        );
      }
    }
  }
  return problems;
}

function pendingOf(record, translations) {
  return entriesOf(record).flatMap(([locale, entries]) =>
    Object.entries(entries || {}).map(([now, was]) => ({
      locale,
      was,
      now,
      translation: (translations[locale] || {})[now]
    }))
  );
}

// The record and the translations on disk.
function readRecord() {
  return JSON.parse(fs.readFileSync(RECORD_FILE, 'utf8'));
}
function readTranslations() {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', `standard.${locale}.json`), 'utf8'))
    ])
  );
}

module.exports = { problemsOf, pendingOf, readRecord, readTranslations, RECORD_FILE, LOCALES };
