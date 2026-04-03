# Patterns of Place — Implementation Notes

Reference plan: [patterns-of-place-react-rebuild-plan.md](./patterns-of-place-react-rebuild-plan.md)

---

## What Was Built

The 1,151-line monolith at `patterns-of-place-final (3).jsx` has been decomposed into a production-ready React feature module at `src/features/patternsOfPlace/`.

The feature is mounted at both `/` and `/patterns-of-place` via a lazy-loaded page wrapper.

---

## Module Map

```
src/
  App.jsx                              ← lazy route to /patterns-of-place
  pages/
    PatternsOfPlacePage.jsx            ← thin page wrapper
  features/
    patternsOfPlace/
      app/
        PatternsOfPlaceApp.jsx         ← root: Provider + StageRouter
        PatternsOfPlaceProvider.jsx    ← useReducer context; usePatternsOfPlace() hook
        reducer.js                     ← all state transitions + entity factories
        actions.js                     ← action type constants
        selectors.js                   ← derived state helpers (pure functions)
      components/
        shared/
          Button.jsx                   ← primary/secondary/ghost/danger/blue variants
          Divider.jsx
          Label.jsx
          SliderControl.jsx
          ColorPicker.jsx              ← 5-channel color input
          PatternTile.jsx              ← memoized layered motif renderer
          CardCanvas.jsx               ← memoized postcard canvas with ring/cluster highlights
        stageSplash/
          StageSplash.jsx
        stagePatternLab/
          StagePatternLab.jsx
        stageTemplatePicker/
          StageTemplatePicker.jsx
        stageStudio/
          StageStudio.jsx
        stageFinalize/
          StageFinalize.jsx
          PostcardReverse.jsx
      hooks/
        useExportArtwork.js            ← JPEG + SVG export; no UI state
      data/
        motifs/
          motifComponents.jsx          ← M01–M09 inline SVG React components
          motifRegistry.js             ← MOTIFS array, MOTIF_NAMES, MOTIF_COUNT
        constants/
          themes.js                    ← THEMES (dark/light), FONT, FONT_MONO
          blendModes.js                ← BLEND_MODES array
          backgrounds.js               ← BG_DARK, BG_LIGHT presets
          templates.js                 ← TEMPLATES (6 layout presets)
          defaults.js                  ← DEFAULT_COLORS, DEFAULT_BG_COLOR, MAX_RINGS
      domain/
        geometry.js                    ← tangentSize, polar, clamp (pure math)
      utils/
        id.js                          ← makeId() — stable unique ID generator
        download.js                    ← triggerDownload, svgStringToCanvas
```

---

## State Shape

Managed by `useReducer` in `PatternsOfPlaceProvider`. Never mutated directly.

```
{
  ui: {
    stage           0–4 (Splash → PatternLab → TemplatePicker → Studio → Finalize)
    theme           "dark" | "light"
    activeLayerId   id of selected layer in Pattern Lab
    activeClusterId id of selected cluster in Studio
    activeRingId    id of selected ring in Studio
    ringSetupMode   "motif" | "preset"
    previewSide     "front" | "reverse"
  },
  library: [{ id, name, layers }]    ← saved pattern presets
  editor: {
    layers          Pattern Lab working layers
    selectedTemplate
    clusters        Studio clusters (each with rings)
    bgColor
  },
  export: {
    isDownloading
    statusMessage
  }
}
```

---

## Key Design Decisions

### Reducer-driven stage flow
Stage transitions are plain `SET_STAGE` dispatches. `SELECT_TEMPLATE` is the one action that simultaneously sets the template, generates clusters from it, and advances to stage 3 — keeping the template-picker interaction atomic.

### Selectors as pure functions
`selectActiveLayer`, `selectActiveCluster`, `selectActiveRing` always return a safe fallback so stage components never need null guards on active entities.

### Memoized render components
`PatternTile` and `CardCanvas` are wrapped in `React.memo`. These are the most render-sensitive components — they paint every motif tile in the canvas on every slider change.

### `usePatternsOfPlace()` hook
Returns `{ state, dispatch, T }` where `T` is the resolved theme token object (`THEMES[state.ui.theme]`). Every component that needs theming calls this single hook rather than importing THEMES directly.

### Export logic isolation
`useExportArtwork` has no knowledge of global state. It receives `clusters`, `bgColor`, and `library` as arguments, builds the SVG string via pure functions in `domain/geometry.js` and `utils/download.js`, and returns two stable callbacks. The Finalize stage owns the loading/error status via `SET_EXPORT_STATUS` dispatch.

