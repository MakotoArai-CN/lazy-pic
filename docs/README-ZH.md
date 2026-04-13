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

- 🚀 **高性能**: 使用 TypeScript 和现代浏览器 API 优化
- 🎨 **丰富动画**: 6 种动画类型，支持自定义缓动函数
- 📱 **响应式**: 适用于所有设备尺寸
- 🎯 **策略模式**: 三种加载策略适用于不同用例
- 🔧 **灵活配置**: 丰富的自定义选项
- 📦 **零依赖**: 纯 TypeScript 实现
- 🌍 **浏览器支持**: 支持具有 IntersectionObserver 的现代浏览器
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
<script src="https://unpkg.com/@makotoarai/lazy-pic@0.5.0/dist/lazy-pic.umd.js"></script>
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
  animationDuration: 1000
});

lazyPic.init();
```

## 🌐 示例入口

- [示例导航页](../examples/index.html)
- [原生 JavaScript 演示](../examples/vanilla.html)
- [Vue CDN 演示](../examples/vue.html)
- [React CDN 演示](../examples/react.html)
- [Alpine CDN 演示](../examples/alpine.html)

所有浏览器示例都依赖 `dist/lazy-pic.umd.js`，打开前请先执行 `bun run build`。

## 📖 使用示例

### 1. 双图像策略 (推荐)

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
  animationType: 'fade', // fade, slide, scale, zoom, rotate, blur
  animationDuration: 1200,
  easing: 'easeOut' // linear, ease, easeIn, easeOut, easeInOut, bounce, elastic
});
lazyPic.init();
```

### 2. Data-src 策略

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

### 3. 动画策略

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

## ⚙️ 配置

```typescript
interface LazyPicConfig {
  selector: string;                    // 目标元素选择器
  animationDuration?: number;          // 动画持续时间 (毫秒)
  strategy?: 'dual-image' | 'data-src' | 'animation';
  enableBlur?: boolean;                // 启用模糊效果
  blurIntensity?: number;              // 模糊强度 (像素)
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'rotate' | 'blur';
  easing?: 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  rootMargin?: string;                 // IntersectionObserver 根边距
  threshold?: number | number[];       // IntersectionObserver 阈值
  placeholder?: PlaceholderConfig;     // 占位符配置
  quality?: QualityConfig;             // 图像质量优化
  onError?: (error: Error, element: Element) => void;
  onLoad?: (element: Element) => void;
  onStartLoad?: (element: Element) => void;
  onProgress?: (progress: number, element: Element) => void;
}
```

## 🎨 动画类型

- **fade**: 平滑透明度过渡
- **slide**: 从底部滑入并淡出
- **zoom/scale**: 缩放动画与淡出
- **rotate**: 旋转与缩放动画
- **blur**: 模糊到清晰过渡

## 🎭 占位符动画

- **dots**: 弹跳点加载器
- **spinner**: 旋转加载器
- **pulse**: 脉冲圆圈
- **wave**: 波浪条动画
- **skeleton**: 骨架屏效果
- **shimmer**: 闪烁占位符

## 🔧 API 方法

- `init()`: 初始化懒加载
- `destroy()`: 清理并移除观察者
- `updateConfig(config)`: 更新配置
- `loadImage(element)`: 手动触发图像加载
- `refresh()`: 重新扫描并观察新元素
- `getStatus()`: 获取当前状态

## 📈 性能提示

1. 使用 `dual-image` 策略获得最佳用户体验
2. 优化缩略图大小 (< 5KB 推荐)
3. 设置适当的 `rootMargin` 进行预加载
4. 尽可能使用 WebP 格式
5. 为大图像启用渐进式 JPEG

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
```

## 更新日志

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