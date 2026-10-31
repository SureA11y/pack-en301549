/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * How a person assesses EN 301 549's own requirements by hand: the ones that
 * restate no WCAG criterion, and that no rule checks. They give the
 * standard's procedures (core's standard.procedures, docs/PROCEDURES.md in
 * core) beside chapter 9's, which take their criterion's, and nothing else:
 * no rule, rollup, profile entry or result.
 *
 * - Chapter 4, the functional performance statements (criteria, in V4.1.1):
 *   whole tasks done the way a person with that need does them. Single
 *   elements are the chapter 9 clauses' to check, and a procedure sends the
 *   person to them rather than repeating them.
 * - Chapter 12, about the product's documentation and support, not its
 *   pages. V3.2.1 numbers its clauses 12.1.1 to 12.2.4; V4.1.1 has 12.1 to
 *   12.5 instead.
 * - Chapters 5 to 8, 10, 11 and 13, one requirement each, by the chapter's
 *   number: for a web product, mostly whether the chapter applies.
 *
 * OWN_PROCEDURES: { 'V4.1.1': { '4.2.1': { title, facets: [{ id, label,
 *   automation, tools, steps, passWhen, failWhen }] } } }, in English.
 *
 * Titles are the standard's own, per version; the procedures are not its
 * text. A procedure is guidance, and its wording may improve in any release.
 *
 * SOURCE: ETSI EN 301 549 V3.2.1 (2021-03) and V4.1.1 (2026-09).
 */

// 4.2.1 Usage without vision, the same in both versions.
const USAGE_WITHOUT_VISION = [
  {
    id: 'related-clauses',
    label: 'The chapter 9 clauses that serve usage without vision are met',
    automation: 'manual',
    steps: [
      'Open Table B.2 in Annex B of the standard and list the chapter 9 clauses it marks as supporting 4.2.1.',
      'Assess each with its own procedure, or take its result from a review already done: among them are 9.1.1.1, 9.1.3.1, 9.1.3.2, 9.1.3.3, 9.2.1.1, 9.2.4.3, 9.2.4.4, 9.2.4.6, 9.3.3.1, 9.4.1.2 and 9.4.1.3.',
      'Note each clause that fails, and the task it gets in the way of.'
    ],
    passWhen: 'Every chapter 9 clause that Table B.2 relates to 4.2.1 is met, or does not apply.',
    failWhen:
      'A clause that serves usage without vision fails, such as an image with no text alternative or a control with no name, which fails EN 301 549 4.2.1 as well as that clause.'
  },
  {
    id: 'tasks-without-vision',
    label: 'Each main task can be completed with a screen reader alone, without looking',
    automation: 'manual',
    tools: ['screen-reader', 'keyboard'],
    steps: [
      'List the main tasks the product offers: finding information, signing in, filling in and sending a form, buying, changing a setting, getting help.',
      'Start a screen reader, turn the screen off or cover it, and use only the keyboard and what the screen reader says.',
      'Complete each task from its usual starting point to its end, as a user would.',
      'Note each point where you could not tell where you were, what something was, what had changed, or what to do next.',
      'Repeat on a phone with its own screen reader where the product is meant to be used on one.'
    ],
    passWhen:
      'Every main task can be completed from start to end with a screen reader, without looking at the screen.',
    failWhen:
      'A task can not be completed, or only by guessing, without looking at the screen, which fails EN 301 549 4.2.1.'
  },
  {
    id: 'no-step-needs-vision',
    label: 'No step of a task needs sight, even where the page is otherwise accessible',
    automation: 'manual',
    tools: ['screen-reader'],
    steps: [
      'Look for the steps that rely on seeing: a picture to recognise, a code to read from an image, a position to point at, a colour or a layout to tell apart.',
      'Look at steps handled by others: a sign-in or identity check, a payment page, a chat window, a map, an embedded player.',
      'For each, check that a person who cannot see is offered a way through that works with a screen reader, such as an audio or text alternative, without asking for help.'
    ],
    passWhen:
      'Every step that relies on sight has a way through that does not, available to the user in the product itself.',
    failWhen:
      'A step can only be passed by seeing, such as a visual-only check or a third-party page with no alternative, so a person without vision is stopped, which fails EN 301 549 4.2.1.'
  }
];

