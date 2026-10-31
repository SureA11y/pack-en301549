/* SPDX-License-Identifier: MPL-2.0 */

'use strict';

/**
 * How a person assesses EN 301 549's own requirements by hand: the ones that
 * restate no WCAG criterion, and that no rule checks. They give the
 * standard's procedures (core's standard.procedures, docs/PROCEDURES.md in
 * core) beside chapter 9's, which take their criterion's, and nothing else:
 * no rule, rollup, profile entry or result.
 *
 * - Chapter 4, the functional performance statements (criteria, in V4.1.1),
 *   4.2.1 to 4.2.11: whole tasks done the way a person with that need does
 *   them. Single elements are the chapter 9 clauses' to check, and a
 *   procedure sends the person to the ones Annex B (Table B.2) relates to the
 *   statement rather than repeating them.
 * - Chapter 12, about the product's documentation and support, not its
 *   pages: 12.1.1, 12.1.2, 12.2.2, 12.2.3 and 12.2.4 in V3.2.1 (12.2.1 is
 *   informative), 12.1 to 12.5 in V4.1.1, which renumbered the chapter.
 * - Chapters 5, 6, 7, 8, 10, 11 and 13, one requirement each, by the
 *   chapter's number ('5'): for a web product, mostly whether the chapter
 *   applies, and a facet for each part of it that can. The annex that
 *   relates the standard to the Web Accessibility Directive (V3.2.1 Annex A,
 *   V4.1.1 Annex ZA, Table ZA.1 / A.1 "Web content") lists which of their
 *   clauses bear on web content.
 *
 * OWN_PROCEDURES: { 'V4.1.1': { '4.2.1': { title, relatesTo, facets: [{ id,
 *   label, automation, tools, steps, passWhen, failWhen }] } } }, in English: core
 * reads a requirement's own facets in English only, whatever the locale.
 *
 * A chapter 4 statement also names, in relatesTo, the WCAG criteria of the
 * chapter 9 clauses its procedure sends the person to.
 *
 * Titles are the standard's own, per version; the procedures are not its
 * text. A procedure is guidance, and its wording may improve in any release.
 *
 * SOURCE: ETSI EN 301 549 V3.2.1 (2021-03) and V4.1.1 (2026-09).
 */

const V3 = 'V3.2.1';
const V4 = 'V4.1.1';

// What V4.1.1 calls subtitles, V3.2.1 calls captions.
const subtitles = (v) => (v === V3 ? 'captions' : 'subtitles');
// The privacy column of Table B.2.
const privacyColumn = (v) => (v === V3 ? 'P' : 'PR');
// Where the requirements for authoring tools are.
const authoring = (v) => (v === V3 ? '11.8' : '5.10');

// The chapter 9 clauses each related-clauses facet names, so the statement
// relates to the criteria they restate from the same list (relating).
const NAMED = new WeakMap();

// Chapter 4: the chapter 9 clauses Table B.2 marks as the primary support of
// a statement, in its column, with a few of them named.
function relatedClauses(id, column, need, clauses, example) {
  const facet = {
    id: 'related-clauses',
    label: `The chapter 9 clauses that serve ${need} are met`,
    automation: 'manual',
    steps: [
      `Open Table B.2 in Annex B of the standard and list the chapter 9 clauses it marks P (primary) in column ${column}, for ${id}.`,
      `Assess each with its own procedure, or take its result from a review already done: among them are ${clauses.join(', ')}.`,
      'Note each clause that fails, and the task it gets in the way of.'
    ],
    passWhen: `Every chapter 9 clause that Table B.2 relates to ${id} is met, or does not apply.`,
    failWhen: `A clause that serves ${need} fails, such as ${example}, which fails EN 301 549 ${id} as well as that clause.`
  };
  NAMED.set(facet, clauses);
  return facet;
}

// A chapter 4 statement relates to the WCAG criteria of the chapter 9
// clauses its procedure names (relatesTo: core's relatedRequirements reads
// it both ways): '9.1.4.3' restates 1.4.3. Those are the clauses Table B.2
// relates to it that the procedure names, not every one it marks.
const criterionOf = (clause) => clause.split('.').slice(1).join('.');
const byNumber = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
};
const relating = (statements) =>
  Object.fromEntries(
    Object.entries(statements).map(([id, entry]) => {
      const named = entry.facets.flatMap((f) => NAMED.get(f) || []);
      if (!named.length) return [id, entry];
      const relatesTo = [...new Set(named.map(criterionOf))].sort(byNumber);
      return [id, { title: entry.title, relatesTo, facets: entry.facets }];
    })
  );

// 'and, in V4.1.1, a and b' where a version adds clauses.
const andInV4 = (v, base, added) => (v === V4 ? base.concat(added) : base);

