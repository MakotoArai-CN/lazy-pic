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

> 🖼️ エレガントなプログレッシブ画像ローディングライブラリ（TypeScript対応）

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

## ✨ 特徴

- 🚀 **高性能**: TypeScriptと最新のブラウザAPIで最適化
- 🎨 **豊富なアニメーション**: 6種類のアニメーションタイプ、カスタマイズ可能なイージング関数
- 📱 **レスポンシブ**: すべてのデバイスサイズに最適
- 🎯 **ストラテジーパターン**: 異なるユースケースに対応する3つのロード戦略
- 🔧 **柔軟な設定**: 豊富なカスタマイズオプション
- 📦 **ゼロ依存**: 純粋なTypeScript実装
- 🌍 **ブラウザサポート**: IntersectionObserverをサポートする現代ブラウザ
- ⚡ **最適化されたトランジション**: 滑らかでエレガントなプログレッシブローディング効果

## 📦 インストール

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

### ブラウザ

1. リポジトリをクローン: `git clone https://github.com/MakotoArai-CN/lazy-pic.git` または最新リリースをダウンロード。

1. HTMLに `dist/lazy-pic.umd.js` ファイルを含める:

  ```html
  <script src="path/to/lazy-pic.umd.js"></script>
  ```

1. ブラウザでは UMD グローバルを使って初期化します:

  ```html
  <script>
    const lazyPic = new LazyPic.LazyPic({
      selector: '.lazy-image',
      strategy: 'data-src'
    });
    lazyPic.init();
  </script>
  ```

## 🚀 クイックスタート

### ESモジュール

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

## 🌐 サンプル

- [サンプル一覧](../examples/index.html)
- [Vanilla JavaScript デモ](../examples/vanilla.html)
- [Vue CDN デモ](../examples/vue.html)
- [React CDN デモ](../examples/react.html)
- [Alpine CDN デモ](../examples/alpine.html)

すべてのブラウザ向けサンプルは `dist/lazy-pic.umd.js` を読み込みます。開く前に `bun run build` を実行してください。

## 📖 使用例

### 1. デュアルイメージ戦略 (推奨)

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

### 2. Data-src 戦略

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

### 3. アニメーション戦略

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

## ⚙️ 設定

```typescript
interface LazyPicConfig {
  selector: string;                    // ターゲット要素セレクター
  animationDuration?: number;          // アニメーション時間 (ミリ秒)
  strategy?: 'dual-image' | 'data-src' | 'animation';
  enableBlur?: boolean;                // ぼかし効果を有効化
  blurIntensity?: number;              // ぼかし強度 (ピクセル)
  animationType?: 'fade' | 'slide' | 'zoom' | 'scale' | 'rotate' | 'blur';
  easing?: 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  rootMargin?: string;                 // IntersectionObserver ルートマージン
  threshold?: number | number[];       // IntersectionObserver 閾値
  placeholder?: PlaceholderConfig;     // プレースホルダー設定
  quality?: QualityConfig;             // 画像品質最適化
  onError?: (error: Error, element: Element) => void;
  onLoad?: (element: Element) => void;
  onStartLoad?: (element: Element) => void;
  onProgress?: (progress: number, element: Element) => void;
}
```

## 🎨 アニメーションタイプ

- **fade**: 滑らかな透明度遷移
- **slide**: 下部からスライドインしてフェード
- **zoom/scale**: スケールアニメーションとフェード
- **rotate**: 回転とスケールアニメーション
- **blur**: ぼかしからシャープへの遷移

## 🎭 プレースホルダーアニメーション

- **dots**: バウンスドットローダー
- **spinner**: 回転スピナー
- **pulse**: パルスサークル
- **wave**: ウェーブバーアニメーション
- **skeleton**: スケルトンスクリーン効果
- **shimmer**: シンマープレースホルダー

## 🔧 APIメソッド

- `init()`: 遅延ロードを初期化
- `destroy()`: クリーンアップしてオブザーバーを削除
- `updateConfig(config)`: 設定を更新
- `loadImage(element)`: 手動で画像ロードをトリガー
- `refresh()`: 新しい要素を再スキャンして観察
- `getStatus()`: 現在の状態を取得

## 📈 パフォーマンスヒント

1. 最高のUXのために `dual-image` 戦略を使用
2. サムネイルサイズを最適化 (< 5KB 推奨)
3. プリロードのために適切な `rootMargin` を設定
4. 可能であればWebP形式を使用
5. 大きな画像にプログレッシブJPEGを有効化

## 🔧 ビルドと開発

```bash
# 依存関係をインストール
bun install

# 開発
bun run dev

# ビルド
bun run build

# プレビュー
bun run preview
```

## 変更履歴

### 0.5.0

- ローカル開発コマンドを Bun に統一し、不要な Vitest ラッパーと設定ファイルを削除
- サンプルを Vanilla JavaScript、Vue、React、Alpine の独立した CDN ページへ分割
- ブラウザ / CDN ドキュメントを `dist/lazy-pic.umd.js` と UMD グローバル API に合わせて更新

### 0.4.0-beta

- より良い型チェックとコード品質のためにTypeScriptを使用
- 設定とAPIメソッドの型定義を追加
- プレースホルダーと品質設定の型定義を追加
- 不要な依存関係を削除
- npm、bun、CDNの公開を追加

### 0.3.0-beta

- アニメーション(anime)遅延ロードモードを追加。
- 遅延ロードモードを最適化。
- バージョン番号の内容を変更。
- 今後のバージョン更新予定：
  1. 遅延ロード判定ロジックを最適化し、コードを削減。
  2. (可能性あり)既知のアニメーション遅延ロードモードのバグを修正。

### 0.2.1-beta

- 遅延ロード判定ロジックによる表示遅延を修正。

### 0.2.0-beta

- ネットワーク速度が遅いことによる遅延ロードモードを最適化。
- ネイティブJavaScriptモードの一部のバグを修正。
- 今後のバージョン更新予定：
  1. アニメーション遅延ロードモードを追加。
  2. より多くのオプションパラメータ設定を追加。

### 0.1.0-beta

- data-src遅延ロードモードを追加。
- 任意のページで使用できる純粋なJavaScriptバージョンを追加。
- ガウスぼかしを追加。
- 今後のバージョン更新予定：
  1. サムネイルのプログレッシブロードをさらに追加。
  2. 純粋なJavaScriptバージョンを追加。

### 0.0.1-beta

- ベータ版のみで、機能が不完全。
- 今後のバージョン更新予定：
  1. サムネイルのプログレッシブロードをさらに追加。
  2. 純粋なJavaScriptバージョンを追加。

## 📄 ライセンス

Apache-2.0 ライセンス

## 🤝 コントリビューション

コントリビューションを歓迎します！プルリクエストを気軽に送信してください。