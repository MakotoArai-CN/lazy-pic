# lazy-pic project

lazy-pic is a JavaScript plugin for lazy loading of images, and the project is still under development. At present, it only supports static ingestion and provides two modes of invocation: native js and JQuery. Lazy loading is actually gradual loading, that is, a thumbnail is displayed first, and then the original image is loaded gradually. Project lazy loading includes three modes: dual img tags, single img tags, ~~background image~~.

## Get started quickly

<center>

[[English](./README_EN.md) | [中文](../README.md) | [日本語](./README_JP.md) ]

</center>

### How to use?

#### MODEL1

1. Import JS files and use them directly in HTML.
2. HTML code structure:

    ```html
    <div style="position:relative">
        <img style="position:absolute;width:100%;transition:opacity 1s" src="image/example.webp" class="load-first">
        <img style="width:100%" src="image/example.jpg" class="load-final" loading="lazy">
    </div>
    ```

    The thumbnail needs to be placed at the front for fast loading, and the original image will be displayed after it has been loaded. Or you can use the `<link rel="preload" href="image/example.jpg" as="image">`Preload the picture.

3. JQuery Code Call:
    Before you can use it, you need to introduce JQuery and then lazy-pic.js. After that, write the code:

    ```javascript
    $(document).ready(function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
        lazy.lazyLoad();
    });
    ```

4. JS code calls

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
        lazy.lazyLoad();;
    }
    ```

5. Parameter description

   - `emt` is the `id` or `class` attribute of the image that needs to be lazy loaded, and must be the label of the original image, which must be unique.
   - `animeTime` is the time of the gradient during lazy loading, in milliseconds, and the recommended value is 1000-2000.
   - `tagType` is the lazy loading mode of the image, the default value is `2img`, and the optional values are `2img`, `data-src`, and `bgimg`.
   - `Gaussian` indicates whether to enable Gaussian blur, which is enabled by default to `1`, and the optional values are `0`, `1`, `false`, and `true`.

#### MODEL2

1. Import JS files and use them directly in HTML.

2. HTML code structure:

    ```html
    <img style="width:100%" src="image/example.jpg" data-src="image/example.jpg" class="load-final" loading="lazy">
    ```

3. JQuery Code Call:

    ```javascript
    $("head").ready(function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
        lazy.lazyLoad();
    });
    ```

4. JS code call:

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
        lazy.lazyLoad();
    }
    ```

5. Parameter description:
    - `emt` is the `id` or `class` attribute of the image that needs to be lazy loaded, and it needs to be unique.
    - Other parameters are the same as those of MODEL1.

### Changelog

#### 0.0.2-beta

- Added lazy loading mode for data-src.
- Added a pure JavaScript version, which can be used on any page.
- Gaussian blur added.
- The following version update is planned:
    1. Add a lazy loading mode for backgrounds.
    2. Added more optional parameter settings.

#### 0.0.1-beta

- Beta only, features not yet perfect.
- The following version update is planned:
  1. Progressive loading to add more thumbnails.
  2. Add a pure JavaScript version.