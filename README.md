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

- 🚀 **High Performance**: Optimized with TypeScript and modern browser APIs
- 🎨 **Rich Animations**: 6 animation types with customizable easing functions
- 📱 **Responsive**: Perfect for all device sizes
- 🎯 **Strategy Pattern**: Three loading strategies for different use cases
- 🔧 **Flexible Configuration**: Extensive customization options
- 📦 **Zero Dependencies**: Pure TypeScript implementation
- 🌍 **Browser Support**: Modern browsers with IntersectionObserver support
- ⚡ **Optimized Transitions**: Smooth, elegant progressive loading effects

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
<script src="https://unpkg.com/@makotoarai/lazy-pic@0.5.0/dist/lazy-pic.umd.js"></script>
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
  animationDuration: 1000
});

lazyPic.init();
```

## 🌐 Examples

- [Examples Hub](examples/index.html)
- [Vanilla Demo](examples/vanilla.html)
- [Vue CDN Demo](examples/vue.html)
- [React CDN Demo](examples/react.html)
- [Alpine CDN Demo](examples/alpine.html)

All browser examples load `dist/lazy-pic.umd.js`. Build the library with `bun run build` before opening them.

## 📖 Usage Examples

### 1. Dual Image Strategy (Recommended)

```html
<div style="position: relative">
  <img src="thumbnail.jpg" class="thumbnail" style="position: absolute; width: 100%;">
  <img src="full-image.jpg" class="main-image">
</div>
```

```javascript
const lazyPic = new LazyPic({
  selector: '.main-image',
  strategy: 'dual-image',
  animationType: 'fade', // fade, slide, scale, zoom, blur, flip, reveal
  animationDuration: 1200,
  easing: 'ease-out', // linear, ease, ease-in, ease-out, ease-in-out, bounce, elastic
  completionEffect: { enabled: false }
});
lazyPic.init();
```

### 2. Data-src Strategy

```html
<img src="thumbnail.jpg" data-src="full-image.jpg" class="lazy-image">
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

### 3. Animation Strategy

```html
<div>
  <img data-src="image.jpg" class="animated-image">
</div>
```

```javascript
const lazyPic = new LazyPic({
  selector: '.animated-image',
  strategy: 'animation',
  placeholder: {
    animation: 'skeleton', // dots, spinner, pulse, wave, skeleton, shimmer
    color: '#007bff',
    width: '100%',
    height: '300px',
    showText: true,
    loadingText: 'Loading beautiful image...'
  }
});
lazyPic.init();
```

## ⚙️ Configuration

```typescript
interface LazyPicConfig {
  selector: string;                    // Target element selector
  animationDuration?: number;          // Animation duration (ms)
  strategy?: 'dual-image' | 'data-src' | 'animation';
  enableBlur?: boolean;                // Enable blur effect
  blurIntensity?: number;              // Blur strength (px)
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'rotate' | 'blur' | 'flip' | 'reveal' | 'spiral';
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  rootMargin?: string;                 // IntersectionObserver root margin
  threshold?: number | number[];       // IntersectionObserver threshold
  placeholder?: PlaceholderConfig;     // Placeholder configuration
  completionEffect?: CompletionEffectConfig; // Optional post-load effect (disabled by default when omitted)
  quality?: QualityConfig;             // Deprecated: currently not applied at runtime
  onError?: (error: Error, element: Element) => void;
  onLoad?: (element: Element) => void;
  onStartLoad?: (element: Element) => void;
  onProgress?: (progress: number, element: Element) => void; // Deprecated: not emitted yet
}
```

> Note: `progressive`, `mosaic`, advanced `performance` settings, and `loadAll()` are not part of the current runtime API.
> For safety, `placeholder.customContent` and `mask.customContent` treat string values as plain text instead of HTML.
> The built-in `.lazy-pic-loaded` class no longer adds a flash/pulse automatically. Use `completionEffect` when you want an explicit post-load flourish.

## 🎨 Animation Types

- **fade**: Smooth opacity transition
- **slide**: Slide in from bottom with fade
- **zoom/scale**: Scale animation with fade
- **rotate**: Rotation with scale animation
- **blur**: Blur to sharp transition

## 🎭 Placeholder Animations

- **dots**: Bouncing dots loader
- **spinner**: Rotating spinner
- **pulse**: Pulsing circles
- **wave**: Wave bars animation
- **skeleton**: Skeleton screen effect
- **shimmer**: Shimmering placeholder
- **progress-bar**: Sliding progress bar
- **skeleton-lines**: Multi-line skeleton text
- **diagonal-shimmer**: Diagonal shimmer sweep
- **orbit**: Orbiting rings around a core
- **grid**: Animated grid blocks
- **typing**: Typing indicator style loader
- **bars / equalizer**: Vertical audio-style bars
- **arc**: Minimal circular arc spinner
- **wave-dots**: Dots moving in a wave
- **scanner**: Vertical scanner pass
- **radar**: Radar sweep effect
- **shine**: Horizontal shine sweep
- **pulse-ring**: Expanding ring pulses
- **cube**: Rotating cube stack
- **blink**: Blink/eye style indicator
- **ladder / flow**: Step and flow motion placeholders

Example animation-only config:

```javascript
const lazyPic = new LazyPic({
  selector: '.animated-image',
  strategy: 'animation',
  placeholder: {
    animation: 'radar',
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
> Recommended defaults for a more elegant loading experience: `completionEffect.enabled: false` with `placeholder.animation: 'skeleton'`, `shimmer`, `progress-bar`, or `radar`.

## 🎯 High-level differentiation

Compared with basic progressive image loaders, LazyPic now differentiates itself through:

- richer placeholder animation vocabulary,
- optional completion effects instead of mandatory flash,
- multiple progressive image strategies in one library,
- safer custom placeholder/mask rendering defaults.

These changes keep the default experience elegant while still allowing more expressive loading states when explicitly configured.

## 🔧 API Methods

- `init()`: Initialize lazy loading
- `destroy()`: Clean up and remove observers
- `updateConfig(config)`: Update configuration
- `loadImage(element)`: Manually trigger image loading
- `refresh()`: Re-scan and observe new elements
- `getStatus()`: Get current status

## 📈 Performance Tips

- Prefer `skeleton`, `shimmer`, `progress-bar`, `grid`, or `typing` for the lowest overhead placeholder animations.
- Use `orbit`, `radar`, `cube`, or `particles` more selectively on hero media or demos.
- Keep `completionEffect.enabled` off unless you want a deliberate post-load flourish.
- Use `dual-image` strategy for best UX when you already have thumbnails.
- Optimize thumbnail sizes (< 5KB recommended) and set an appropriate `rootMargin` for preloading.

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
```

## Changelog

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
