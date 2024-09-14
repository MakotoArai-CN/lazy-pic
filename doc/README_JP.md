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
   - `tagType` は画像の遅延読み込みモードであり、デフォルト値は `2img` で、オプションの値は `2img`、`1img`、および `bgimg` です。
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

### 変更履歴

#### 0.0.2-ベータ

- data-src の遅延読み込みモードを追加しました。
- どのページでも使用できる純粋なJavaScriptバージョンを追加しました。
- ガウスぼかしを追加しました。
- 以下のバージョンアップを予定しています。
    1.背景の遅延読み込みモードを追加します。
    2.オプションのパラメータ設定を追加しました。

#### 0.0.1-ベータ

- ベータ版のみ、機能はまだ完璧ではありません。
- 以下のバージョンアップを予定しています。
  1.サムネイルを追加するためのプログレッシブロード。
  2. 純粋な JavaScript バージョンを追加します。