### Lazy loading
`PatternsOfPlacePage` is lazy-loaded at the route level. The motif SVGs (M02 and M08 are large) are co-located in a single `motifComponents.jsx` file so they are bundled into the same lazy chunk and not loaded until the route is visited.

---

## Stage User Flow

| Stage | Route trigger | Key actions dispatched |
|---|---|---|
| 0 Splash | initial load | `SET_STAGE`, `SET_THEME` |
| 1 Pattern Lab | Begin → | `ADD/REMOVE/UPDATE_LAYER`, `SAVE/DELETE_PRESET` |
| 2 Template Picker | To Ring Studio → | `SET_STAGE` (back), `SELECT_TEMPLATE` (advance) |
| 3 Ring Studio | template chosen | `ADD/REMOVE/UPDATE_CLUSTER`, `ADD/REMOVE/UPDATE_RING`, `SET_BG_COLOR` |
| 4 Finalize | Finalize → | `SET_PREVIEW_SIDE`, `SET_EXPORT_STATUS`, `RESET` |

---

## Entity Factories (in `reducer.js`)

| Factory | Creates |
|---|---|
| `makeLayer(motifIndex)` | Pattern Lab layer with DEFAULT_COLORS |
| `makeRing(index)` | Ring with count/radius scaled by index |
| `makeCluster(tplEntry)` | Cluster at tpl `{x, y, scale}` with 3 default rings |

IDs are always generated via `makeId()` from `utils/id.js` — never `Date.now()` inline.

---

## Export Pipeline

1. `buildSVG(clusters, bgColor, library, W, H)` — assembles a flat SVG string by walking clusters → rings → tiles, calling `getInlineSVG(motifId, ...colors)` for each tile.
2. SVG download: blobs directly, no canvas involved.
3. JPEG download: SVG string → `svgStringToCanvas` (draws into `<canvas>`) → `toDataURL("image/jpeg", 0.95)` → `triggerDownload`.

Export dimensions: 1800 × 1200 px.

> Note: `getInlineSVG` has full inline paths for motifs 0, 2, and 3. Motifs 4–9 fall back to motif 0 in SVG export. On-screen rendering uses the full React components for all 9.

---

## Reverse Decorations

Motif tiles can be placed on the reverse side of the postcard in the Finalize stage.

### How it works

The user switches to the **Reverse** tab in the Finalize panel. A decoration sub-panel appears with:

- **Add / remove** decoration items (+ / − buttons)
- **Motif picker** — same 9-motif grid used in Pattern Lab and Studio
- **5-channel color picker**
- **X / Y position sliders** (0–100% of canvas width/height)
- **Size slider** (scale × 80px base size on the 660px preview canvas)
- **Rotation slider** (0–360°)
- **Blend mode** selector

The selected decoration is highlighted with a cyan dashed ring on the preview, matching the ring highlight convention used in Studio.

### State

`editor.reverseDecorations` — array of decoration entities:

```
{ id, motifId, x, y, scale, rotation, blend, colors }
```

`ui.activeReverseDecorationId` — id of the currently selected decoration.

### Entity factory

`makeDecoration()` in `reducer.js` — starts at `{ x: 0.15, y: 0.15, scale: 0.8 }`.

### Files changed

| File | Change |
|---|---|
| `app/actions.js` | Added `ADD/REMOVE/UPDATE_REVERSE_DECORATION`, `SET_ACTIVE_REVERSE_DECORATION` |
| `app/reducer.js` | Added `makeDecoration()` factory, `reverseDecorations` in editor state, `activeReverseDecorationId` in ui, four new reducer cases |
| `app/selectors.js` | Added `selectReverseDecorations`, `selectActiveReverseDecoration` |
| `PostcardReverse.jsx` | Now accepts `decorations` + `activeDecorationId` props; renders motifs as an overlay layer |
| `StageFinalize.jsx` | Restructured to split-pane layout; `ReversePanel` component renders decoration controls when on reverse side |

---

## What Is Not Yet Done (per Phase 3–4 of the plan)

- CSS token file (`styles/tokens.css`) and Tailwind design-parity pass — components currently use inline styles matching the prototype exactly; Tailwind classes can replace static styles in a later pass.
- `domain/mappers.js`, `domain/validators.js` — input validation (clamp, max rings, empty preset names) is handled inline in the reducer for now.
- Unit tests — `reducer.test.js`, `geometry.test.js`, `export.test.js` are not yet written.
- Accessibility audit — `aria-label` attributes are present on icon buttons and export status uses `aria-live="polite"`, but a full a11y pass is pending.
- Responsive / mobile reflow — desktop split-pane layout is preserved; mobile stacking is not yet implemented.
