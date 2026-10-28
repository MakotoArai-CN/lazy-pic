# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `bun install` (README/bun.lock suggest Bun is the primary package manager)
- Build library: `bun run build`
  - Runs `tsc && vite build`
  - Produces `dist/lazy-pic.es.js`, `dist/lazy-pic.umd.js`, sourcemaps, and declaration files
- Build declarations only: `bun run build:types`
- Start Vite dev server: `bun run dev`
- Preview Vite output: `bun run preview`
- Lint source: `bun run lint`
  - Script targets `src/**/*.{ts,tsx}`
  - There is currently no repo-level ESLint config file checked in, so verify lint behavior before relying on it
- Run tests: `bun run test`

## Current repo state relevant to development

- [vitest.config.ts](vitest.config.ts) sets `environment: 'happy-dom'`, includes `src/**/*.test.ts`, and enables mock restoration.
- The repo includes Vitest coverage for orchestration/concurrency, `StyleInjector`, `BaseStrategy`, and the compact loader system.
- [examples/index.html](examples/index.html) is the examples hub. The large browser showcase lives in [examples/vanilla.html](examples/vanilla.html), and the framework demos live in separate HTML files under [examples/](examples/). All examples load the built UMD bundle from `dist/lazy-pic.umd.js`, so rebuild before validating demo changes.

## High-level architecture

LazyPic is a browser-only TypeScript library for progressive image loading. The public API is intentionally small; most behavior is selected through configuration and a strategy pattern.

### Public entrypoints

- [src/index.ts](src/index.ts)
  - Exposes `LazyPic`, `createLazyPic`, and public types
  - Also preserves an older compatibility API via `lazyPic(settings)`, which maps legacy option names onto the modern `LazyPicConfig`

### Core orchestration

- [src/core/LazyPic.ts](src/core/LazyPic.ts)
  - Main runtime class
  - Merges defaults with user config (`animationDuration: 600`, `rootMargin: '200px'`, `threshold: 0.01`, completion effects off)
  - Queries DOM elements from `config.selector`
  - Creates an `IntersectionObserver` wrapper and dispatches each intersecting element to the selected strategy **without serializing**: every entry starts its own strategy promise, deduped per element
  - Falls back to loading all elements when `IntersectionObserver` is unavailable
  - Owns lifecycle methods: `init`, `destroy`, `updateConfig`, `refresh`, `loadImage`, `getStatus`
  - `destroy()`/`refresh()` bump a generation counter so stale loads cannot overwrite status
- [src/utils/observer.ts](src/utils/observer.ts)
  - Thin wrapper around `IntersectionObserver`
  - Does **not** run strategy cleanup on unobserve; cleanup is owned by `LazyPic.destroy()` and `BaseStrategy.cleanup()`
  - Uses `rootMargin: 200px` and `threshold: 0.01` by default

### Strategy pattern

All loading behavior is implemented behind `LoadStrategy`.

- [src/strategies/BaseStrategy.ts](src/strategies/BaseStrategy.ts)
  - Shared hooks for preload/error/load-state handling, safe custom content, masks, and completion effects
  - `preloadImage()` waits for load **and** decodes before resolving
  - `beginLoad()` / `isCurrentLoad()` provide per-element tokens that invalidate in-flight work after `cleanup()`
- [src/strategies/TwoImageStrategy.ts](src/strategies/TwoImageStrategy.ts)
  - For `strategy: 'dual-image'`
  - Expects a target image plus a sibling/nearby thumbnail image
  - Finds the thumbnail heuristically (previous sibling, next sibling, or image with `thumbnail` / `lazy-thumbnail` class in the same container)
  - `prepare()` adds `lazy-pic-pending` so the full image is hidden before intersection
  - Supports `data-src` on the full image; fast-paths already-loaded images
  - Crossfades thumbnail → full image with WAAPI
  - Hides the thumbnail with `visibility` + `opacity: 0` (not `display: none`) so in-flow thumbnails do not collapse layout at the end of the fade
- [src/strategies/DataSrcStrategy.ts](src/strategies/DataSrcStrategy.ts)
  - For `strategy: 'data-src'`
  - Preloads and decodes `data-src`, then fades an absolutely positioned overlay over the low-res `src`
  - Swaps the real `src` only after the overlay is opaque, avoiding a flash or a second network wait
  - Locks the image's CSS transition while clearing the placeholder blur, then restores it one frame later; otherwise a site-wide `transition: all` would add a visible sharpening pass after the crossfade