// The product's documentation in an accessible format: 12.1.2 in V3.2.1,
// part of 12.1 (any information about the product) in V4.1.1.
const docsSteps = (what) => [
  `List ${what}: help pages, user guides and manuals, quick-start sheets, release notes, FAQs and the accessibility statement, whether on the web, in the product or as downloads.`,
  'Note the formats each comes in: web pages, PDF, word-processing files, videos, printed material.',
  'For each, pick the electronic format to assess: one is enough where several are offered, if a user can get it.',
  'Assess documentation on the web as web pages, against chapter 9: scan it with the en301549 profile of the version, and follow the procedures of the clauses a scan leaves undecided.',
  'Assess documentation in a document format against chapter 10: a PDF tagged with headings and reading order, images with text alternatives, tables with headers, and text that is text, not a picture of it.',
  'Check that the accessible format holds everything the other formats do.'
];

const ACCESSIBLE_DOCUMENTATION = [
  {
    id: 'documentation-format',
    label:
      'The product documentation is available in at least one electronic format that meets chapter 9 or chapter 10',
    automation: 'manual',
    steps: docsSteps('the documentation that comes with the product'),
    passWhen:
      'Each piece of product documentation is available, complete, in a web format that meets chapter 9 or a document format that meets chapter 10.',
    failWhen:
      'A piece of documentation is only in print, or only in formats that fail chapter 9 or 10, such as an untagged PDF or a scanned manual, which fails EN 301 549 12.1.2.'
  }
];

const PRODUCT_INFORMATION = [
  {
    id: 'information-format',
    label:
      'Information about the product, in digital form, meets chapter 9, 10 or 11, as its format requires',
    automation: 'manual',
    steps: [
      ...docsSteps(
        'the information the product comes with or is described by, besides its own pages'
      ).slice(0, 5),
      'Assess information shown inside non-web software, such as a help panel in an app, against chapter 11.'
    ],
    passWhen:
      'All the information about the product that is in digital form meets chapter 9 on the web, chapter 10 as a document, or chapter 11 inside software.',
    failWhen:
      'Information about the product fails the chapter its format falls under, such as a manual in an untagged PDF or a help page that fails a chapter 9 clause, which fails EN 301 549 12.1.'
  }
];

