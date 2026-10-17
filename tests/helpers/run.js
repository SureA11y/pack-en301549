'use strict';

/**
 * The pack's tests scan with it: core's test helpers, with the pack added to
 * every scan's engineOptions.packs. A scan with packs runs through
 * runDomRulesInPage.
 */

const helpers = require('@surea11y/core/testing');
const pack = require('../..');

const withPack = (engineOptions) => ({ ...(engineOptions || {}), packs: [pack] });

function runa11yCoreOnHtml(html, opts = {}) {
  return helpers.runa11yCoreOnHtml(html, { ...opts, engineOptions: withPack(opts.engineOptions) });
}

// The EN 301 549 entries of a result, as "V4.1.1 9.1.1.1".
const clausesOf = (result) =>
  ((result && result.meta && result.meta.normativeMappings) || [])
    .filter((m) => m.standard === 'EN 301 549')
    .map((m) => `${m.version} ${m.requirement}`);

module.exports = { ...helpers, runa11yCoreOnHtml, withPack, clausesOf, pack };
