# lazy-pic project

lazy-pic 是用于实现图片懒加载的JavaScript插件，目前还在开发中，欢迎大家提意见。

## 快速开始

### 如何使用？

1. (目前仅支持)直接引入js文件，然后在html中直接使用。
2. HTML代码结构:

```html
    <div style="position:relative">
        <img style="position:absolute;width:100%;transition:opacity 1s" src="image/example.webp" class="load-first">
        <img style="width:100%" src="image/example.jpg" class="load-final" loading="lazy">
    </div>
```

缩略图需要放在最前面以便快速加载，加载完毕之后再显示原图。或者您可以使用`<link rel="preload" href="image/example.jpg" as="image">`预加载图片。
3. JS代码调用：
在使用前你需要先引入JQuery，然后再引入lazy-pic.js。之后写入代码：

```javascript
    $(document).ready(function () {
        var lazy = new lazyPic(".load-final", 600);
        lazy.lazyLoad();
    });
```

参数1为需要懒加载的图片的id或class属性，参数2为懒加载时渐变的时间，单位为毫秒。

### 更新日志

#### 0.0.1-beta

- 仅测试版，功能尚未完善。
- 未来更新计划：
  1. 添加更多缩略图的渐进式加载。
  2. 添加纯JavaScript版本。
  3. 支持node.js。
