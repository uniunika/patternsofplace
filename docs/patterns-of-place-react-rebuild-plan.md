# Patterns of Place React Rebuild Plan

## 1) Goal

Rebuild the Patterns of Place mechanism currently implemented in one large file into a production-ready React feature inside my-project, while preserving behavior and visual output.

Design parity is required: the rebuilt version should look and feel the same as the current prototype, including spacing, typography scale, control density, stage layout, and visual hierarchy.

This plan keeps the same user journey:

1. Splash
2. Pattern Lab
3. Template Picker
4. Ring Studio
5. Finalize and Export

The implementation focus is React best practices:

- Clear feature boundaries
- Small reusable components
- Centralized state transitions
- Testable logic extracted from UI
- Minimal re-renders and predictable performance
- Accessibility and keyboard support

## 2) Why Rebuild Instead of Copy-Paste

The attached file is already React syntax, but it behaves like a prototype monolith.

Main issues to avoid in production:

- Too many responsibilities in one file
- Styling and behavior tightly coupled inline
- No domain-level separation for motifs, templates, and export logic
- Hard to test state transitions
- Difficult to evolve or onboard collaborators

## 3) Target Architecture

Create a dedicated feature module under src.

Suggested structure:

src
features
patternsOfPlace
app
PatternsOfPlaceApp.jsx
PatternsOfPlaceProvider.jsx
reducer.js
actions.js
selectors.js
components
shared
Button.jsx
Divider.jsx
Label.jsx
SliderControl.jsx
ColorPicker.jsx
CardCanvas.jsx
PatternTile.jsx
stageSplash
StageSplash.jsx
stagePatternLab
StagePatternLab.jsx
LayerList.jsx
MotifGrid.jsx
stageTemplatePicker
StageTemplatePicker.jsx
stageStudio
StageStudio.jsx
ClusterPanel.jsx
RingPanel.jsx
BackgroundPanel.jsx
stageFinalize
StageFinalize.jsx
PostcardReverse.jsx
hooks
useExportArtwork.js
useThemeTokens.js
useStageNavigation.js
data
motifs
motifRegistry.js
motifNames.js
motifAssets.js
constants
themes.js
blendModes.js
backgrounds.js
templates.js
defaults.js
domain
mappers.js
validators.js
geometry.js
styles
tokens.css
base.css
stageSplash.css
stagePatternLab.css
stageStudio.css
stageFinalize.css
utils
id.js
color.js
download.js
svgColorize.js
tests
reducer.test.js
geometry.test.js
export.test.js
stageFlow.test.jsx

## 4) State Management Strategy

Use a feature-local reducer with context provider.

Why:

- State is complex and cross-stage
- Many nested updates (clusters, rings, layers)
- Reducer gives explicit transitions and simpler tests

State shape recommendation:

- ui
  - stage
  - theme
  - activeClusterId
  - activeRingId
  - activeLayerId
  - ringSetupMode
  - previewSide
- library
  - presets list
- editor
  - working layers for Pattern Lab
  - selected template
  - studio clusters
  - background color
- export
  - isDownloading
  - statusMessage

Rules:

- Never mutate nested state directly
- Keep action payloads minimal and explicit
- Keep generated ids stable using a single id utility

## 5) Component Decomposition Map

From monolith to componentized mapping:

- Theme and constants
  - Move into data/constants
- Motif functions M01 to M09
  - Replace with SVG asset-backed motifs from the assets folder
  - Use data/motifs/motifAssets.js as metadata map and lookup
- PatternTile
  - shared component used by Pattern Lab and Studio
- CardCanvas
  - shared rendering surface
- PostcardReverse
  - stageFinalize component
- Export hook
  - hooks/useExportArtwork.js with pure helpers under utils/download.js
- UI helpers Button, Slider, ColorPicker, Divider, Label
  - shared components with consistent props and style tokens
- Stage components
  - one container per stage

## 5.1) SVG Assets as Source of Truth

Pattern motifs should come from the existing SVG files in the assets folder.

Recommended placement and mapping:

- Keep motif SVG files under src/assets/patterns
- Create data/motifs/motifAssets.js to map motif id to name, file path, and default palette behavior
- Use a single Motif renderer component that loads and renders SVG by motif id

Rendering options:

- Preferred: import SVG markup and inject as sanitized inline SVG so fills can be color-mapped dynamically
- Alternative: prebuild React SVG components if color channels are fixed and stable
- Avoid img-only rendering for editable motifs because color remapping becomes limited

Colorization strategy:

- Standardize SVG color placeholders per motif, then replace tokens with runtime palette colors
- Keep replacement logic in utils/svgColorize.js
- Do not store large inline SVG strings in component files

Export implications:

- Export pipeline should use the same SVG source and colorization logic used by on-screen rendering
- This avoids visual mismatch between preview and downloaded SVG or JPEG

## 6) Styling Best Practices

Move away from full inline styles.

Recommended approach:

- Tailwind utility classes for most styling
- CSS variables for theme tokens in styles/tokens.css (consumed by Tailwind)
- Minimal stage-level CSS only when utilities are insufficient
- Inline style only for highly dynamic values (canvas positions, transforms)
- Avoid hard-coded color literals in components when theme tokens exist

Token examples:

- --color-bg
- --color-surface
- --color-border
- --color-text
- --color-muted
- --color-accent-gold
- --color-active-cyan
- --color-active-orange

## 6.1) Tailwind Design-Parity Strategy

Use Tailwind to replicate the existing visual system exactly, not to redesign it.

Implementation rules:

