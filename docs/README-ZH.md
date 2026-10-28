<div align="center">
<img src="../lazy-pic-logo.png" width="300" height="300" alt="LazyPic Logo" style="border-radius: 50%" />

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

> 🖼️ 优雅的渐进式图像加载库，支持 TypeScript

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

[[English](../README.md) | [中文](./README-ZH.md) | [日本語](./README-JP.md) ]

</p>

## ✨ 特性

- 🚀 **并发加载**: 进入视口的图片同时开始加载，不再排队等待上一张图片的动画结束
- ⚡ **合成器动画**: 过渡基于 Web Animations API，不再逐帧写入 `style` 或解析 `transform`
- 🖼️ **先解码再显示**: 图片预加载并完成解码后才淡入，避免过渡中途掉帧
- 🎨 **优雅过渡**: 9 种过渡类型，默认时长 600ms
- 📱 **响应式**: 适用于所有设备尺寸
- 🎯 **策略模式**: 三种加载策略适用于不同用例
- 🔧 **灵活配置**: 合理默认值（`600ms`、`rootMargin: 200px`、`threshold: 0.01`）
- ♿ **减少动态效果**: 自动遵循 `prefers-reduced-motion`
- 📦 **小体积、零依赖**: UMD 约 34.3KB，gzip 约 8.6KB
- 🌍 **浏览器支持**: 支持 IntersectionObserver 的现代浏览器；不支持时自动回退为全部加载
- ⚡ **优化过渡**: 平滑、优雅的渐进式加载效果

## 📦 安装

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

### 浏览器

1. 克隆仓库: `git clone https://github.com/MakotoArai-CN/lazy-pic.git` 或下载最新版本。

1. 在 HTML 中引入 `dist/lazy-pic.umd.js` 文件:

  ```html
  <script src="path/to/lazy-pic.umd.js"></script>
  ```

1. 在浏览器中使用 UMD 全局对象：

  ```html
  <script>
    const lazyPic = new LazyPic.LazyPic({
      selector: '.lazy-image',
      strategy: 'data-src'
    });
    lazyPic.init();
  </script>
  ```

## 🚀 快速开始

### ES 模块

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

默认值针对“感知速度”调优：图片在进入视口前 200px 就开始加载，过渡时长 600ms，且不会插入任何人为等待。

## 🌐 示例入口

- [示例导航页](../examples/index.html)
- [原生 JavaScript 演示](../examples/vanilla.html)
- [Vue CDN 演示](../examples/vue.html)
- [React CDN 演示](../examples/react.html)
- [Alpine CDN 演示](../examples/alpine.html)

所有浏览器示例都依赖 `dist/lazy-pic.umd.js`，打开前请先执行 `bun run build`。

## 📖 使用示例

### 1. 双图像策略 (推荐)

完整图请使用 `data-src`；如果写成 `src`，浏览器会在 HTML 解析阶段就请求它，LazyPic 无法再推迟。

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
  animationType: 'fade', // fade, slide, scale, zoom, rotate, blur, flip, reveal, spiral
  animationDuration: 600,
  easing: 'ease-out' // linear, ease, ease-in, ease-out, ease-in-out, bounce, elastic
});
lazyPic.init();
```

如果完整图已在缓存中或早于 `init()` 加载完成，LazyPic 会跳过动画直接显示。

### 2. Data-src 策略

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

高清图会先预加载并解码，再由一个绝对定位的覆盖层交叉淡入；覆盖层完全显示后才替换真实 `src`，不会闪烁，也没有第二次网络等待。

### 3. 动画策略

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
    animation: 'skeleton', // 见下方精简后的 loader 列表
    color: '#007bff',
    width: '100%',
    height: '300px',
    showText: true,
    loadingText: 'Loading beautiful image...'
  }
});
lazyPic.init();
```

只有在 100ms 内仍未加载完成时才挂载占位符。缓存命中的图片不会闪一下骨架屏，也不存在强制最短展示时间。

## ⚙️ 配置