const statements = (v) => ({
  '4.2.1': {
    title: 'Usage without vision',
    facets: [
      relatedClauses(
        '4.2.1',
        'WV',
        'usage without vision',
        [
          '9.1.1.1',
          '9.1.3.1',
          '9.1.3.2',
          '9.1.3.3',
          '9.2.1.1',
          '9.2.4.3',
          '9.2.4.4',
          '9.2.4.6',
          '9.3.3.1',
          '9.4.1.2',
          '9.4.1.3'
        ],
        'an image with no text alternative or a control with no name'
      ),
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
    ]
  },
  '4.2.2': {
    title: 'Usage with limited vision',
    facets: [
      relatedClauses(
        '4.2.2',
        'LV',
        'usage with limited vision',
        andInV4(
          v,
          ['9.1.4.3', '9.1.4.4', '9.1.4.10', '9.1.4.11', '9.1.4.12', '9.2.4.7'],
          ['9.2.4.11']
        ),
        'text that is lost at 200% zoom or a focus indicator that can not be seen'
      ),
      {
        id: 'tasks-magnified',
        label:
          'Each main task can be completed with the page enlarged, magnified or in high contrast',
        automation: 'manual',
        tools: ['zoom', 'contrast-theme', 'keyboard'],
        steps: [
          'List the main tasks the product offers.',
          'Complete each with the browser zoomed to 200%, then with the window 320 CSS pixels wide (400% on a 1280 pixel screen).',
          'Complete them again with the system’s screen magnifier at a high magnification, following the focus as you move.',
          'Complete them again with a high-contrast theme on in the system.',
          'Note each point where content was cut off, overlapped, disappeared, needed scrolling in two directions to read, or could not be found within the magnified area, such as a message shown far from where you were.'
        ],
        passWhen:
          'Every main task can be completed enlarged, magnified and in high contrast, with nothing lost and every change shown where the user is looking.',
        failWhen:
          'A task can not be completed, or loses content, when the page is enlarged, magnified or in high contrast, which fails EN 301 549 4.2.2.'
      }
    ]
  },
  '4.2.3': {
    title: 'Usage without perception of colour',
    facets: [
      relatedClauses(
        '4.2.3',
        'WPC',
        'usage without perception of colour',
        ['9.1.3.3', '9.1.4.1'],
        'a required field or an error shown only in red'
      ),
      {
        id: 'tasks-without-colour',
        label: 'Each main task can be completed with the screen in greyscale',
        automation: 'manual',
        tools: ['devtools'],
        steps: [
          'Turn the screen to greyscale, with the system’s colour filters or the developer tools’ emulation of vision deficiencies (achromatopsia).',
          'Complete each main task the product offers.',
          'Look in particular at status, errors, required fields, selected items, links in text, charts and maps.',
          'Repeat with the emulation of red-green (deuteranopia, protanopia) and blue-yellow (tritanopia) deficiencies, where colour still carries meaning.'
        ],
        passWhen:
          'Every main task can be completed, and every piece of information understood, without telling colours apart.',
        failWhen:
          'Something a task needs is told only by colour, such as which option is chosen or which line of a chart is which, which fails EN 301 549 4.2.3.'
      }
    ]
  },
  '4.2.4': {
    title: 'Usage without hearing',
    facets: [
      relatedClauses(
        '4.2.4',
        'WH',
        'usage without hearing',
        ['9.1.2.1', '9.1.2.2', '9.1.2.4'],
        `a video with no ${subtitles(v)}`
      ),
      {
        id: 'tasks-without-sound',
        label: 'Each main task can be completed with the sound off',
        automation: 'manual',
        steps: [
          'Mute the device.',
          'Complete each main task the product offers.',
          'Note every piece of information given by sound: alerts and notification sounds, spoken instructions, videos, audio messages, a code read out by phone or an audio check.',
          `For each, check that the same is given visually or as text, such as ${subtitles(v)}, a transcript, a visible notification or a text message.`,
          'Where a task needs a phone call, check that it can be done another way, such as by text, chat or email.'
        ],
        passWhen:
          'Every main task can be completed with the sound off, and nothing it needs is given by sound alone.',
        failWhen:
          'Something a task needs is given only by sound, such as a spoken code or a video with no text of what is said, which fails EN 301 549 4.2.4.'
      }
    ]
  },
  '4.2.5': {
    title: 'Usage with limited hearing',
    facets: [
      relatedClauses(
        '4.2.5',
        'LH',
        'usage with limited hearing',
        ['9.1.2.2', '9.1.2.4', '9.1.4.2'],
        'audio that plays over the content with no way to stop it'
      ),
      {
        id: 'audio-can-be-heard',
        label: 'Where the product plays sound, a person with limited hearing can make it out',
        automation: 'manual',
        steps: [
          'List where the product plays sound: videos, audio, calls, spoken messages, alerts.',
          'If it plays none, record that 4.2.5 does not apply.',
          'For each, check that its volume can be raised with the product’s controls or the system’s, well above the default.',
          'Check that speech can be heard over background music or noise, or that the background can be turned down or off.',
          'Check that the sound can be sent to headphones or a hearing device, as the system offers, and is not locked to one output.'
        ],
        passWhen:
          'The product plays no sound, or its sound can be made louder, clearer and sent to the user’s own listening device.',
        failWhen:
          'Sound a task needs can not be made loud or clear enough, such as speech under music that can not be turned down, which fails EN 301 549 4.2.5.'
      }
    ]
  },
  '4.2.6': {
    title: 'Usage with no or limited vocal capability',
    facets: [
      {
        id: 'tasks-without-voice',
        label: 'Each task that takes voice can also be done without speaking',
        automation: 'manual',
        tools: ['keyboard'],
        steps: [
          'List every place the product asks for the user’s voice: voice search, a voice assistant, voice commands, a spoken password or voice check, a call to an automated phone line, a recording to send.',
          'If there is none, record that 4.2.6 does not apply.',
          'For each, check that the same can be done without speaking, with the keyboard, a pointer or by text, in the product itself.',
          'Check that the way without speaking is as easy to find and as complete as the spoken one.'
        ],
        passWhen:
          'The product asks for no voice, or everything done by voice can be done as well without speaking.',
        failWhen:
          'A task can only be done by speaking, such as a sign-in by voice check or a support line with no text option, which fails EN 301 549 4.2.6.'
      }
    ]
  },
  '4.2.7': {
    title: 'Usage with limited manipulation or strength',
    facets: [
      relatedClauses(
        '4.2.7',
        'LMS',
        'usage with limited manipulation or strength',
        andInV4(v, ['9.2.1.1', '9.2.5.1', '9.2.5.2', '9.2.5.4'], ['9.2.5.7', '9.2.5.8']),
        'a control that can only be dragged or a function only reached by a gesture'
      ),
      {
        id: 'tasks-with-limited-movement',
        label:
          'Each main task can be completed with the keyboard alone, and with one pointer and simple actions',
        automation: 'manual',
        tools: ['keyboard', 'pointer'],
        steps: [
          'Complete each main task with the keyboard alone, pressing one key at a time.',
          'Complete each again with a single pointer, clicking or tapping only: no dragging, no gesture with a path, no two fingers, no holding a key while clicking.',
          'Note each step that needs precise or fast movement: a small target, a control that moves, an action timed to happen within a moment.',
          'Where speech recognition is available, check that controls can be activated by saying the name they show.'
        ],
        passWhen:
          'Every main task can be completed with the keyboard alone and with simple single-pointer actions, with no step needing precision, speed or strength.',
        failWhen:
          'A task needs a gesture, two actions at once, fine precision or speed, with no simpler way to do it, which fails EN 301 549 4.2.7.'
      }
    ]
  },
  '4.2.8': {
    title: 'Usage with limited reach',
    facets: [
      {
        id: 'elements-within-reach',
        label:
          'Where the product is stationary, free-standing or installed, everything it needs is within reach',
        automation: 'manual',
        steps: [
          'Check whether the product includes something stationary, free-standing or installed, such as a kiosk, a terminal or a ticket machine. A website or an app on the user’s own device is not.',
          'If it does not, record that 4.2.8 does not apply.',
          'If it does, check that every control, screen, slot and reader it needs can be reached from a wheelchair and by short and tall users, as chapter 8 (8.3) measures it.',
          'Check that a task can be completed from a seated position, or from the user’s own device where the product offers that.'
        ],
        passWhen:
          'The product includes nothing stationary, or everything a task needs at it is within reach of every user.',
        failWhen:
          'A stationary part of the product has a control, screen or reader out of reach, such as a card reader too high for a wheelchair user, which fails EN 301 549 4.2.8.'
      }
    ]
  },
  '4.2.9': {
    title: 'Minimize photosensitive seizure triggers',
    facets: [
      relatedClauses(
        '4.2.9',
        'PST',
        'users with photosensitive seizure triggers',
        ['9.2.3.1'],
        'content that flashes more than three times in a second'
      ),
      {
        id: 'no-flashing-by-default',
        label:
          v === V3
            ? 'The product offers a mode with no flashing that could trigger a seizure'
            : 'The product’s default mode has no flashing that could trigger a seizure, or audiovisual material warns first',
        automation: 'manual',
        steps: [
          'Go through the product looking for anything that flashes, flickers or changes brightness quickly: animations, videos, games, backgrounds, transitions, banners.',
          'For each, check whether it flashes more than three times in any second over a large part of the screen, or flashes saturated red.',
          v === V3
            ? 'Where it does, check that the product offers a mode the user can choose in which it does not, and that the mode can be turned on without seeing the flashing first.'
            : 'Where it does, check that the mode the product starts in does not flash, or, for a video or other audiovisual material, that a warning comes before it plays.'
        ],
        passWhen:
          v === V3
            ? 'Nothing in the product flashes in a way that could trigger a seizure, or a mode without it is offered first.'
            : 'Nothing flashes in the default mode, or audiovisual material that does is announced by a warning before it plays.',
        failWhen:
          'Content flashes in a way that could trigger a seizure, with no safe mode the user starts in or can choose first, which fails EN 301 549 4.2.9.'
      }
    ]
  },
  '4.2.10': {
    title: 'Usage with limited cognition, language or learning',
    facets: [
      relatedClauses(
        '4.2.10',
        'LC',
        'usage with limited cognition, language or learning',
        andInV4(
          v,
          ['9.2.2.1', '9.2.4.6', '9.3.2.3', '9.3.2.4', '9.3.3.1', '9.3.3.2', '9.3.3.3'],
          ['9.3.3.7', '9.3.3.8']
        ),
        'an error that says nothing about how to fix it'
      ),
      {
        id: 'tasks-easy-to-follow',
        label: 'Each main task is simple to understand, follow and recover from',
        automation: 'manual',
        steps: [
          'Complete each main task as a first-time user, without the help pages.',
          'Note where the words are hard to follow: jargon, long sentences, abbreviations not explained, instructions that come after the field they are about.',
          'Note where the task is hard to follow: no sign of how many steps there are or where you are, a step that changes the page without warning, choices that are not clear.',
          'Make a mistake on purpose at each step and check that the product says what went wrong and how to fix it, and keeps what was entered.',
          'Check that no step makes you remember something from an earlier one, solve a puzzle or work against a time limit you can not extend.',
          'Check that help is easy to find from every step.'
        ],
        passWhen:
          'Every main task is in plain words, shows its steps, explains its errors and can be completed without memory, puzzles or time pressure.',
        failWhen:
          'A task is hard to understand or to recover from, such as a process with unexplained steps that loses what was typed after an error, which fails EN 301 549 4.2.10.'
      }
    ]
  },
  '4.2.11': {
    title: 'Privacy',
    facets: [
      {
        id: 'privacy-with-features',
        label:
          'Using the accessibility features keeps the user’s privacy as well as not using them',
        automation: 'manual',
        tools: ['screen-reader'],
        steps: [
          `Look at Table B.2 in Annex B, column ${privacyColumn(v)}, for the clauses the standard relates to privacy.`,
          'Type a password, a PIN and other masked entries with a screen reader running, and check that it does not read the characters aloud, unless the user chooses so.',
          'Check that using an accessible alternative, such as an audio check, a text-only mode or a relay service, does not ask for more personal data, or share it more widely, than the standard way.',
          'Check that the user is not asked to state a disability to get an accessibility feature, unless the feature can not work otherwise.',
          'Where the product speaks or plays sound, check that the user can listen privately, through headphones.'
        ],
        passWhen:
          'A person who uses the accessibility features is offered the same privacy as anyone else.',
        failWhen:
          'Using an accessibility feature exposes personal information, such as a screen reader speaking a password aloud or an alternative that needs more personal data, which fails EN 301 549 4.2.11.'
      }
    ]
  }
});

