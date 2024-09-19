# lazy-picプロジェクト

lazy-picは、画像の遅延読み込みのためのJavaScriptプラグインであり、プロジェクトはまだ開発中です。 現時点では、静的インジェストのみをサポートしており、ネイティブ js と JQuery の 2 つの呼び出しモードを提供します。 遅延読み込みは、実際には段階的な読み込み、つまり、最初にサムネイルが表示され、次に元の画像が徐々に読み込まれます。 プロジェクトの遅延読み込みには、デュアル img タグ、シングル img タグ、~~background image~~ の 3 つのモードがあります。

## すぐに始める

<center>

[[English](./README_EN.md) | [中文](../README.md) | [日本語](./README_JP.md) ]

</center>

### 使い方は?

#### モデル1

1. JSファイルをインポートし、HTMLで直接使用します。
2. HTMLコード構造:

        ```html
        <div style="position:relative">
            <img style="position:absolute;width:100%;transition:opacity 1s" src="image/example.webp" class="load-first">
            <img style="width:100%" src="image/example.jpg" class="load-final" loading="lazy">
        </div>
        ```

    サムネイルは、高速読み込みのために前面に配置する必要があり、元の画像は読み込まれた後に表示されます。 または、`<link rel="preload" href="image/example.jpg" as="image">`を使用することもできます「写真をプリロードします。

3. JQueryコード呼び出し:
    使用する前に、JQueryを導入してからlazy-pic.jsする必要があります。 その後、コードを記述します。

        ```javascript
        $(document).ready(function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
            lazy.lazyLoad();
        });
        ```

4. JS コード呼び出し

        ```javascript
        window.onload = function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "2img", Gaussian: 1 });
            lazy.lazyLoad();;
        }
        ```

5. パラメータの説明

   - `emt` は、遅延読み込みが必要な画像の `id` または `class` 属性であり、元の画像のラベルでなければならず、一意である必要があります。
   - `animeTime` は遅延読み込み中のグラデーションの時間 (ミリ秒単位) で、推奨値は 1000-2000 です。
   - `tagType` は画像の遅延読み込みモードであり、デフォルト値は `2img` で、オプションの値は `2img`、`data-src`、および `bgimg` です。
   - 「Gaussian」は、デフォルトで「1」に有効になっているガウスぼかしを有効にするかどうかを示し、オプションの値は「0」、「1」、「false」、および「true」です。

#### モデル2

1. JSファイルをインポートし、HTMLで直接使用します。

2. HTMLコード構造:

        ```html
            <img style="width:100%" src="image/example.jpg" data-src="image/example.jpg" class="load-final" loading="lazy">
        ```

3. JQueryコード呼び出し:

        ```javascript
        $("head").ready(function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
            lazy.lazyLoad();
        });
        ```

4. JSコード呼び出し:

        ```javascript
        window.onload = function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "data-src"});
            lazy.lazyLoad();
        }
        ```

5.パラメータの説明:
    - `emt` は、遅延読み込みが必要な画像の `id` または `class` 属性であり、一意である必要があります。
    - その他のパラメータはMODEL1と同じです。

#### モデル3です

1. jsファイルを導入して、htmlでそのまま使います。

2. HTMLコードの構造です。

    ```html
        <div class="swiper-slide">
            <div><span></span><span></span><span></span><span></span><span></span></div>
            <img style="width:100%" data-src="image/Miku1.jpg" class="load-final" loading="lazy">
        </div>
    ```

    Web実行ロード時には、アニメーション画像が表示され、設定したアスペクトに応じて優先的に表示されます。

3. JQueryコード呼び出しです:

    ```javascript
        $(document).ready(function () {
            var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
            lazy.lazyLoad();
        }); 
    ```

4. JSコード呼び出しです:

    ```javascript
    window.onload = function () {
        var lazy = new lazyPic({ emt: ".load-final", animeTime: 1200, tagType: "anime",width:"100%", height:"500px"});
        lazy.lazyLoad();
    }
    ```

5.パラメータの説明です:

-`width`と`height`は働画ローディングモードでの働画占位幅です。
-その他のパラメータはMODEL1/MODEL2と一致します。

### 更新日誌です

#### 0.3.0-ベータです

-働画(anime)の怠惰なローディングモードを追加しました。
怠惰なローディングモードを最適化します。
バージョン番号の内容を修正します。
-次の更新予定です:
    1。最適化怠惰なローディング判断ロジック、コードを削減します。
    2.(可能性があります)働画の怠惰なロードモードの既知のバグを修正します。

#### 0.2.1-ベータです

怠惰なローディング判定ロジックによる表示遅延を修正します。

#### 0.2.0-ベータです

-インターネットの速度が遅いことによる怠惰なローディングモードを最適化します。
-オリジナルjsモードのバグを一部修正します。
-次の更新予定です:
    1.アニメーションの怠惰なローディングモードを追加します。
    2。より多くのオプションのパラメータ設定を追加します。

#### 0.1.0-ベータです

- data-src怠惰ローディングモードを追加しました。
-新たにJavaScriptのみのバージョンが追加され、どのページでも利用可能になりました。
ガウスボケを追加します。
-次の更新予定です:
1.アニメーションの怠惰なローディングモードを追加します。
2。より多くのオプションのパラメータ設定を追加します。

#### 0.0.1-ベータです

——テスト版で機能はまだ十分ではありません。
-次の更新予定です:
1.サムネイルの漸進ロードを追加します。
2.純粋なJavaScriptバージョンを追加します。

## 開発者です

[makotoarai—cn](https://github.com/makotoarai-cn)

## 許可します

本プロジェクトはApache2.0ライセンスを使用していますので、倉庫ルートディレクトリの下でご覧ください。

## ありがとうございます

[jQuery](https://jquery.com/)