```typescript
interface LazyPicConfig {
  selector: string;                    // 目标元素选择器
  animationDuration?: number;          // 过渡时长，默认 600ms，限制在 120–2000ms
  strategy?: 'dual-image' | 'data-src' | 'animation';
  enableBlur?: boolean;                // 低清占位图模糊，默认 true
  blurIntensity?: number;              // 模糊强度（像素，默认 8）
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'rotate' | 'blur' | 'flip' | 'reveal' | 'spiral';
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  rootMargin?: string;                 // IntersectionObserver 根边距，默认 200px
  threshold?: number | number[];       // IntersectionObserver 阈值，默认 0.01
  placeholder?: PlaceholderConfig;     // 占位符配置
  completionEffect?: CompletionEffectConfig; // 可选加载完成效果，默认关闭，且不会阻塞 onLoad
  quality?: QualityConfig;             // 已废弃：运行时暂不生效
  onError?: (error: Error, element: Element) => void;
  onLoad?: (element: Element) => void; // 图片可见后立即触发
  onStartLoad?: (element: Element) => void;
  onProgress?: (progress: number, element: Element) => void; // 已废弃：尚未触发
}
```

> `progressive`、`mosaic`、高级 `performance` 设置和 `loadAll()` 不属于当前运行时 API。
> `placeholder.customContent` 与 `mask.customContent` 的字符串值按纯文本处理，不会作为 HTML 注入。
> 过渡会遵循系统的 `prefers-reduced-motion` 设置。

## 🎨 动画类型

- **fade**: 纯透明度交叉淡入，不做缩放回落
- **slide**: 短距离上滑 + 淡入
- **zoom/scale**: 从 `1.05`/`0.94` 缩放回落
- **rotate**: 轻微旋转 + 缩放
- **blur**: 模糊到清晰
- **flip**: 轻微透视翻转
- **reveal**: 圆形 / 幕帘式 clip-path 揭示
- **spiral**: 带轻微旋转的 clip-path 揭示

过渡由 WAAPI 关键帧驱动（`opacity`、`transform`、`filter`、`clip-path`）。开启“减少动态效果”时会直接跳到最终状态；用户设置过长的时长会被限制在 2 秒内。

## 🎭 占位符动画

当前内置 10 个紧凑的 CSS loader，共用一份样式表，通过 `--lp-color` / `--lp-speed` 自定义属性控制颜色与速度：

`skeleton`、`shimmer`、`spinner`、`dots`、`pulse`、`wave`、`progress-bar`、`grid`、`scanner`、`orbit`。

旧名称仍然可用，并会映射到最接近的 loader：`skeleton-lines` → `skeleton`；`diagonal-shimmer` / `shine` → `shimmer`；`breathing` / `ripple` / `particles` / `pulse-ring` → `pulse`；`typing` / `wave-dots` → `dots`；`arc` → `spinner`；`bars` / `equalizer` / `ladder` / `flow` / `blink` → `wave`；`cube` / `radar` → `orbit`；未知值 → `skeleton`。

推荐的低开销选择：`skeleton`、`shimmer`、`spinner`、`progress-bar`、`dots`。

## 🔧 API 方法

- `init()`: 初始化懒加载
- `destroy()`: 清理、取消进行中的任务并移除观察者
- `updateConfig(config)`: 更新配置并重新扫描
- `loadImage(element)`: 手动触发图像加载
- `refresh()`: 重新扫描并观察新元素
- `getStatus()`: 获取当前状态

## 📈 性能提示

1. 完整图使用 `data-src`，不要用 `src`，否则浏览器会在解析阶段提前请求。
2. 保持 `rootMargin: 200px` 或更大，给预加载留出提前量。
3. 缩略图尽量小于 5KB；不要在大图上做长时间的 `filter` 模糊动画。
4. 除非确实需要，保持 `completionEffect` 关闭。
5. 已有缩略图时用 `dual-image`；单张渐进图用 `data-src`。缩略图建议绝对定位覆盖在全图上，隐藏时不会影响布局。
6. 库会自动遵循 `prefers-reduced-motion`，无需额外配置。
7. 想要最“稳”的完成观感，用 `animationType: 'fade'` + `easing: 'ease-out'`；`bounce` 缓动和 `completionEffect.type: 'bounce'` 本身就会过冲。