- [src/strategies/AnimationStrategy.ts](src/strategies/AnimationStrategy.ts)
  - For `strategy: 'animation'`
  - Mounts a full-cover placeholder only if the image is not ready within 100ms (no forced minimum display time)
  - Fades the placeholder out and the image in concurrently, then removes the placeholder
  - Fast-paths images that are already loaded/cached

When modifying behavior, keep the strategy boundaries intact instead of branching more logic into `LazyPic`.

### Animation system

- [src/utils/animation.ts](src/utils/animation.ts)
  - WAAPI primitives: `play()` (with `commitStyles()`), `decodeImage()` (3s guard), `transitionDuration()` clamp, easing → CSS timing-function map
  - `prefersReducedMotion()` is checked once and disables all WAAPI/coded motion
  - `createCompletionEffect()` runs identity-start/identity-end animations with `commit: false` so no inline styles leak
  - The default `fade` keyframes are pure opacity; scale movement is reserved for explicit `zoom`/`scale`
- [src/animations/index.ts](src/animations/index.ts)
  - Ten compact loaders built from static templates and one shared CSS string
  - Legacy loader names map through `LOADER_ALIASES` to the curated set
  - CSS uses `--lp-color` and `--lp-speed` custom properties
- [src/core/StyleInjector.ts](src/core/StyleInjector.ts)
  - Singleton that injects the shared stylesheet into `document.head` using `textContent`
  - Called during `init()` and `loadImage()` so strategies can rely on the classes existing

### Types and config surface

- [src/types/index.ts](src/types/index.ts)
  - Defines the public config/API surface (`LazyPicConfig`, `PlaceholderConfig`, `MaskConfig`, `CompletionEffectConfig`, `QualityConfig`, `LazyPicInstance`, `LoadStrategy`)
  - This is the contract to update when adding a new option or strategy feature

Note: some type members and example-page options are broader than what `LazyPic.createStrategy()` currently supports. For example, the type union includes `progressive` and `mosaic`, but the runtime currently instantiates only `dual-image`, `data-src`, and `animation`.

### Build shape

- [vite.config.ts](vite.config.ts)
  - Vite is configured in library mode
  - Entry is [src/index.ts](src/index.ts)
  - Outputs both ES and UMD builds
  - Uses `vite-plugin-dts` to generate declaration files from `src`
  - Vite's terser plugin skips ES library chunks, so a small `closeBundle` plugin minifies `dist/lazy-pic.es.js` (with its existing source map) after the build
- [vitest.config.ts](vitest.config.ts)
  - Happy DOM test environment, `src/**/*.test.ts`
- [package.json](package.json)
  - Package exports point consumers at `dist/index.d.ts`, `dist/lazy-pic.es.js`, and `dist/lazy-pic.umd.js`
  - `test` runs `vitest run`

### Demo/documentation structure

- [README.md](README.md) is the main product overview and usage guide
- [docs/README-ZH.md](docs/README-ZH.md) and [docs/README-JP.md](docs/README-JP.md) are translated docs
- [examples/index.html](examples/index.html) is a large manual demo page that exercises all three current strategies against the UMD build

## Practical guidance for edits

- If you add a new loading strategy, update [src/types/index.ts](src/types/index.ts), the `createStrategy()` switch in [src/core/LazyPic.ts](src/core/LazyPic.ts), and the README/docs examples.
- If you add new visual states or loader classes, keep [src/animations/index.ts](src/animations/index.ts) and strategy DOM/class usage in sync. Add legacy names to `LOADER_ALIASES` rather than shipping a second loader implementation.
- If you add a new animation type, add keyframes to both `TwoImageStrategy.getTransitionFrames()` and `DataSrcStrategy.getTransitionFrames()` (plus the `LazyPicConfig.animationType` union) and keep the total bundle in mind.
- Any new async strategy work should call `beginLoad()` / `isCurrentLoad()` so `destroy()` and `refresh()` can invalidate stale work.
- Prefer WAAPI (`play()`) over custom rAF loops. Transitions should animate `opacity`/`transform` where possible; avoid layout-triggering properties.
- If you change the public API surface, update both [src/index.ts](src/index.ts) exports and the README examples so they stay aligned.
- If you change demo-facing behavior, rebuild before checking [examples/index.html](examples/index.html), since it does not import directly from `src`.
- After build changes, verify both `dist/lazy-pic.umd.js` and `dist/lazy-pic.es.js` are minified; Vite's library terser path skips the ES chunk by design.