// Chapter 11. In V3.2.1, 11.1 to 11.5 leave web content to chapter 9, but
// 11.6.2, 11.7 (the platform of web content is the user agent) and 11.8
// (authoring tools, standalone or web based) can apply to it. V4.1.1 is about
// non-web software alone: it moved authoring tools to 5.10, and puts web
// views inside an app under chapter 11.
const SOFTWARE_V3 = [
  {
    id: 'non-web-software',
    label: 'Software the product includes that is not web content meets clauses 11.1 to 11.6',
    automation: 'manual',
    steps: [
      'List how the product reaches its users: in a browser, as a desktop or mobile app, as a browser extension, plug-in, installer or downloadable tool.',
      'Leave out web pages and what runs in them: chapter 9 assesses those.',
      'If nothing is left, record clauses 11.1 to 11.5 as not applicable.',
      'For each piece of software left, assess clauses 11.1 to 11.5 with the WCAG criteria each restates, applied to software as the standard words them, using the platform’s own screen reader and keyboard.',
      'For a platform, check that its documented accessibility features can be controlled by the user (11.6.1).'
    ],
    passWhen:
      'The product includes no software besides web content, or each piece it includes meets clauses 11.1 to 11.6.',
    failWhen:
      'Software the product includes, such as its mobile app, fails a clause of 11.1 to 11.6, which fails the clause of EN 301 549 chapter 11 it falls under.'
  },
  {
    id: 'platform-settings',
    label:
      'The product follows the user’s settings in the browser and system, and does not disrupt their accessibility features',
    automation: 'manual',
    tools: ['zoom', 'contrast-theme', 'screen-reader'],
    steps: [
      'Set a larger default font size in the browser, turn on a high-contrast theme in the system, and set the system to reduce motion.',
      'Open the product and check that its text, colours and focus indicator follow those settings, unless it offers its own setting that the user has chosen.',
      'Use the product with the system’s magnifier and screen reader running, and check that it does not turn them off, block them or take over their keys.'
    ],
    passWhen:
      'The product follows the browser’s and system’s font size, colours, contrast and focus settings, and leaves the platform’s accessibility features working.',
    failWhen:
      'The product ignores a user setting with no setting of its own to make up for it, or stops an accessibility feature from working, which fails EN 301 549 11.7 or 11.6.2.'
  },
  {
    id: 'authoring-tool',
    label: 'Where the product is an authoring tool, it supports and guides accessible content',
    automation: 'manual',
    tools: ['keyboard'],
    steps: [
      'Check whether the product lets its users make content that others will read: pages, posts, documents, forms, emails, a site.',
      'If it does not, record clause 11.8 as not applicable.',
      'If it does, create content with it that has a heading, an image, a table, a link and a form field, and check that the tool lets you give each what chapter 9 or 10 needs: heading levels, a text alternative, table headers, link text and labels.',
      'Check that the tool says when something is missing or wrong, and helps fix it (11.8.4).',
      'Check that templates it offers produce content that meets chapter 9 or 10 (11.8.5), and that converting content to another format keeps the accessibility information the new format can hold (11.8.3).'
    ],
    passWhen:
      'The product is not an authoring tool, or it lets and helps its users make content that meets chapter 9 or 10, and keeps accessibility information when it converts.',
    failWhen:
      'An authoring tool can not produce accessible content, such as an editor with no way to add a text alternative, or loses accessibility information when it converts, which fails EN 301 549 11.8.'
  }
];

const SOFTWARE_V4 = [
  {
    id: 'non-web-software',
    label: 'Non-web software the product includes meets clauses 11.1 to 11.7',
    automation: 'manual',
    steps: [
      'List how the product reaches its users: in a browser, as a desktop or mobile app, as a browser extension, plug-in, installer or downloadable tool.',
      'Leave out web pages, and what runs in them in a browser: chapter 9 assesses those.',
      'Keep a web view shown inside an app: it is part of non-web software, and chapter 11 assesses it instead of chapter 9.',
      'If nothing is left, record chapter 11 as not applicable.',
      'For each piece of non-web software left, assess clauses 11.1 to 11.5 with the WCAG criteria each restates, applied to software as the standard words them, using the platform’s own screen reader and keyboard.',
      'Check that it does not turn off or block the platform’s documented accessibility features (11.6.2), and that it follows the user’s platform settings for them, such as text size and contrast (11.7).',
      'Where the product makes content, check it under clause 5.10 (authoring tools), where V4.1.1 places them.'
    ],
    passWhen:
      'The product includes no non-web software, or each piece it includes meets clauses 11.1 to 11.7.',
    failWhen:
      'Non-web software the product includes, such as its mobile app or a web view inside it, fails a clause of 11.1 to 11.7, which fails the clause of EN 301 549 chapter 11 it falls under.'
  }
];

const OWN_PROCEDURES = {
  'V3.2.1': {
    '4.2.1': { title: 'Usage without vision', facets: USAGE_WITHOUT_VISION },
    11: { title: 'Software', facets: SOFTWARE_V3 },
    '12.1.2': { title: 'Accessible documentation', facets: ACCESSIBLE_DOCUMENTATION }
  },
  'V4.1.1': {
    '4.2.1': { title: 'Usage without vision', facets: USAGE_WITHOUT_VISION },
    11: { title: 'Non-web software', facets: SOFTWARE_V4 },
    12.1: { title: 'Accessible information about products', facets: PRODUCT_INFORMATION }
  }
};

module.exports = { OWN_PROCEDURES };
