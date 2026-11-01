'use strict';

/**
 * The translations of the standard that are to be checked again, because
 * the English changed after they were made (standard-to-review.json): for
 * each, the English it was made from, the English now and the translation.
 *
 * Usage:
 *   npm run translations:review            list them
 *   npm run translations:review -- --json  the same, as JSON, for tools
 *
 * Exits 1 when the record itself is wrong (an unknown locale, an English
 * text with no translation, or an entry whose English is unchanged); the
 * entries alone are not an error.
 */

const { problemsOf, pendingOf, readRecord, readTranslations } = require('./lib/to-review');

const record = readRecord();
const translations = readTranslations();
const problems = problemsOf(record, translations);
const pending = pendingOf(record, translations);

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ pending, problems }, null, 2) + '\n');
} else {
  if (!pending.length) console.log('No translation of the standard is waiting to be checked.');
  for (const locale of [...new Set(pending.map((p) => p.locale))]) {
    const rows = pending.filter((p) => p.locale === locale);
    console.log(`\n${locale}: ${rows.length} to check`);
    for (const p of rows) {
      console.log(`\n  English was: ${p.was}`);
      console.log(`  English now: ${p.now}`);
      console.log(`  ${locale} now:      ${p.translation}`);
    }
  }
  for (const p of problems) console.error(`standard-to-review.json, ${p}`);
}
process.exitCode = problems.length ? 1 : 0;
