# Rule catalog: EN 301 549

The rules of EN 301 549 (`@surea11y/pack-en301549`), a pack for `@surea11y/core`, which a scan given the pack runs as their tags and the pack's profiles say. Core's rules, and the WCAG rollups, are in core's [`RULE_CATALOG.md`](https://github.com/SureA11y/core/blob/main/docs/RULE_CATALOG.md).

Generated from the compiled engine's own catalog (`getChecksCatalog()`/`getRulesCatalog()`) and each rule's source header. Run `npx surea11y-pack docs` to regenerate this file whenever rules change. Do not hand-edit.

**0 rules total: 0 automatic (decide deterministically; can return `fail`), 0 manual (a person judges what they find; never `fail`, and `pass` only when nothing needs judging). 0 carry at least one formal WCAG Success Criterion mapping.**

The tables below are an index; [rule reference](#rule-reference) carries each rule's description, what it applies to and what it expects.

A rule with a **Margin** line measures a value against a threshold, and its check result's `margin` says how close the closest element came while still meeting it (see [`OUTPUT_SCHEMA.md`](https://github.com/SureA11y/core/blob/main/docs/OUTPUT_SCHEMA.md#a-check-result-checksresultsi)). Unlike the fields below, it is a stable contract.

Under **What a finding reports**, a rule lists the fields its findings carry in `data.details` besides `reasonCode`, and what each one means. They help to read and reproduce a finding, but apart from `reasonCode` (and the contrast size fields [`API_STABILITY.md`](https://github.com/SureA11y/core/blob/main/docs/API_STABILITY.md) names) they are not a stable contract (see [`OUTPUT_SCHEMA.md`](https://github.com/SureA11y/core/blob/main/docs/OUTPUT_SCHEMA.md#an-occurrence-occurrencesi)): a field may be renamed or dropped in a minor release, so do not build on them.

See [`OUTPUT_SCHEMA.md`](https://github.com/SureA11y/core/blob/main/docs/OUTPUT_SCHEMA.md) for what `type`/`confidence`/`severity` mean on a scan result, and [`WCAG_CONFORMANCE.md`](https://github.com/SureA11y/core/blob/main/docs/WCAG_CONFORMANCE.md) for how these roll up to an SC-level conformance claim.

## Automatic rules (0), can return `fail`

| Rule ID | Title | WCAG SC | Level | Confidence | Default severity |
|---|---|---|---|---|---|

## Manual rules (0), never `fail`

| Rule ID | Title | WCAG SC | Level | Confidence | Default severity |
|---|---|---|---|---|---|

## Profiles (2)

What a scan runs under each profile (`engineOptions.profile`): the rules its tags select, those its standard maps for its version, and those it names, less those it leaves out. A severity column gives a rule another severity under the profile. The WCAG version is the one its scans are judged by, where the profile names it; others take it from their tags.

| Profile | Tags | Mapped rules | Rules by id | Leaves out | Severity | WCAG version |
|---|---|---|---|---|---|---|
| `en301549-v4.1.1` | `en301549` | version V4.1.1 | — | — | — | 2.2 |
| `en301549-v3.2.1` | `en301549` | version V3.2.1 | — | — | — | 2.1 |

## Rollups (53)

Each groups rules into one result, as a WCAG rollup does; the standard's own report sections show them.

| Rollup ID | Title | Rules |
|---|---|---|
| `en301549-V3.2.1-9.1.1.1` | Non-text content | `area-alt-present`, `area-alt-quality`, `canvas-text-alternative-present`, `canvas-text-alternative-quality`, `embed-text-alternative-present`, `embed-text-alternative-quality`, `img-alt-decorative`, `img-alt-present`, `img-alt-quality`, `input-image-alt-decorative`, `input-image-alt-present`, `input-image-alt-quality`, `meter-name-present`, `object-text-alternative-present`, `object-text-alternative-quality`, `progressbar-name-present`, `role-img-text-alternative-present`, `svg-image-text-alternative-present`, `svg-text-alternative-present`, `svg-text-alternative-quality`, `video-poster-text-alternative-present` |
| `en301549-V3.2.1-9.1.2.1` | Audio-only and video-only (pre-recorded) | `media-alternative-transcript-evidence` |
| `en301549-V3.2.1-9.1.2.2` | Captions (pre-recorded) | `video-caption` |
| `en301549-V3.2.1-9.1.3.1` | Info and relationships | `aria-hidden-body`, `aria-prohibited-children`, `aria-required-children`, `aria-required-parent`, `aria-roles-valid`, `definition-list-children-valid`, `dlitem-parent-valid`, `form-control-programmatic-label-present`, `list-children-valid`, `listitem-parent-valid`, `p-as-heading`, `table-fake-caption`, `table-headers-attr-valid`, `table-th-has-data-cells`, `td-has-header` |
| `en301549-V3.2.1-9.1.3.4` | Orientation | `css-orientation-lock` |
| `en301549-V3.2.1-9.1.3.5` | Identify input purpose | `autocomplete-valid` |
| `en301549-V3.2.1-9.1.4.1` | Use of colour | `link-in-text-block` |
| `en301549-V3.2.1-9.1.4.12` | Text spacing | `avoid-inline-spacing`, `text-spacing-content-loss` |
| `en301549-V3.2.1-9.1.4.2` | Audio control | `no-autoplay-audio` |
| `en301549-V3.2.1-9.1.4.3` | Contrast (minimum) | `contrast-computable`, `contrast-minimum` |
| `en301549-V3.2.1-9.1.4.4` | Resize text | `meta-viewport-zoom-enabled` |
| `en301549-V3.2.1-9.2.1.1` | Keyboard | `click-handler-keyboard-operable`, `iframe-focusable-content`, `manual-review`, `mouse-only-event-handlers`, `scrollable-region-focusable`, `server-side-image-map-absent` |
| `en301549-V3.2.1-9.2.2.1` | Timing adjustable | `meta-refresh-timing-absent` |
| `en301549-V3.2.1-9.2.2.2` | Pause, stop, hide | `deprecated-elements-not-used`, `moving-content-pausable` |
| `en301549-V3.2.1-9.2.4.1` | Bypass blocks | `bypass-blocks-present` |
| `en301549-V3.2.1-9.2.4.2` | Page titled | `page-title-patterns`, `page-title-present` |
| `en301549-V3.2.1-9.2.4.3` | Focus Order | `manual-review` |
| `en301549-V3.2.1-9.2.4.4` | Link purpose (in context) | `link-name-present`, `link-name-quality` |
| `en301549-V3.2.1-9.2.4.6` | Headings and labels | `form-control-label-quality`, `heading-quality` |
| `en301549-V3.2.1-9.2.4.7` | Focus visible | `css-focus-indicator-suppressed`, `css-hidden-focus`, `manual-review` |
| `en301549-V3.2.1-9.2.5.3` | Label in name | `label-in-name` |
| `en301549-V3.2.1-9.3.1.1` | Language of page | `html-lang-attr-present`, `html-xml-lang-mismatch` |
| `en301549-V3.2.1-9.3.1.2` | Language of parts | `valid-lang` |
| `en301549-V3.2.1-9.3.3.2` | Labels or instructions | `form-control-programmatic-label-present`, `form-control-programmatic-label-quality`, `form-control-single-label` |
| `en301549-V3.2.1-9.4.1.1` | Parsing | `duplicate-id` |
| `en301549-V3.2.1-9.4.1.2` | Name, role, value | `aria-allowed-attr`, `aria-braille-equivalent`, `aria-checked-state-mismatch`, `aria-conditional-attr`, `aria-deprecated-role`, `aria-hidden-body`, `aria-hidden-focus`, `aria-prohibited-attr`, `aria-required-attr`, `aria-role-name-present`, `aria-roles-valid`, `aria-valid-attr`, `aria-valid-attr-value`, `binary-control-name-present`, `button-name-present`, `combobox-name-present`, `dialog-name-present`, `duplicate-id-aria`, `form-control-programmatic-label-present`, `identical-iframes-same-purpose`, `iframe-name-present`, `iframe-title-unique`, `input-image-alt-present`, `link-name-present`, `listbox-name-present`, `menuitem-name-present`, `nested-interactive-controls-absent`, `option-name-present`, `presentational-children-focusable-absent`, `searchbox-name-present`, `slider-name-present`, `spinbutton-name-present`, `summary-name-present`, `tab-name-present`, `textbox-name-present`, `tooltip-name-present`, `treeitem-name-present` |
| `en301549-V4.1.1-9.1.1.1` | Non-text content | `area-alt-present`, `area-alt-quality`, `canvas-text-alternative-present`, `canvas-text-alternative-quality`, `embed-text-alternative-present`, `embed-text-alternative-quality`, `img-alt-decorative`, `img-alt-present`, `img-alt-quality`, `input-image-alt-decorative`, `input-image-alt-present`, `input-image-alt-quality`, `meter-name-present`, `object-text-alternative-present`, `object-text-alternative-quality`, `progressbar-name-present`, `role-img-text-alternative-present`, `svg-image-text-alternative-present`, `svg-text-alternative-present`, `svg-text-alternative-quality`, `video-poster-text-alternative-present` |
| `en301549-V4.1.1-9.1.2.1` | Audio-only and video-only (pre-recorded) | `media-alternative-transcript-evidence` |
| `en301549-V4.1.1-9.1.2.2` | Subtitles (pre-recorded) | `video-caption` |
| `en301549-V4.1.1-9.1.3.1` | Info and relationships | `aria-hidden-body`, `aria-prohibited-children`, `aria-required-children`, `aria-required-parent`, `aria-roles-valid`, `definition-list-children-valid`, `dlitem-parent-valid`, `form-control-programmatic-label-present`, `list-children-valid`, `listitem-parent-valid`, `p-as-heading`, `table-fake-caption`, `table-headers-attr-valid`, `table-th-has-data-cells`, `td-has-header` |
| `en301549-V4.1.1-9.1.3.4` | Orientation | `css-orientation-lock` |
| `en301549-V4.1.1-9.1.3.5` | Identify input purpose | `autocomplete-valid` |
| `en301549-V4.1.1-9.1.4.1` | Use of colour | `link-in-text-block` |
| `en301549-V4.1.1-9.1.4.12` | Text spacing | `avoid-inline-spacing`, `text-spacing-content-loss` |
| `en301549-V4.1.1-9.1.4.2` | Audio control | `no-autoplay-audio` |
| `en301549-V4.1.1-9.1.4.3` | Contrast (minimum) | `contrast-computable`, `contrast-minimum` |
| `en301549-V4.1.1-9.1.4.4` | Resize text | `meta-viewport-zoom-enabled` |
| `en301549-V4.1.1-9.2.1.1` | Keyboard | `click-handler-keyboard-operable`, `iframe-focusable-content`, `manual-review`, `mouse-only-event-handlers`, `scrollable-region-focusable`, `server-side-image-map-absent` |
| `en301549-V4.1.1-9.2.2.1` | Timing adjustable | `meta-refresh-timing-absent` |
| `en301549-V4.1.1-9.2.2.2` | Pause, stop, hide | `deprecated-elements-not-used`, `moving-content-pausable` |
| `en301549-V4.1.1-9.2.4.1` | Bypass blocks | `bypass-blocks-present` |
| `en301549-V4.1.1-9.2.4.2` | Page titled | `page-title-patterns`, `page-title-present` |
| `en301549-V4.1.1-9.2.4.3` | Focus order | `manual-review` |
| `en301549-V4.1.1-9.2.4.4` | Link purpose (in context) | `link-name-present`, `link-name-quality` |
| `en301549-V4.1.1-9.2.4.6` | Headings and labels | `form-control-label-quality`, `heading-quality` |
| `en301549-V4.1.1-9.2.4.7` | Focus visible | `css-focus-indicator-suppressed`, `css-hidden-focus`, `manual-review` |
| `en301549-V4.1.1-9.2.5.3` | Label in name | `label-in-name` |
| `en301549-V4.1.1-9.2.5.8` | Target size (minimum) | `target-size-minimum` |
| `en301549-V4.1.1-9.3.1.1` | Language of page | `html-lang-attr-present`, `html-xml-lang-mismatch` |
| `en301549-V4.1.1-9.3.1.2` | Language of parts | `valid-lang` |
| `en301549-V4.1.1-9.3.3.2` | Labels or instructions | `form-control-programmatic-label-present`, `form-control-programmatic-label-quality`, `form-control-single-label` |
| `en301549-V4.1.1-9.3.3.8` | Accessible authentication (minimum) | `password-paste-enabled` |
| `en301549-V4.1.1-9.4.1.2` | Name, role, value | `aria-allowed-attr`, `aria-braille-equivalent`, `aria-checked-state-mismatch`, `aria-conditional-attr`, `aria-deprecated-role`, `aria-hidden-body`, `aria-hidden-focus`, `aria-prohibited-attr`, `aria-required-attr`, `aria-role-name-present`, `aria-roles-valid`, `aria-valid-attr`, `aria-valid-attr-value`, `binary-control-name-present`, `button-name-present`, `combobox-name-present`, `dialog-name-present`, `duplicate-id-aria`, `form-control-programmatic-label-present`, `identical-iframes-same-purpose`, `iframe-name-present`, `iframe-title-unique`, `input-image-alt-present`, `link-name-present`, `listbox-name-present`, `menuitem-name-present`, `nested-interactive-controls-absent`, `option-name-present`, `presentational-children-focusable-absent`, `searchbox-name-present`, `slider-name-present`, `spinbutton-name-present`, `summary-name-present`, `tab-name-present`, `textbox-name-present`, `tooltip-name-present`, `treeitem-name-present` |

## Rule reference

Every atomic rule, alphabetically. "Applies to" is the rule's precondition (when it returns `notApplicable`), and "Expectation" is the condition it decides once it does apply.