const chapter4 = (v) => relating(statements(v));

// Chapter 12 and the documentation of the product.
const docsSteps = (what) => [
  `List ${what}: help pages, user guides and manuals, quick-start sheets, release notes, FAQs and the accessibility statement, whether on the web, in the product or as downloads.`,
  'Note the formats each comes in: web pages, PDF, word-processing files, videos, printed material.',
  'For each, pick the electronic format to assess: one is enough where several are offered, if a user can get it.',
  'Assess documentation on the web as web pages, against chapter 9: scan it with the en301549 profile of the version, and follow the procedures of the clauses a scan leaves undecided.',
  'Assess documentation in a document format against chapter 10: a PDF tagged with headings and reading order, images with text alternatives, tables with headers, and text that is text, not a picture of it.',
  'Check that the accessible format holds everything the other formats do.'
];

const featuresSteps = (where) => [
  `Find ${where}.`,
  'List the product’s accessibility features: its own, such as a text size setting, a high-contrast mode, keyboard shortcuts, captions or audio description, and the assistive technology it is made to work with, such as screen readers, magnifiers and voice control.',
  'Check that the documentation lists them, and says how to turn on and use each one.',
  'Follow the instructions for a few of them and check that they work as described.'
];

const chapter12 = (v) =>
  v === V3
    ? {
        '12.1.1': {
          title: 'Accessibility and compatibility features',
          facets: [
            {
              id: 'features-documented',
              label:
                'The product documentation lists the accessibility and compatibility features and explains how to use them',
              automation: 'manual',
              steps: featuresSteps(
                'the documentation that comes with the product, separate or built in: help pages, user guide, accessibility statement'
              ),
              passWhen:
                'The documentation lists every accessibility and compatibility feature of the product and says how to use each.',
              failWhen:
                'An accessibility or compatibility feature is not in the documentation, or is named with no word on how to use it, which fails EN 301 549 12.1.1.'
            }
          ]
        },
        '12.1.2': {
          title: 'Accessible documentation',
          facets: [
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
          ]
        },
        '12.2.2': {
          title: 'Information on accessibility and compatibility features',
          facets: [
            {
              id: 'support-knows-features',
              label:
                'The support services can give information on the accessibility and compatibility features the documentation names',
              automation: 'manual',
              steps: [
                'List the support services the product offers: help desk, chat, email, phone line, training, community forum run by the supplier.',
                'If it offers none, record that 12.2.2 does not apply.',
                'Ask each, as a user would, about two or three of the accessibility and compatibility features the documentation names: how to turn one on, whether the product works with a given screen reader.',
                'Check that the answers are correct and match the documentation.'
              ],
              passWhen:
                'Every support service answers questions about the accessibility and compatibility features in the documentation, correctly.',
              failWhen:
                'A support service can not answer, or answers wrongly, about an accessibility feature the documentation names, which fails EN 301 549 12.2.2.'
            }
          ]
        },
        '12.2.3': {
          title: 'Effective communication',
          facets: [
            {
              id: 'support-communicates',
              label:
                'The support services meet the communication needs of people with disabilities, directly or by referral',
              automation: 'manual',
              tools: ['screen-reader', 'keyboard'],
              steps: [
                'List the support services the product offers and the ways each can be reached.',
                'If it offers none, record that 12.2.3 does not apply.',
                'Check that a person who can not hear or speak can reach each service without voice, such as by email, text chat, a text relay service or sign language video, directly or through a referral point the service names.',
                'Check that a person who can not see can reach each, such as through a chat or contact form that works with a screen reader.',
                'Contact a service in one of these ways, and check that it answers in the same way, within the time it gives other users.'
              ],
              passWhen:
                'Each support service can be reached, and answers, in ways that meet the communication needs of people with disabilities, or refers them to one that does.',
              failWhen:
                'A support service can only be reached in one way that excludes some users, such as by phone only, with no referral, which fails EN 301 549 12.2.3.'
            }
          ]
        },
        '12.2.4': {
          title: 'Accessible documentation',
          facets: [
            {
              id: 'support-documentation-format',
              label:
                'Documentation the support services provide is available in at least one electronic format that meets chapter 9 or chapter 10',
              automation: 'manual',
              steps: docsSteps(
                'the documentation the support services provide: answers, guides, articles, training material'
              ),
              passWhen:
                'Each piece of support documentation is available, complete, in a web format that meets chapter 9 or a document format that meets chapter 10.',
              failWhen:
                'A piece of support documentation is only in print, or only in formats that fail chapter 9 or 10, which fails EN 301 549 12.2.4.'
            }
          ]
        }
      }
    : {
        12.1: {
          title: 'Accessible information about products',
          facets: [
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
          ]
        },
        12.2: {
          title: 'Accessible information about services',
          facets: [
            {
              id: 'service-information-format',
              label:
                'Information about the service, support services included, in digital form, meets chapter 9, 10 or 11, as its format requires',
              automation: 'manual',
              steps: [
                'List the information about the service the product provides or is part of: what it offers, its terms and prices, how to use it, and what its support services give, such as answers, guides and messages.',
                'If there is no service, record that 12.2 does not apply.',
                'Note the formats each comes in: web pages, PDF, word-processing files, messages, inside an app.',
                'Assess it against the chapter its format falls under: chapter 9 on the web, chapter 10 as a document, chapter 11 inside non-web software.'
              ],
              passWhen:
                'All the information about the service that is in digital form meets the chapter its format falls under.',
              failWhen:
                'Information about the service fails the chapter its format falls under, such as terms in an untagged PDF or a support answer sent as a picture of text, which fails EN 301 549 12.2.'
            }
          ]
        },
        12.3: {
          title: 'Accessibility and compatibility features',
          facets: [
            {
              id: 'features-documented',
              label:
                'The documentation says, directly or by a link, what the accessibility features are, how to use them and how to get support for them',
              automation: 'manual',
              steps: [
                ...featuresSteps(
                  'the documentation about using the product, in the product or on the supplier’s own web pages'
                ),
                'Check that it says how to get support for the accessibility features, or links to a page that does.'
              ],
              passWhen:
                'The documentation, or a page it links to, names the accessibility features, says how to use each, and says how to get support for them.',
              failWhen:
                'The documentation leaves out an accessibility feature, how to use it, or how to get support for it, with no link to where it is said, which fails EN 301 549 12.3.'
            }
          ]
        },
        12.4: {
          title: 'Electronic program guides',
          facets: [
            {
              id: 'epg-information',
              label:
                'Where the product is an electronic programme guide, it says which programmes have subtitles, audio description, spoken subtitles and sign language',
              automation: 'manual',
              steps: [
                'Check whether the product is, or includes, an electronic programme guide: a schedule or catalogue of television or streamed programmes.',
                'If it is not, record that 12.4 does not apply.',
                'For a few programmes, check that the guide gives the availability of subtitles, audio description, spoken subtitles and sign language interpretation.'
              ],
              passWhen:
                'The product is no programme guide, or its guide tells for each programme which of these it has.',
              failWhen:
                'The programme guide gives no information on subtitles, audio description, spoken subtitles or sign language, which fails EN 301 549 12.4.'
            }
          ]
        },
        12.5: {
          title: 'Electronic program guide display',
          facets: [
            {
              id: 'epg-display',
              label:
                'Where the product shows a programme guide, the accessibility of each programme can be told without starting it',
              automation: 'manual',
              tools: ['screen-reader'],
              steps: [
                'Check whether the product shows an electronic programme guide, and whether the guide holds information on subtitles, audio description, spoken subtitles or sign language.',
                'If it does not, record that 12.5 does not apply.',
                'Browse the guide and check that, for each programme, you can tell which of these it has without playing it: as text, icons with a text alternative, or a filter.',
                'Check the same with a screen reader, while moving through the guide.'
              ],
              passWhen:
                'The product shows no programme guide with this information, or a user can tell from the guide which programmes have each feature without playing them.',
              failWhen:
                'The accessibility features of a programme can only be found by playing it, or are shown in a way a screen reader does not read, which fails EN 301 549 12.5.'
            }
          ]
        }
      };

