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

#### MODEL3

1. Introduce the js file, then use it directly in the HTML code.

2. HTML code structure

     ```html
    <div class="swiper-slide">
        <div><span></span><span></span><span></span><span></span><span></span></div>
        <img style="width:100%" data-src="image/Miku1.jpg" class="load-final" loading="lazy">
    </div>
    ```

    When the web is executed, an animation graph will be displayed, which will be displayed in priority according to the set width and height.

3. JQuery code call:

    ```javascript
    $(document).ready(function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
        lazy.lazyLoad();
    }); 
    ```

4. JS code call

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
        lazy.lazyLoad();
    }
    ```

5. Parameter explanation:

   - `width` and `height` are the animation lazy loading mode animation placeholder width and height.
   - Other parameters are consistent with MODEL1/MODEL2.

### Changelog

#### 0.3.0-beta

- Added animation (anime) lazy loading mode.
- Optimized lazy loading mode.
- Modified version number content.
- Upcoming version update plan:
  1. Optimize lazy loading judgment logic, reduce code.
  2. (Possibly) fix known animation lazy loading mode bug.

#### 0.2.1-beta

- Fixed the delay in displaying caused by the lazy loading judgment logic.

#### 0.2.0-beta

- Optimized the lazy loading mode caused by slow network speed.
- Fixed some bugs in the native JavaScript mode.
- Upcoming version update plan:
  1. Add animation lazy loading mode.
  2. Add more optional parameter settings.

#### 0.1.0-beta

- Added data-src lazy loading mode.
- Added a pure JavaScript version that can be used on any page.
- Added Gaussian blur.
- Upcoming version update plan:
  1. Add animation lazy loading mode.
  2. Add more optional parameter settings.

#### 0.0.1-beta

- Only the beta version, with incomplete functionality.
- Upcoming version update plan:
  1. Add more progressive loading of thumbnails.
  2. Add a pure JavaScript version.

## Developer

[MakotoArai-CN](https://github.com/MakotoArai-CN)

## License

This project uses the Apache2.0 license, which can be found in the root directory of the repository.

## Acknowledgments

[jQuery](https://jquery.com/)