## 📦 体积

`bun run build` 实测：UMD 从 51.5KB（gzip 11.1KB）降到约 34.3KB（gzip 约 8.6KB）；ESM 已额外压缩，约 34.0KB（gzip 约 8.4KB）。

## 🔧 构建与开发

```bash
# 安装依赖
bun install

# 开发
bun run dev

# 构建
bun run build

# 预览
bun run preview

# 测试
bun run test
```

## 更新日志

### 0.6.0

- 过渡改为基于 Web Animations API，移除逐帧 `requestAnimationFrame` 样式写入与重复的 transform 字符串解析
- 进入视口的图片并发加载，不再串行等待上一张图片的完整动画
- 图片先预加载并解码，再参与淡入，消除过渡中途的解码卡顿
- 移除硬编码的 800ms 占位符最短展示；改为 100ms 后才挂载占位符，并与图片淡入同步淡出
- `dual-image` 支持 `data-src`，并增加缓存命中/已加载图片的快速路径
- 加载完成效果改为非阻塞，不再拖延 `onLoad`
- 用 10 个紧凑 CSS loader + 兼容别名替换 27 份内联样式 loader
- 修复元素进入加载时 `unobserve` 误触发策略清理的问题
- `destroy()` / `refresh()` 会使旧的异步任务失效，避免竞态
- 支持 `prefers-reduced-motion`，过渡时长限制在 120–2000ms
- 新默认值：`animationDuration: 600`、`rootMargin: 200px`、`threshold: 0.01`
- 压缩 ESM 产物（Vite 库模式会跳过 ES 的 terser），UMD 从 51.5KB 降到约 34.3KB（gzip 11.1KB → 约 8.6KB）
- 修掉两个“加载完成回弹/抖动”来源：流式布局中的缩略图改用 `visibility` 隐藏而不是 `display:none`（不再引起布局跳动）；`data-src` 在清除占位模糊期间锁定 CSS transition，交叉淡入结束后不会再多一段“变清晰”的过渡
- `animationType: 'fade'` 现在是纯透明度交叉淡入；只有显式选择 `zoom`/`scale` 才会有缩放运动
- 新增 Vitest 配置，覆盖并发派发、观察者生命周期、清理与 loader 别名

### 0.5.0

- 统一本地开发命令为 Bun，并移除多余的 Vitest 包装脚本与配置文件
- 将示例拆分为独立的原生 JavaScript、Vue、React 与 Alpine CDN 页面
- 更新浏览器与 CDN 文档，统一使用 `dist/lazy-pic.umd.js` 与 UMD 全局 API

### 0.4.0-beta

- 使用 TypeScript 以获得更好的类型检查和代码质量
- 为配置和 API 方法添加类型定义
- 为占位符和质量配置添加类型定义
- 移除不必要的依赖
- 添加 npm、bun 和 CDN 发布支持

### 0.3.0-beta

- 添加动画 (anime) 懒加载模式。
- 优化懒加载模式。
- 修改版本号内容。
- 即将到来的版本更新计划：
  1. 优化懒加载判断逻辑，减少代码。
  2. (可能)修复已知的动画懒加载模式错误。

### 0.2.1-beta

- 修复由懒加载判断逻辑引起的显示延迟。

### 0.2.0-beta

- 优化由网络速度慢引起的懒加载模式。
- 修复原生 JavaScript 模式中的一些错误。
- 即将到来的版本更新计划：
  1. 添加动画懒加载模式。
  2. 添加更多可选参数设置。

### 0.1.0-beta

- 添加 data-src 懒加载模式。
- 添加可在任何页面上使用的纯 JavaScript 版本。
- 添加高斯模糊。
- 即将到来的版本更新计划：
  1. 添加更多渐进式缩略图加载。
  2. 添加纯 JavaScript 版本。

### 0.0.1-beta

- 仅 beta 版本，功能不完整。
- 即将到来的版本更新计划：
  1. 添加更多渐进式缩略图加载。
  2. 添加纯 JavaScript 版本。

## 📄 许可证

Apache-2.0 许可证

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。