// Chapters 5 to 8, 10, 11 and 13.
const AUTHORING_TOOL = (v) => ({
  id: 'authoring-tool',
  label: 'Where the product is an authoring tool, it supports and guides accessible content',
  automation: 'manual',
  tools: ['keyboard'],
  steps: [
    'Check whether the product lets its users make content that others will read: pages, posts, documents, forms, emails, a site.',
    `If it does not, record clause ${authoring(v)} as not applicable.`,
    'If it does, create content with it that has a heading, an image, a table, a link and a form field, and check that the tool lets you give each what chapter 9 or 10 needs: heading levels, a text alternative, table headers, link text and labels.',
    `Check that the tool says when something is missing or wrong, and helps fix it (${authoring(v)}.4).`,
    `Check that templates it offers produce content that meets chapter 9 or 10 (${authoring(v)}.5), and that converting content to another format keeps the accessibility information the new format can hold (${authoring(v)}.3).`
  ],
  passWhen:
    'The product is not an authoring tool, or it lets and helps its users make content that meets chapter 9 or 10, and keeps accessibility information when it converts.',
  failWhen: `An authoring tool can not produce accessible content, such as an editor with no way to add a text alternative, or loses accessibility information when it converts, which fails EN 301 549 ${authoring(v)}.`
});

