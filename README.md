<div align="center">
<img src="lazy-pic-logo.png" width="300" height="300" alt="LazyPic Logo" style="border-radius: 50%" />

<!-- npm V10.9.0 -->
[![npm](https://img.shields.io/badge/npm-v10.9.0-orange.svg)](https://www.npmjs.com)
[![bun](https://img.shields.io/badge/bun-v1.2.4-blue.svg)](https://bun.sh)
[![vite](https://img.shields.io/badge/vite-v4.4.9-green.svg)](https://vitejs.dev)
[![node](https://img.shields.io/badge/node-v22.11.0-freen.svg)](https://nodejs.org)
[![license](https://img.shields.io/github/license/MakotoArai-CN/lazy-pic.svg)](https://github.com/MakotoArai-CN/lazy-pic/blob/main/LICENSE)
<!-- start-badges -->
[![GitHub stars](https://img.shields.io/github/stars/MakotoArai-CN/lazy-pic.svg?style=social)](https://github.com/MakotoArai-CN/lazy-pic/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MakotoArai-CN/lazy-pic.svg?style=social)](https://github.com/MakotoArai-CN/lazy-pic/network)
[![GitHub watchers](https://img.shields.io/github/watchers/MakotoArai-CN/lazy-pic.svg?style=social)](https://github.com/MakotoArai-CN/lazy-pic/watchers)
[![GitHub issues](https://img.shields.io/github/issues/MakotoArai-CN/lazy-pic.svg?style=social)](https://github.com/MakotoArai-CN/lazy-pic/issues)

</div>

> Elegant progressive image loading library with TypeScript support

<p align="center">
<pre>
        ██╗      █████╗ ███████╗██╗   ██╗     ██████╗ ██╗ ██████╗
        ██║     ██╔══██╗╚══███╔╝╚██╗ ██╔╝     ██╔══██╗██║██╔════╝
        ██║     ███████║  ███╔╝  ╚████╔╝█████╗██████╔╝██║██║
        ██║     ██╔══██║ ███╔╝    ╚██╔╝ ╚════╝██╔═══╝ ██║██║
        ███████╗██║  ██║███████╗   ██║        ██║     ██║╚██████╗
        ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝        ╚═╝     ╚═╝ ╚═════╝
</pre>

</p>

<p align="center">

[[English](./README.md) | [中文](./docs/README-ZH.md) | [日本語](./docs/README-JP.md) ]

</p>

## ✨ Features

- 🚀 **Concurrent Loading**: every intersecting image starts immediately instead of waiting for the previous one to finish
- ⚡ **Compositor-Friendly Motion**: transitions run on the Web Animations API (WAAPI), not a per-frame `requestAnimationFrame` loop
- 🖼️ **Decode Before Reveal**: images are preloaded and decoded before they become visible, removing decode jank mid-transition
- 🎨 **Elegant Transitions**: nine transition types with curated, short durations
- 📱 **Responsive**: perfect for all device sizes
- 🎯 **Strategy Pattern**: three loading strategies for different use cases
- 🔧 **Flexible Configuration**: sensible defaults (`600ms`, `rootMargin: 200px`, `threshold: 0.01`)
- ♿ **Reduced Motion**: automatically skips transitions and loader animation when the OS asks for it
- 📦 **Small & Zero Dependencies**: ~8 KB gzipped, no runtime dependencies
- 🌍 **Browser Support**: modern browsers with IntersectionObserver support (falls back to loading everything)
- ⚡ **Optimized Transitions**: smooth, elegant progressive loading effects

## 📦 Installation

### NPM
```bash
npm install @makotoarai/lazy-pic
```

### Bun
```bash
bun add @makotoarai/lazy-pic
```

### CDN
```html
<script src="https://unpkg.com/@makotoarai/lazy-pic@0.6.0/dist/lazy-pic.umd.js"></script>
```

### Browser

1. Clone the repository: `git clone https://github.com/MakotoArai-CN/lazy-pic.git` or download the latest release.

1. Include the `dist/lazy-pic.umd.js` file in your HTML:

  ```html
  <script src="path/to/lazy-pic.umd.js"></script>
  ```

1. Use the UMD global in the browser:

  ```html
  <script>
    const lazyPic = new LazyPic.LazyPic({
      selector: '.lazy-image',
      strategy: 'data-src'
    });
    lazyPic.init();
  </script>
  ```

## 🚀 Quick Start

### ES Modules

```javascript
import { LazyPic } from '@makotoarai/lazy-pic';

const lazyPic = new LazyPic({
  selector: '.lazy-image',
  strategy: 'data-src',
  animationType: 'fade',
  animationDuration: 600
});

lazyPic.init();
```

Defaults are intentionally tuned for perceived speed: images begin loading 200px before they enter the viewport, transitions last 600ms, and loading never inserts an artificial delay.

## 🌐 Examples

- [Examples Hub](examples/index.html)
- [Vanilla Demo](examples/vanilla.html)
- [Vue CDN Demo](examples/vue.html)
- [React CDN Demo](examples/react.html)
- [Alpine CDN Demo](examples/alpine.html)

All browser examples load `dist/lazy-pic.umd.js`. Build the library with `bun run build` before opening them.

## 📖 Usage Examples

### 1. Dual Image Strategy (Recommended)

Use `data-src` for the full image so the network request really is lazy. A full-size `src` is fetched by the browser during HTML parsing, before LazyPic can do anything.

```html
<div style="position: relative">
  <img src="thumbnail.jpg" class="thumbnail" style="position: absolute; width: 100%;" alt="">
  <img data-src="full-image.jpg" class="main-image" alt="">
</div>
```

```javascript
const lazyPic = new LazyPic({
  selector: '.main-image',
  strategy: 'dual-image',
  animationType: 'fade', // fade, slide, scale, zoom, blur, flip, reveal, rotate, spiral
  animationDuration: 600,
  easing: 'ease-out', // linear, ease, ease-in, ease-out, ease-in-out, bounce, elastic
  completionEffect: { enabled: false }
});
lazyPic.init();
```

If the full image is already cached or was loaded before `init()`, LazyPic skips the animation and shows it immediately.

### 2. Data-src Strategy

```html
<img src="thumbnail.jpg" data-src="full-image.jpg" class="lazy-image" alt="">
```

```javascript
const lazyPic = new LazyPic({
  selector: '.lazy-image',
  strategy: 'data-src',
  enableBlur: true,
  blurIntensity: 10,
  animationType: 'slide'
});
lazyPic.init();
```

The sharp image is preloaded and decoded first, then crossfaded over the placeholder by a single absolutely positioned overlay. The real `src` is swapped only after the overlay is fully visible, so there is no flash or second network wait.

### 3. Animation Strategy

```html
<div>
  <img data-src="image.jpg" class="animated-image" alt="">
</div>
```

```javascript
const lazyPic = new LazyPic({
  selector: '.animated-image',
  strategy: 'animation',
  placeholder: {
    animation: 'skeleton', // curated loader; see the list below
    color: '#007bff',
    width: '100%',
    height: '300px',
    showText: true,
    loadingText: 'Loading beautiful image...'
  }
});
lazyPic.init();
```

The placeholder mounts only when the image is not ready within 100ms. Cached images never flash a skeleton, and nothing holds the reveal for a minimum display time.

## ⚙️ Configuration

```typescript
interface LazyPicConfig {
  selector: string;                    // Target element selector
  animationDuration?: number;          // Transition length (default 600ms, clamped to 120–2000ms)
  strategy?: 'dual-image' | 'data-src' | 'animation';
  enableBlur?: boolean;                // Blur the low-res placeholder (default true)
  blurIntensity?: number;              // Blur strength (px, default 8)
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'rotate' | 'blur' | 'flip' | 'reveal' | 'spiral';
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  rootMargin?: string;                 // IntersectionObserver root margin (default 200px)
  threshold?: number | number[];       // IntersectionObserver threshold (default 0.01)
  placeholder?: PlaceholderConfig;     // Placeholder configuration
  completionEffect?: CompletionEffectConfig; // Optional post-load effect (off by default; never blocks onLoad)
  quality?: QualityConfig;             // Deprecated: currently not applied at runtime
  onError?: (error: Error, element: Element) => void;
  onLoad?: (element: Element) => void; // Fires as soon as the image is visible
  onStartLoad?: (element: Element) => void;
  onProgress?: (progress: number, element: Element) => void; // Deprecated: not emitted yet
}
```

> Note: `progressive`, `mosaic`, advanced `performance` settings, and `loadAll()` are not part of the current runtime API.
> For safety, `placeholder.customContent` and `mask.customContent` treat string values as plain text instead of HTML.
> The built-in `.lazy-pic-loaded` class no longer adds a flash/pulse automatically. Use `completionEffect` when you want an explicit post-load flourish.

## 🎨 Animation Types

- **fade**: pure opacity crossfade, with no scale settle
- **slide**: short upward slide with fade
- **zoom/scale**: scale settle from `1.05`/`0.94`
- **rotate**: slight rotation with scale
- **blur**: blur-to-sharp fade
- **flip**: subtle perspective flip
- **reveal**: circular / curtain clip-path reveal
- **spiral**: clip-path reveal with a gentle rotation

Transitions are driven by WAAPI keyframes (`opacity`, `transform`, `filter`, `clip-path`). All of them are skipped when `prefers-reduced-motion: reduce` is active, and long user-provided durations are capped at 2 seconds so the page never feels stuck.

## 🎭 Placeholder Animations

The library ships ten compact CSS loaders. They share one stylesheet and use CSS custom properties for color/speed, which keeps the bundle small and lets the browser animate them off the main thread.

| Loader | Notes |
| --- | --- |
| `skeleton` | Full-cover gradient with skeleton text lines |
| `shimmer` | Full-cover sheen sweep |
| `spinner` | Ring spinner |
| `dots` | Three bouncing dots |
| `pulse` | Expanding rings |
| `wave` | Five-bar waveform |
| `progress-bar` | Indeterminate sliding bar |
| `grid` | 3×3 pulsing grid |
| `scanner` | Vertical scan pass |
| `orbit` | Two counter-rotating orbit rings |

Legacy names remain accepted and map to the closest loader:

| Legacy value | Resolves to |
| --- | --- |
| `skeleton-lines` | `skeleton` |
| `diagonal-shimmer`, `shine` | `shimmer` |
| `breathing`, `ripple`, `particles`, `pulse-ring` | `pulse` |
| `typing`, `wave-dots` | `dots` |
| `arc` | `spinner` |
| `bars`, `equalizer`, `ladder`, `flow`, `blink` | `wave` |
| `cube`, `radar` | `orbit` |
| anything else | `skeleton` |

Example animation-only config:

```javascript
const lazyPic = new LazyPic({
  selector: '.animated-image',
  strategy: 'animation',
  placeholder: {
    animation: 'orbit',
    color: '#667eea',
    showText: true,
    loadingText: 'Loading preview...'
  },
  completionEffect: {
    enabled: true,
    type: 'glow'
  }
});
```

> String values passed to `placeholder.customContent` render as plain text. Pass an `HTMLElement` when you need custom DOM.
> Recommended defaults for a more elegant loading experience: `completionEffect.enabled: false` with `placeholder.animation: 'skeleton'`, `shimmer`, `spinner`, or `progress-bar`.

## 🎯 High-level differentiation

Compared with basic progressive image loaders, LazyPic differentiates itself through:

- compositor-friendly WAAPI transitions instead of per-frame style writes,
- concurrent loading and decode-before-reveal,
- ten curated placeholder loaders in a single small stylesheet,
- optional completion effects instead of a mandatory flash,
- three progressive image strategies in one library,
- safer custom placeholder/mask rendering defaults.

## 🔧 API Methods

- `init()`: Initialize lazy loading
- `destroy()`: Clean up, cancel in-flight work, and remove observers
- `updateConfig(config)`: Update configuration and re-scan
- `loadImage(element)`: Manually trigger image loading
- `refresh()`: Re-scan and observe new elements
- `getStatus()`: Get current status

## 📈 Performance Tips

- Put the full-resolution URL in `data-src`, not `src`. A browser `src` is fetched during HTML parsing, before LazyPic can defer it.
- Keep `rootMargin` at `200px` or higher so the preload has a head start; lower it only if you need to save bandwidth.
- Prefer `skeleton`, `shimmer`, `spinner`, `progress-bar`, or `dots` for the lowest-cost placeholders.
- Keep thumbnails small (< 5KB recommended) and avoid animating `filter` on very large images.
- Leave `completionEffect` disabled unless you want a deliberate post-load flourish.
- Use `dual-image` when you already have a thumbnail; use `data-src` for a single progressive image. Position the thumbnail absolutely over the full image so hiding it does not affect layout.
- The library respects `prefers-reduced-motion` automatically; no extra configuration is required.
- For the calmest completion, use `animationType: 'fade'` and `easing: 'ease-out'`. The `bounce` easing and `completionEffect.type: 'bounce'` intentionally overshoot.

## 📦 Bundle Size

Measured from `bun run build`:

| Format | Before | After |
| --- | --- | --- |
| UMD | 51.5 KB / 11.1 KB gzip | ~34.3 KB / ~8.6 KB gzip |
| ESM | 51.2 KB / 11.0 KB gzip | ~34.0 KB / ~8.4 KB gzip |

Both formats are minified; the ESM output is explicitly minified after Vite's library build because Vite skips terser for ES library chunks.

## 🔧 Build & Development

```bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Preview
bun run preview

# Tests
bun run test
```

## Changelog

### 0.6.0

- Rebuilt image transitions on the Web Animations API; no more per-frame `requestAnimationFrame` style writes or repeated transform-string parsing.
- Intersecting images now load concurrently instead of awaiting the previous image's full animation.
- Images are preloaded **and decoded** before being revealed, removing decode jank from the middle of a transition.
- Removed the hard-coded 800ms placeholder delay; the placeholder now mounts only after 100ms and fades out as the image fades in.
- `dual-image` now supports `data-src` for genuinely lazy network requests and has a fast path for already-cached images.
- Completion effects are fire-and-forget and no longer delay `onLoad`.
- Replaced 27 inline-styled loader implementations with ten compact CSS loaders plus compatibility aliases.
- Fixed strategy cleanup running at the start of a load when an element was unobserved.
- Added lifecycle cancellation so `destroy()` / `refresh()` invalidate stale async work.
- Added `prefers-reduced-motion` support and clamped transition durations to 120–2000ms.
- New defaults: `animationDuration: 600`, `rootMargin: 200px`, `threshold: 0.01`.
- Minified the ESM output (Vite skips terser for ES library chunks) and trimmed the UMD bundle from 51.5 KB to ~34.3 KB (11.1 KB → ~8.6 KB gzip).
- Removed two completion-time artifacts that could read as a rebound: in-flow thumbnails are now hidden with `visibility` instead of `display: none` (no layout jump), and `data-src` locks CSS transitions while clearing the placeholder blur so the image no longer keeps sharpening after the crossfade ends.
- `animationType: 'fade'` is now a pure opacity crossfade; scale motion only happens when you explicitly choose `zoom`/`scale`.
- Added a Vitest config and coverage for concurrent dispatch, observer lifecycle, cleanup, and loader aliases.

### 0.5.0

- Standardize local development commands on Bun and remove the redundant Vitest wrapper/config files
- Split examples into dedicated Vanilla, Vue, React, and Alpine CDN demo pages
- Refresh browser and CDN docs to use `dist/lazy-pic.umd.js` and the UMD global API

### 0.4.0-beta

- Use TypeScript for better type checking and code quality
- Add type definitions for configuration and API methods
- Add type definitions for placeholder and quality configurations
- Removed unnecessary dependencies
- Add npm , bun and CDN publishing

### 0.3.0-beta

- Added animation (anime) lazy loading mode.
- Optimized lazy loading mode.
- Modified version number content.
- Upcoming version update plan:
  1. Optimize lazy loading judgment logic, reduce code.
  2. (Possibly) fix known animation lazy loading mode bug.

### 0.2.1-beta

- Fixed the delay in displaying caused by the lazy loading judgment logic.

### 0.2.0-beta

- Optimized the lazy loading mode caused by slow network speed.
- Fixed some bugs in the native JavaScript mode.
- Upcoming version update plan:
  1. Add animation lazy loading mode.
  2. Add more optional parameter settings.

### 0.1.0-beta

- Added data-src lazy loading mode.
- Added a pure JavaScript version that can be used on any page.
- Added Gaussian blur.
- Upcoming version update plan:
  1. Add animation lazy loading mode.
  2. Add more optional parameter settings.

### 0.0.1-beta

- Only the beta version, with incomplete functionality.
- Upcoming version update plan:
  1. Add more progressive loading of thumbnails.
  2. Add a pure JavaScript version.

## 📄 License

Apache-2.0 License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
