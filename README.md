# lazy-pic project

lazy-pic 是用于实现图片懒加载的JavaScript插件，项目还在开发中，欢迎大家提意见。目前仅支持静态引入的方式加载，提供2种模式调用：原生js，JQuery。懒加载其实就是渐进式加载，即先显示一个缩略图，再逐步加载原图。项目懒加载包括三种模式：**双img标签（推荐）**，单img标签，动画图。三种加载方式均支持动画渐进显示原图。

## 快速开始

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

[[English](./doc/README_EN.md) | [中文](./README.md) | [日本語](./doc/README_JP.md) ]

</p>

### 如何使用？

#### MODEL1（推荐）

1. 引入js文件，然后在html中直接使用。
2. HTML代码结构:

    ```html
    <div style="position:relative">
        <img style="position:absolute;width:100%;transition:opacity 1s" src="image/example.webp" class="load-first">
        <img style="width:100%" src="image/example.jpg" class="load-final" loading="lazy">
    </div>
    ```

    缩略图需要放在最前面以便快速加载，加载完毕之后再显示原图。或者您可以使用`<link rel="preload" href="image/example.jpg" as="image">`预加载图片。

3. JQuery代码调用：
    在使用前你需要先引入JQuery，然后再引入lazy-pic.js。之后写入代码：

    ```javascript
    $(document).ready(function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
        lazy.lazyLoad();
    });
    ```

4. JS代码调用

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
        lazy.lazyLoad();;
    }
    ```

5. 参数说明

   - `emt`为需要懒加载的图片的`id`或`class`属性，必须为原图标签，需要具有唯一性。
   - `animeTime`为懒加载时渐变的时间，单位为毫秒，建议数值1000-2000。
   - `tagType`为图片懒加载的模式，默认为`2img`，可选值为`2img`、`data-src`、`bgimg`。
   - `Gaussian`为是否启用高斯模糊，默认为`1`启用，可选值为`0`、`1`、`false`、`true`。

#### MODEL2

1. 引入js文件，然后在html中直接使用。

2. HTML代码结构：

    ```html
    <img style="width:100%" src="image/example.jpg" data-src="image/example.jpg" class="load-final" loading="lazy">
    ```

3. JQuery代码调用：

    ```javascript
    $("head").ready(function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
        lazy.lazyLoad();
    });
    ```

4. JS代码调用：

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
        lazy.lazyLoad();
    }
    ```

5. 参数说明：
    - `emt`为需要懒加载的图片的`id`或`class`属性，需要具有唯一性。
    - 其他参数与MODEL1一致。

#### MODEL3

1. 引入js文件，然后在html中直接使用。

2. HTML代码结构：

    ```html
    <div class="swiper-slide">
        <div><span></span><span></span><span></span><span></span><span></span></div>
        <img style="width:100%" data-src="image/Miku1.jpg" class="load-final" loading="lazy">
    </div>
    ```

    Web执行加载时，会显示一个动画图，根据设定的的宽高优先显示。

3. JQuery代码调用：

    ```javascript
        $(document).ready(function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
            lazy.lazyLoad();
        });
    ```

4. JS代码调用：

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
        lazy.lazyLoad();
    }
    ```

5. 参数说明：

    -`width`和`height`是动画懒加载模式下的动画占位宽高。
    - 其他参数与MODEL1/MODEL2一致。

### 更新日志

#### 0.3.0-beta

- 新增动画（anime）懒加载模式。
- 优化懒加载模式。
- 修改版本号内容。
- 下版本更新计划：
    1. 优化懒加载判断逻辑，缩减代码。
    2. （可能）修复已知动画懒加载模式bug。

#### 0.2.1-beta

- 修复懒加载判断逻辑导致的显示延迟。

#### 0.2.0-beta

- 优化网速过慢导致的懒加载模式。
- 修复原生js模式的部分BUG。
- 下版本更新计划：
    1. 添加动画懒加载模式。
    2. 新增更多可选参数设置。

#### 0.1.0-beta

- 新增data-src懒加载模式。
- 新增纯JavaScript版本，在任意页面都可以使用。
- 新增高斯模糊。
- 下版本更新计划：
    1. 添加动画懒加载模式。
    2. 新增更多可选参数设置。

#### 0.0.1-beta

- 仅测试版，功能尚未完善。
- 下版本更新计划：
  1. 添加更多缩略图的渐进式加载。
  2. 添加纯JavaScript版本。

## 开发者

[MakotoArai-CN](https://github.com/MakotoArai-CN)

## 许可

本项目使用 Apache2.0 许可证，请在仓库根目录下查看。

## 致谢

[jQuery](https://jquery.com/)