const chapter5 = (v) => ({
  title: 'Generic requirements',
  facets: [
    {
      id: 'closed-functionality',
      label:
        'Where part of the product is closed to assistive technology, it is accessible without it',
      automation: 'manual',
      tools: ['screen-reader'],
      steps: [
        'Check whether any part of the product keeps the user from using their own assistive technology: a kiosk, a locked-down device, a player or app that blocks screen readers or magnifiers.',
        'A website used in the user’s own browser is not closed: if nothing else is, record clause 5.1 as not applicable.',
        'For each closed part, check that it offers speech output for what it shows, enlarged text, a visual form of what it says aloud, a way to use it without a keyboard or speech where it needs them, as clauses 5.1.3 to 5.1.7 require.',
        ...(v === V4
          ? [
              'Check that its forms say the purpose of fields that ask for the user’s own details (5.1.8).'
            ]
          : [])
      ],
      passWhen:
        'Nothing in the product is closed to assistive technology, or what is closed is usable without it.',
      failWhen:
        'A closed part of the product can not be used without sight, hearing, speech or fine movement, with no built-in alternative, which fails the clause of EN 301 549 5.1 it falls under.'
    },
    {
      id: 'activation-of-features',
      label: 'Each accessibility feature can be turned on without the ability it makes up for',
      automation: 'manual',
      tools: ['keyboard', 'screen-reader'],
      steps: [
        'List the accessibility features the product documents: a text size or contrast setting, captions, audio description, a reading mode, an accessibility menu.',
        'If there are none, record clause 5.2 as not applicable.',
        'For each, turn it on the way a person who needs it would: a screen reader setting with a screen reader, a contrast setting with low vision, captions without hearing, with the keyboard alone.'
      ],
      passWhen:
        'Every documented accessibility feature can be turned on by the people who need it.',
      failWhen:
        'An accessibility feature can only be turned on in a way its users can not manage, such as a screen reader mode reached only by an unlabelled icon, which fails EN 301 549 5.2.'
    },
    {
      id: 'biometrics',
      label:
        'No biological characteristic is the only way to identify the user or control the product',
      automation: 'manual',
      steps: [
        'Look for every use of the body to identify the user or control the product: fingerprint, face, voice, eyes, a gesture.',
        'If there is none, record clause 5.3 as not applicable.',
        'For each, check that there is another way that uses no biological characteristic, or a different one, such as a password, a code or a key.'
      ],
      passWhen:
        'The product uses no biological characteristic, or offers another way wherever it does.',
      failWhen:
        'A biological characteristic is the only way to sign in or to use a function, such as face recognition with no other option, which fails EN 301 549 5.3.'
    },
    {
      id: 'conversion',
      label: 'Where the product converts content, it keeps the information given for accessibility',
      automation: 'manual',
      steps: [
        'Look for every place the product converts content from one format to another: export to PDF or a word-processing file, video transcoding, file import, translation into another format.',
        'If there is none, record clause 5.4 as not applicable.',
        `For each, convert content that has headings, text alternatives, table headers, ${subtitles(v)} or audio description, and check that the result keeps them, where the new format can hold them.`
      ],
      passWhen:
        'The product converts nothing, or keeps the accessibility information through every conversion the new format allows.',
      failWhen:
        'A conversion drops accessibility information the new format could hold, such as an export to PDF that loses the headings and text alternatives, which fails EN 301 549 5.4.'
    },
    {
      id: 'keys-and-controls',
      label:
        'Keys, toggles and other controls work for people who can not see them or press them precisely',
      automation: 'manual',
      tools: ['keyboard', 'screen-reader'],
      steps: [
        'List the keys and controls the product provides itself, physical or on screen: a hardware keypad, an on-screen keyboard, toggle keys such as Caps Lock.',
        'If it provides none of its own, record clauses 5.5 to 5.8 as not applicable.',
        'Check that the state of each locking or toggle control can be told without seeing it, and also by sight where it is shown (5.6).',
        'Where a key repeats when held, check that the delay before it repeats can be set to at least 2 seconds, or repeat turned off (5.7).',
        'Where a key is pressed twice by accident, check that the time in which a second press is ignored can be set (5.8).',
        'For physical operable parts, check that they can be told apart by touch without being activated (5.5).'
      ],
      passWhen:
        'The product has no keys or controls of its own, or each meets clauses 5.5 to 5.8 as it applies.',
      failWhen:
        'A key or control of the product fails one of clauses 5.5 to 5.8, such as an on-screen Caps Lock whose state a screen reader does not say, which fails the clause of EN 301 549 it falls under.'
    },
    {
      id: 'simultaneous-actions',
      label: 'Nothing needs two actions at the same time, or a way that does not is offered',
      automation: 'manual',
      tools: ['keyboard', 'pointer'],
      steps: [
        'Look for every action that needs two things at once: two keys held together, a key held while clicking, two fingers on the screen, both hands.',
        'For each, check that the same can be done another way, one action at a time.'
      ],
      passWhen: 'Everything in the product can be done one action at a time.',
      failWhen:
        'A function needs simultaneous actions, such as a pinch or a key held while clicking, with no way to do it one action at a time, which fails EN 301 549 5.9.'
    },
    ...(v === V4 ? [AUTHORING_TOOL(v)] : [])
  ]
});

