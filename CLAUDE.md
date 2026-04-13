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

- There is currently no Vitest config file in the repo; tests run directly from the package script.
- The repo currently includes focused Vitest files under `src/`, including smoke coverage plus tests for `StyleInjector` and `BaseStrategy`.
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
  - Merges defaults with user config
  - Queries DOM elements from `config.selector`
  - Creates an `IntersectionObserver` wrapper and dispatches each intersecting element to the selected strategy
  - Owns lifecycle methods: `init`, `destroy`, `updateConfig`, `refresh`, `loadImage`, `getStatus`
- [src/utils/observer.ts](src/utils/observer.ts)
  - Thin wrapper around `IntersectionObserver`
  - Tracks per-element cleanup callbacks so unobserve/disconnect also clean strategy-specific DOM state

### Strategy pattern

All loading behavior is implemented behind `LoadStrategy`.

- [src/strategies/BaseStrategy.ts](src/strategies/BaseStrategy.ts)
  - Shared hooks for preload/error/load-state handling
- [src/strategies/TwoImageStrategy.ts](src/strategies/TwoImageStrategy.ts)
  - For `strategy: 'dual-image'`
  - Expects a target image plus a sibling/nearby thumbnail image
  - Finds the thumbnail heuristically (previous sibling, next sibling, or image with `thumbnail` / `lazy-thumbnail` class in the same container)
  - Handles transition animations between thumbnail and full image, optional masks, and completion effects
- [src/strategies/DataSrcStrategy.ts](src/strategies/DataSrcStrategy.ts)
  - For `strategy: 'data-src'`
  - Swaps from `img.src` to `img.dataset.src` with an overlay transition image and optional blur/mask/completion effects
- [src/strategies/AnimationStrategy.ts](src/strategies/AnimationStrategy.ts)
  - For `strategy: 'animation'`
  - Hides the image, renders a full-cover placeholder/loader over it, waits for the real image to load, then removes the placeholder with exit animation

When modifying behavior, keep the strategy boundaries intact instead of branching more logic into `LazyPic`.

### Animation system

- [src/utils/animation.ts](src/utils/animation.ts)
  - Central animation primitives and easing map
  - Provides the custom `animate()` helper plus more elaborate transition/completion-effect helpers
- [src/animations/index.ts](src/animations/index.ts)
  - DOM factories for placeholder loaders and the CSS string used by the library
- [src/core/StyleInjector.ts](src/core/StyleInjector.ts)
  - Singleton that injects shared animation CSS into `document.head`
  - Called during `LazyPic.init()` so strategies can rely on generated CSS classes existing

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
- [package.json](package.json)
  - Package exports point consumers at `dist/index.d.ts`, `dist/lazy-pic.es.js`, and `dist/lazy-pic.umd.js`

### Demo/documentation structure

- [README.md](README.md) is the main product overview and usage guide
- [docs/README-ZH.md](docs/README-ZH.md) and [docs/README-JP.md](docs/README-JP.md) are translated docs
- [examples/index.html](examples/index.html) is a large manual demo page that exercises all three current strategies against the UMD build

## Practical guidance for edits

- If you add a new loading strategy, update both [src/types/index.ts](src/types/index.ts) and the `createStrategy()` switch in [src/core/LazyPic.ts](src/core/LazyPic.ts).
- If you add new visual states or loader classes, keep [src/animations/index.ts](src/animations/index.ts) and strategy DOM/class usage in sync.
- If you change the public API surface, update both [src/index.ts](src/index.ts) exports and the README examples so they stay aligned.
- If you change demo-facing behavior, rebuild before checking [examples/index.html](examples/index.html), since it does not import directly from `src`.