- Preserve existing measurements first, then refactor
- Keep dynamic geometry in inline styles only for left, top, width, height, and transform
- Move all static visual styles to Tailwind classes
- Centralize color and shadow values as CSS variables and map them in Tailwind

Tailwind configuration guidance:

- Extend colors from CSS variables, for example bg, surf, surf2, brd, txt, mut, dim, gold, active
- Extend boxShadow with current postcard and panel shadows
- Extend fontFamily for UI and mono usage to match current typography
- Add small spacing and radius tokens where needed to match current controls

Component class patterns:

- Panel shell: fixed width, border, surface bg, vertical scroll, compact paddings
- Primary button: gold fill, strong contrast text, hover translate-y, disabled opacity
- Secondary and ghost button: surface or transparent bg with border token
- Label and micro text: uppercase tracking, compact font size, muted color token
- Active ring and cluster indicators: keep current cyan and orange accents

Responsive parity rules:

- Desktop should preserve the same split-pane composition used now
- Mobile should stack controls and preview without changing feature behavior
- Do not remove controls to fit mobile; reflow them

Visual no-regression checklist:

- Stage header sizes and spacing match the prototype
- Left control rail density matches the prototype
- Preview card proportion remains 3:2
- Ring highlight and cluster marker colors match
- Dark and light theme contrast stays equivalent to current behavior

## 7) Domain Logic Separation

Pure logic should live outside React components.

Extract these from UI:

- tangent size calculation
- polar coordinate math
- ring tile size calculation
- stage transition guards
- preset serialization and cloning

Put them in domain/geometry.js, domain/mappers.js, domain/validators.js.

Benefits:

- Unit test without rendering
- Fewer UI bugs from accidental state logic changes

## 8) Data Modeling and Validation

Define strict object contracts even in JavaScript.

Example entities:

- Layer
  - id, motifId, x, y, scale, rotation, blend, colors
- Ring
  - id, count, radius, motifId optional, presetId optional, colors, blend
- Cluster
  - id, x, y, scale, rings
- Preset
  - id, name, layers

Add validation helpers:

- clamp ring count and radius
- validate color arrays length
- prevent empty preset names
- enforce max rings per cluster

## 9) Performance Guidance

Focus areas:

- CardCanvas can render many motifs quickly
- Avoid full tree re-render when one slider moves

Apply:

- React.memo for static panels and motif preview tiles
- useMemo for expensive derived values
- useCallback for handlers passed into many children
- selector helpers to compute active entities once

Optional if needed later:

- requestAnimationFrame throttling for rapid slider updates
- offscreen rendering for export-heavy operations

## 10) Accessibility Requirements

Must include:

- Semantic headings for each stage
- Keyboard reachable controls for every action
- Visible focus styles
- Aria labels for icon-only buttons
- Sufficient color contrast in both themes
- Announce export status in an aria-live region

## 11) Routing Integration in my-project

Use app routing to mount the feature page.

Proposed route:

- /patterns-of-place

App-level setup:

- Keep BrowserRouter in main root
- Register route in app routes file
- Lazy load the feature page if bundle size grows

Page wrapper:

- src/pages/PatternsOfPlacePage.jsx
- Renders PatternsOfPlaceApp feature container

## 12) Phased Migration Plan

### Phase 1: Foundation

Deliverables:

- Feature folder scaffold
- Constants and domain utilities extracted
- Reducer with initial state and actions

Acceptance criteria:

- App compiles
- No UI parity requirement yet
- Unit tests for geometry and reducer basics pass

### Phase 2: Stage Parity

Deliverables:

- StageSplash, StagePatternLab, StageTemplatePicker, StageStudio, StageFinalize
- Shared controls extracted

Acceptance criteria:

- User can complete full stage flow
- Preset save and reuse works
- Cluster and ring editing works

### Phase 3: Export and Polish

Deliverables:

- JPEG and SVG export integrated
- Reverse card and email action wired
- Theme polish and responsive behavior tuned
- Tailwind class cleanup for consistent design parity

Acceptance criteria:

- Export outputs correct dimensions and content
- No blocking UI glitches on desktop and mobile
- Tailwind implementation remains visually equivalent to prototype

### Phase 4: Hardening

Deliverables:

- Additional tests
- Performance tuning
- Accessibility checks

Acceptance criteria:

- Critical path tests pass
- No obvious accessibility blockers
- No severe re-render lag on interaction

## 13) Testing Strategy

Unit tests:

- geometry calculations
- reducers and action transitions
- validators for bounds and defaults

Component tests:

- stage navigation
- preset save/delete flow
- ring update controls update preview

Integration tests:

- full journey from splash to download trigger

Manual QA checklist:

- dark and light theme parity
- blend mode visual sanity
- custom background + preset combinations
- small viewport usability

## 14) Definition of Done

The rebuild is complete when:

- Feature is integrated at /patterns-of-place
- Code is split into clear modules
- No single file acts as monolith
- Core math and state logic has tests
- Export actions work reliably
- Accessibility and responsive checks are acceptable

## 15) Practical Implementation Notes

- Keep JSX files for now to reduce migration risk
- Add TypeScript only after parity if desired
- Do not optimize prematurely before basic parity is stable
- Keep motif data source-of-truth in one asset map backed by src/assets/patterns SVG files
- Treat reducer action names as public API inside feature

## 16) Recommended Next Task Order

1. Create feature folder scaffold and reducer
2. Move constants and geometry helpers
3. Configure Tailwind tokens for exact color, typography, and shadow mapping
4. Port StageSplash and StagePatternLab with parity checks
5. Port TemplatePicker and Studio with parity checks
6. Port Finalize with export hook
7. Add route and page wrapper
8. Add tests and polish