const chapter6 = (v) => ({
  title:
    v === V3
      ? 'ICT with two-way voice communication'
      : 'ICT supporting real-time bidirectional communication',
  facets: [
    {
      id: 'real-time-communication',
      label:
        'Where the product offers calls or real-time conversation, people who can not hear or speak can take part',
      automation: 'manual',
      tools: ['keyboard', 'screen-reader'],
      steps: [
        'Check whether the product offers voice or video calls, or conversation in real time, such as a call button, a meeting room, or a call to support from the page.',
        'If it does not, record chapter 6 as not applicable.',
        'Where it offers voice, check that it also offers real-time text, typed and shown character by character as it is written, at the same time as the voice, and that the two can be told apart (6.2).',
        'Check that the caller’s identity and the status of a call are shown as text as well as by sound (6.3).',
        'Where it offers video, check that the picture is good enough for sign language and lip reading: its resolution, frame rate and synchronisation with the sound (6.5).',
        ...(v === V4
          ? [
              'Check that voice, video and real-time text can be used together in one call, where the product offers all three (6.7, total conversation).'
            ]
          : []),
        'Check that the call controls work with the keyboard and a screen reader, as chapter 9 requires.'
      ],
      passWhen:
        'The product offers no real-time communication, or it meets each clause of chapter 6 that applies to what it offers.',
      failWhen:
        'The product offers voice calls with no real-time text, or video too poor for sign language, which fails the clause of EN 301 549 chapter 6 it falls under.'
    },
    {
      id: 'alternatives-to-voice',
      label: 'Services the product offers by voice can also be used without hearing or speaking',
      automation: 'manual',
      steps: [
        'Look for services the product offers by voice: an automated phone line, voice mail, a voice assistant.',
        'If there are none, record clause 6.4 as not applicable.',
        'Check that each can also be used without hearing or speaking, such as by text, or that real-time text reaches it.'
      ],
      passWhen: 'Every voice-based service can also be used without hearing or speaking.',
      failWhen: 'A service can only be used by listening and speaking, which fails EN 301 549 6.4.'
    }
  ]
});

const chapter7 = (v) => ({
  title: 'ICT with video capabilities',
  facets: [
    {
      id: 'subtitles-shown',
      label: `Where the product plays video with sound, its player shows the ${subtitles(v)} the video has, in time`,
      automation: 'manual',
      tools: ['keyboard'],
      steps: [
        'Check whether the product plays video with sound itself, with its own player or one it embeds.',
        'If it does not, record chapter 7 as not applicable.',
        `Play a video that has ${subtitles(v)} and check that the player can show them (7.1.1), in time with what is said (7.1.2).`,
        `Check that the user can change how the ${subtitles(v)} look: size, colour, background (7.1.4).`,
        `Where the video has spoken ${subtitles(v)}, check that the player can play them (7.1.5).`,
        `Where the product converts or passes video on, check that the ${subtitles(v)} are kept (7.1.3).`
      ],
      passWhen: `The product plays no video, or its player shows the ${subtitles(v)} a video has, in time, as the user wants them.`,
      failWhen: `The player can not show a video’s ${subtitles(v)}, shows them out of time, or gives no way to change how they look, which fails the clause of EN 301 549 7.1 it falls under.`
    },
    {
      id: 'audio-description-played',
      label: 'The player plays the audio description a video has, in time',
      automation: 'manual',
      tools: ['keyboard'],
      steps: [
        'Play a video that has audio description.',
        'Check that the player can play it (7.2.1), in time with the picture (7.2.2).',
        'Where the product converts or passes video on, check that the audio description is kept (7.2.3).'
      ],
      passWhen:
        'The product plays no video, or its player plays the audio description a video has, in time.',
      failWhen:
        'The player can not play a video’s audio description, or plays it out of time, which fails the clause of EN 301 549 7.2 it falls under.'
    },
    {
      id: 'user-controls',
      label: `${v === V3 ? 'Captions' : 'Subtitles'} and audio description are turned on with the player’s main controls`,
      automation: 'manual',
      tools: ['keyboard', 'screen-reader'],
      steps: [
        'Find how the player turns the video’s main features on and off: play, volume, full screen.',
        `Check that ${subtitles(v)} and audio description are turned on and off at the same level, as easily, not hidden in a settings page.`,
        'Check those controls with the keyboard and a screen reader.'
      ],
      passWhen: `${v === V3 ? 'Captions' : 'Subtitles'} and audio description are controlled as easily as play and volume.`,
      failWhen: `Turning ${subtitles(v)} or audio description on takes more than the player’s main controls, such as a setting in another page, which fails EN 301 549 7.3.`
    }
  ]
});

const chapter8 = () => ({
  title: 'Hardware',
  facets: [
    {
      id: 'hardware',
      label: 'Hardware the product includes meets the clauses of chapter 8',
      automation: 'manual',
      steps: [
        'Check whether the product includes hardware: a device, a kiosk or terminal, a keypad, a card reader, headphones.',
        'A website or an app used on the user’s own device includes none: if so, record chapter 8 as not applicable.',
        'For each piece of hardware, assess the clauses of chapter 8 that apply to it: speech output (8.2), the reach and space of stationary ICT (8.3), operable parts (8.4), and the rest the chapter lists.'
      ],
      passWhen:
        'The product includes no hardware, or each piece meets the clauses of chapter 8 that apply.',
      failWhen:
        'Hardware the product includes fails a clause of chapter 8, such as a kiosk with controls out of reach, which fails the clause of EN 301 549 chapter 8 it falls under.'
    }
  ]
});

const chapter10 = (v) => ({
  title: 'Non-web documents',
  facets: [
    {
      id: 'documents',
      label: 'Documents the product provides, other than web pages, meet the clauses of chapter 10',
      automation: 'manual',
      tools: ['screen-reader', 'keyboard'],
      steps: [
        'List the documents the product provides that are not web pages: downloads in PDF, word-processing, spreadsheet, presentation or e-book formats, attachments to messages.',
        'Leave out a document that is part of a web page, and documentation, which chapter 12 also covers.',
        'If nothing is left, record chapter 10 as not applicable.',
        'Open each in a common reader for its format, and assess clauses 10.1 to 10.4, the WCAG criteria applied to documents: text alternatives, headings and tags, reading order, contrast, language, link text, form fields.',
        'Read each with a screen reader, start to end, and move through it by headings.',
        ...(v === V4
          ? [
              'Check that the document can be shown with the user’s preferences in the reader, such as a larger text size and their own colours, where its format allows (10.7).'
            ]
          : [])
      ],
      passWhen:
        'The product provides no non-web documents, or each meets the clauses of chapter 10 that apply.',
      failWhen:
        'A document the product provides fails a clause of chapter 10, such as an untagged PDF a screen reader reads out of order, which fails the clause of EN 301 549 chapter 10 it falls under.'
    }
  ]
});

const chapter11 = (v) =>
  v === V3
    ? {
        title: 'Software',
        facets: [
          {
            id: 'non-web-software',
            label:
              'Software the product includes that is not web content meets clauses 11.1 to 11.6',
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
          AUTHORING_TOOL(v)
        ]
      }
    : {
        title: 'Non-web software',
        facets: [
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
        ]
      };

const chapter13 = (v) => ({
  title: 'ICT providing relay or emergency service access',
  facets: [
    {
      id: 'relay-and-emergency',
      label:
        v === V3
          ? 'Relay services the product provides meet their clauses, and access to relay and emergency services is not blocked'
          : 'Relay services the product provides meet their clauses, and access to them is not blocked',
      automation: 'manual',
      steps: [
        'Check whether the product is a relay service, such as text, sign language, lip-reading, captioned telephony or speech-to-speech relay, or a means of reaching one or of calling emergency services.',
        'If it is none of these, record chapter 13 as not applicable.',
        'For a relay service, assess the clauses of 13.1 for its kind, such as real-time text or video good enough for sign language.',
        v === V3
          ? 'Where the product offers two-way communication meant for use with relay or emergency services, check that it lets calls reach them and come from them, by voice, real-time text or video, as both sides support (13.2, 13.3).'
          : 'Where the product offers communication meant for use with relay services, check that it lets calls reach them and come from them, in the media both sides support (13.1.2).'
      ],
      passWhen:
        'The product provides no relay or emergency access, or meets each clause of chapter 13 that applies.',
      failWhen:
        'A relay service fails its clause, or the product blocks the use of relay or emergency services, which fails the clause of EN 301 549 chapter 13 it falls under.'
    }
  ]
});

const forVersion = (v) => ({
  ...chapter4(v),
  5: chapter5(v),
  6: chapter6(v),
  7: chapter7(v),
  8: chapter8(v),
  10: chapter10(v),
  11: chapter11(v),
  ...chapter12(v),
  13: chapter13(v)
});

const OWN_PROCEDURES = { [V3]: forVersion(V3), [V4]: forVersion(V4) };

module.exports = { OWN_PROCEDURES };
