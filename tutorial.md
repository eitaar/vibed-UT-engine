# PixiJS v8 チュートリアル

PixiJS v8 は WebGL / WebGPU ベースの高速 2D レンダリングライブラリ。
このチュートリアルでは基礎から実践的な使い方までを順に解説する。

---

## 目次

1. [セットアップ](#1-セットアップ)
2. [Application — 基本構造](#2-application--基本構造)
3. [Sprite — 画像の表示](#3-sprite--画像の表示)
4. [Assets — アセットの読み込み](#4-assets--アセットの読み込み)
5. [Container — 親子関係とグループ化](#5-container--親子関係とグループ化)
6. [トランスフォーム — 位置・回転・スケール](#6-トランスフォーム--位置回転スケール)
7. [Graphics — 図形の描画](#7-graphics--図形の描画)
8. [Text — テキスト表示](#8-text--テキスト表示)
9. [Ticker — ゲームループ](#9-ticker--ゲームループ)
10. [Events — インタラクション](#10-events--インタラクション)
11. [Spritesheet と AnimatedSprite](#11-spritesheet-と-animatedsprite)
12. [TilingSprite — タイリング背景](#12-tilingsprite--タイリング背景)
13. [Mask — マスク](#13-mask--マスク)
14. [Filters — フィルター](#14-filters--フィルター)
15. [パフォーマンスTips](#15-パフォーマンスtips)

---

## 1. セットアップ

### インストール

```bash
npm create vite@latest my-game -- --template vanilla-ts
cd my-game
npm install pixi.js
```

### HTML

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
  </style>
</head>
<body>
  <canvas id="pixi-canvas"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## 2. Application — 基本構造

`Application` は PixiJS の中心。レンダラー、ステージ、Ticker をまとめて管理する。

```ts
import { Application } from "pixi.js";

const app = new Application();

await app.init({
  background: "#1a1a2e",
  width: 800,
  height: 600,
  // または既存の canvas を指定:
  // canvas: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  // ウィンドウリサイズに追従:
  // resizeTo: window,
});

document.body.appendChild(app.canvas);
```

### 主要プロパティ

| プロパティ | 説明 |
|---|---|
| `app.stage` | ルートの `Container`。すべての表示物をここに追加する |
| `app.canvas` | 描画先の `<canvas>` 要素 |
| `app.screen` | `{ width, height }` — 画面サイズ |
| `app.ticker` | ゲームループを司る `Ticker` |
| `app.renderer` | WebGL/WebGPU レンダラー |

---

## 3. Sprite — 画像の表示

`Sprite` は最も基本的な表示オブジェクト。テクスチャ（画像）を画面に描画する。

```ts
import { Sprite, Assets } from "pixi.js";

// テクスチャの読み込み
const texture = await Assets.load("hero.png");

// Sprite 作成
const hero = new Sprite(texture);

// ショートハンド（内部で Assets.load が呼ばれる）
const hero2 = Sprite.from("hero.png");

// anchor: 原点の設定（0〜1）
// (0.5, 0.5) にすると中心が原点になる
hero.anchor.set(0.5);

// 位置
hero.x = 400;
hero.y = 300;

// ステージに追加
app.stage.addChild(hero);
```

### anchor vs pivot

- **anchor** — テクスチャの原点を `0〜1` の割合で指定（Sprite 専用）
- **pivot** — ピクセル値で原点を指定（すべての Container で使える）

```ts
// anchor: テクスチャの中心を原点にする
sprite.anchor.set(0.5, 0.5);

// pivot: テクスチャの (32, 32) ピクセル目を原点にする
sprite.pivot.set(32, 32);
```

---

## 4. Assets — アセットの読み込み

v8 では `Assets` クラスで統一的にアセットを管理する。
同じリソースを複数回 `load` しても重複ダウンロードは起きない（キャッシュされる）。

### 基本的な読み込み

```ts
import { Assets } from "pixi.js";

// 単体
const texture = await Assets.load("images/hero.png");

// 複数同時
const textures = await Assets.load(["hero.png", "enemy.png", "bg.png"]);
// textures["hero.png"], textures["enemy.png"] でアクセス
```

### エイリアス

```ts
await Assets.load({ alias: "hero", src: "images/hero_v2.png" });
const tex = Assets.get("hero"); // エイリアスで取得
```

### バンドル（グループ読み込み）

シーンごとにアセットをグループ化して管理できる。

```ts
Assets.addBundle("title-screen", [
  { alias: "logo", src: "title/logo.png" },
  { alias: "bg", src: "title/background.png" },
]);

Assets.addBundle("game", [
  { alias: "player", src: "game/player.png" },
  { alias: "enemies", src: "game/enemies.json" },
]);

// タイトル画面のアセットだけ読み込み
const titleAssets = await Assets.loadBundle("title-screen");
```

### バックグラウンド読み込み

ローディング画面を表示しつつ、裏でゲームアセットを先読みできる。

```ts
// まずローディング画面のアセットを読み込む
await Assets.loadBundle("loading-screen");

// ゲームアセットをバックグラウンドで読み込み開始
Assets.backgroundLoadBundle("game");

// ... ローディング画面を表示 ...

// 必要になったらバンドルを取得（既に読み込み済みならすぐ返る）
const gameAssets = await Assets.loadBundle("game");
```

### 対応フォーマット

| 種類 | 形式 |
|---|---|
| 画像 | PNG, JPG, GIF, WebP, AVIF, SVG |
| 動画 | MP4, WebM, OGG |
| スプライトシート | JSON (TexturePacker 等) |
| フォント | TTF, WOFF, WOFF2 |
| データ | JSON, TXT |

### 解放

不要になったアセットはメモリを解放できる。

```ts
await Assets.unload("hero.png");
```

---

## 5. Container — 親子関係とグループ化

`Container` は表示オブジェクトのグループ。子の追加・削除、まとめての移動や表示切り替えに使う。

```ts
import { Container, Sprite } from "pixi.js";

// グループを作成
const ui = new Container();

const hpBar = Sprite.from("hp-bar.png");
const avatar = Sprite.from("avatar.png");

// 子の追加
ui.addChild(hpBar);
ui.addChild(avatar);
// まとめて追加も可能
// ui.addChild(hpBar, avatar);

app.stage.addChild(ui);

// グループごと移動
ui.x = 10;
ui.y = 10;

// グループごと非表示
ui.visible = false;
```

### 子の操作

```ts
// 子の削除
ui.removeChild(avatar);

// 全ての子を削除
ui.removeChildren();

// 親子関係の確認
console.log(hpBar.parent === ui); // true
console.log(ui.children.length);  // 子の数
```

### zIndex（描画順）

```ts
const container = new Container();
container.sortableChildren = true; // zIndex ソートを有効化

const back = Sprite.from("back.png");
back.zIndex = 0;

const front = Sprite.from("front.png");
front.zIndex = 10;

container.addChild(back, front);
// front が手前に描画される
```

---

## 6. トランスフォーム — 位置・回転・スケール

すべての Container（Sprite, Graphics, Text 等）は以下のトランスフォームを持つ。

```ts
const sprite = Sprite.from("hero.png");

// --- 位置 ---
sprite.x = 100;
sprite.y = 200;
sprite.position.set(100, 200); // まとめて設定

// --- スケール ---
sprite.scale.set(2); // 2倍に拡大
sprite.scale.set(2, 1.5); // x: 2倍, y: 1.5倍

// --- 回転 ---
sprite.rotation = Math.PI / 4; // ラジアン（45度）
sprite.angle = 45;             // 度数法でも指定可能

// --- 傾き ---
sprite.skew.set(0.5, 0);

// --- 透明度 ---
sprite.alpha = 0.5; // 半透明（0〜1）

// --- 色味の変更 ---
sprite.tint = 0xff0000;  // 赤く染める
sprite.tint = "#ff0000"; // 文字列でもOK

// --- ブレンドモード ---
sprite.blendMode = "add"; // 加算合成
```

### 幅・高さの取得

```ts
// サイズ取得
console.log(sprite.width, sprite.height);

// バウンディングボックス
const bounds = sprite.getBounds();
console.log(bounds.x, bounds.y, bounds.width, bounds.height);

// ローカル座標系のバウンディング
const local = sprite.getLocalBounds();
```

---

## 7. Graphics — 図形の描画

テクスチャなしで図形を描画できる。UI、デバッグ表示、シンプルなゲームオブジェクトに便利。

```ts
import { Graphics } from "pixi.js";

const g = new Graphics();
```

### 基本図形

```ts
// 矩形
g.rect(0, 0, 200, 100);
g.fill(0x3498db);

// 角丸矩形
g.roundRect(0, 120, 200, 100, 15);
g.fill(0x2ecc71);

// 円
g.circle(300, 50, 40);
g.fill(0xe74c3c);

// 楕円
g.ellipse(300, 180, 60, 30);
g.fill(0xf39c12);

// 多角形（星など）
g.poly([400, 0, 450, 80, 380, 30, 420, 30, 350, 80]);
g.fill(0x9b59b6);
```

### 線

```ts
// ストローク（線）
g.rect(0, 250, 200, 100);
g.stroke({ width: 3, color: 0xffffff });

// 塗り＋線
g.circle(300, 300, 40);
g.fill(0x1abc9c);
g.stroke({ width: 2, color: 0xffffff });
```

### パス（自由線）

```ts
g.moveTo(500, 0);
g.lineTo(600, 50);
g.lineTo(550, 100);
g.lineTo(500, 50);
g.closePath();
g.fill(0xff6b6b);
g.stroke({ width: 2, color: 0xffffff });
```

### 再描画

動的に形を変えたい場合は `clear()` してから描き直す。

```ts
function drawHpBar(current: number, max: number) {
  g.clear();
  // 背景
  g.rect(0, 0, 200, 20);
  g.fill(0x333333);
  // ゲージ
  g.rect(0, 0, 200 * (current / max), 20);
  g.fill(0x00ff00);
}
```

---

## 8. Text — テキスト表示

### Canvas Text（通常テキスト）

リッチなスタイリングが可能。動的に内容が変わるテキスト向き。

```ts
import { Text } from "pixi.js";

const text = new Text({
  text: "Hello PixiJS!",
  style: {
    fontFamily: "Arial",
    fontSize: 32,
    fill: "#ffffff",
  },
});

text.x = 50;
text.y = 50;
app.stage.addChild(text);
```

### スタイルの詳細

```ts
const styledText = new Text({
  text: "Styled Text",
  style: {
    fontFamily: "Arial",
    fontSize: 48,
    fill: "#ffffff",
    // 縁取り
    stroke: { color: "#000000", width: 4 },
    // ドロップシャドウ
    dropShadow: {
      color: "#000000",
      blur: 4,
      distance: 6,
      angle: Math.PI / 6,
    },
    // 文字揃え
    align: "center",
    // 折り返し
    wordWrap: true,
    wordWrapWidth: 300,
  },
});
```

### テキストの更新

```ts
// 内容の変更
text.text = "新しいテキスト";

// スタイルの変更
text.style.fill = "#ff0000";
text.style.fontSize = 24;
```

### BitmapText（高パフォーマンステキスト）

大量のテキストや頻繁に変わるテキスト（スコア表示等）には BitmapText が高速。

```ts
import { BitmapFont, BitmapText } from "pixi.js";

// フォントの登録
BitmapFont.install({
  name: "GameFont",
  style: {
    fontFamily: "Arial",
    fontSize: 32,
    fill: "#ffffff",
  },
});

// BitmapText の作成
const score = new BitmapText({
  text: "Score: 0",
  style: {
    fontFamily: "GameFont",
    fontSize: 32,
  },
});
```

---

## 9. Ticker — ゲームループ

`Ticker` は毎フレーム呼ばれるコールバックを管理する。ゲームの更新処理はここに書く。

### 基本

```ts
app.ticker.add((ticker) => {
  // ticker.deltaTime: 前フレームからの経過（60FPSなら約1.0）
  sprite.x += speed * ticker.deltaTime;
});
```

### deltaTime を使う理由

フレームレートが変動しても一定の速度で動くようにするため。

```ts
// ❌ FPSによって速度が変わる
sprite.x += 5;

// ✅ FPSに依存しない（フレーム落ちしても同じ速度）
sprite.x += 5 * ticker.deltaTime;
```

### Ticker のプロパティ

```ts
console.log(app.ticker.FPS);       // 現在のFPS
console.log(app.ticker.deltaTime); // スケーリング済みの経過時間
console.log(app.ticker.deltaMS);   // ミリ秒での経過時間
console.log(app.ticker.elapsedMS); // 最後の更新にかかった時間
```

### フレームレート制限

```ts
app.ticker.maxFPS = 60;  // 60FPS上限
app.ticker.maxFPS = 30;  // 30FPS上限
app.ticker.maxFPS = 0;   // 制限なし
```

### スピード制御

```ts
app.ticker.speed = 0.5; // スローモーション
app.ticker.speed = 2.0; // 倍速
```

### 1回だけ実行

```ts
app.ticker.addOnce(() => {
  console.log("1フレームだけ実行");
});
```

### コールバックの削除

```ts
const update = (ticker) => {
  sprite.rotation += 0.1 * ticker.deltaTime;
};

app.ticker.add(update);

// 後で削除
app.ticker.remove(update);
```

### 一時停止・再開

```ts
app.stop();  // 描画も更新も停止
app.start(); // 再開
```

---

## 10. Events — インタラクション

PixiJS v8 はポインターイベントベースのインタラクションシステムを持つ。

### eventMode

イベントを受け取るには `eventMode` を設定する必要がある。

| モード | 説明 |
|---|---|
| `"none"` | イベントを完全に無視（最も軽い） |
| `"passive"` | 自身はイベントを出さないが、子のイベントは通す（デフォルト） |
| `"auto"` | 親が interactive なら自身もヒットテストに参加 |
| `"static"` | イベントを発火し、ヒットテストに参加する（ボタン等に使う） |
| `"dynamic"` | static と同じ＋ポインターが動いていなくてもイベントを受け取る（移動するオブジェクト向け） |

### 基本的な使い方

```ts
const button = Sprite.from("button.png");
button.eventMode = "static";
button.cursor = "pointer"; // マウスカーソルを指マークに

button.on("pointerdown", () => {
  console.log("押された！");
});

button.on("pointerup", () => {
  console.log("離された！");
});

button.on("pointerover", () => {
  button.tint = 0xaaaaff; // ホバー時に色を変える
});

button.on("pointerout", () => {
  button.tint = 0xffffff; // 元に戻す
});
```

### イベント一覧

**ポインター系（推奨 — マウス・タッチ両対応）**

| イベント | タイミング |
|---|---|
| `pointerdown` | 押した瞬間 |
| `pointerup` | 離した瞬間 |
| `pointerupoutside` | オブジェクト外で離した |
| `pointermove` | オブジェクト上でポインターが動いた |
| `pointerover` | ポインターが乗った |
| `pointerout` | ポインターが離れた |
| `pointertap` | 素早くタップ/クリック |
| `globalpointermove` | 画面上どこでもポインター移動を検知 |

**マウス専用**

`mousedown`, `mouseup`, `mousemove`, `mouseover`, `mouseout`, `click`, `rightclick`, `wheel`

**タッチ専用**

`touchstart`, `touchmove`, `touchend`, `touchendoutside`, `tap`

### ドラッグ＆ドロップ

```ts
const draggable = Sprite.from("box.png");
draggable.eventMode = "static";
draggable.cursor = "grab";

let dragging = false;

draggable.on("pointerdown", () => {
  dragging = true;
  draggable.cursor = "grabbing";
  draggable.alpha = 0.7;
});

draggable.on("globalpointermove", (event) => {
  if (dragging) {
    draggable.x = event.global.x - draggable.width / 2;
    draggable.y = event.global.y - draggable.height / 2;
  }
});

draggable.on("pointerup", () => {
  dragging = false;
  draggable.cursor = "grab";
  draggable.alpha = 1;
});

draggable.on("pointerupoutside", () => {
  dragging = false;
  draggable.cursor = "grab";
  draggable.alpha = 1;
});
```

### カスタムヒットエリア

```ts
import { Rectangle, Circle } from "pixi.js";

// 矩形のヒットエリア
sprite.hitArea = new Rectangle(0, 0, 100, 50);

// 円形のヒットエリア
sprite.hitArea = new Circle(50, 50, 30);
```

---

## 11. Spritesheet と AnimatedSprite

### Spritesheet の JSON 形式

TexturePacker などのツールで生成する。手動で書くことも可能。

```json
{
  "frames": {
    "walk_01.png": {
      "frame": { "x": 0, "y": 0, "w": 64, "h": 64 },
      "sourceSize": { "w": 64, "h": 64 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 64 }
    },
    "walk_02.png": {
      "frame": { "x": 64, "y": 0, "w": 64, "h": 64 },
      "sourceSize": { "w": 64, "h": 64 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 64 }
    },
    "walk_03.png": {
      "frame": { "x": 128, "y": 0, "w": 64, "h": 64 },
      "sourceSize": { "w": 64, "h": 64 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 64, "h": 64 }
    }
  },
  "animations": {
    "walk": ["walk_01.png", "walk_02.png", "walk_03.png"]
  },
  "meta": {
    "image": "spritesheet.png",
    "size": { "w": 192, "h": 64 },
    "scale": "1"
  }
}
```

### 読み込みと使用

```ts
import { Assets, Sprite, AnimatedSprite } from "pixi.js";

// Spritesheet の読み込み（JSON + 画像が自動で処理される）
const sheet = await Assets.load("spritesheet.json");

// 単体フレームを Sprite として使う
const hero = new Sprite(sheet.textures["walk_01.png"]);

// アニメーションとして使う
const walkAnim = new AnimatedSprite(sheet.animations["walk"]);
walkAnim.animationSpeed = 0.15; // フレームの進む速さ
walkAnim.loop = true;           // ループ再生
walkAnim.play();

app.stage.addChild(walkAnim);
```

### AnimatedSprite の制御

```ts
walkAnim.play();             // 再生
walkAnim.stop();             // 停止
walkAnim.gotoAndPlay(0);     // 指定フレームから再生
walkAnim.gotoAndStop(2);     // 指定フレームで停止

walkAnim.animationSpeed = 0.1;       // 速度
walkAnim.loop = false;               // ループしない
walkAnim.onComplete = () => {        // 再生完了コールバック
  console.log("アニメーション完了");
};
walkAnim.onFrameChange = (frame) => { // フレーム変更コールバック
  console.log("現在のフレーム:", frame);
};
```

### 手動で Spritesheet を作成

```ts
import { Spritesheet, Assets } from "pixi.js";

const texture = await Assets.load("atlas.png");
const sheet = new Spritesheet(texture, spritesheetData);
await sheet.parse();

const frame = new Sprite(sheet.textures["hero.png"]);
```

---

## 12. TilingSprite — タイリング背景

テクスチャを繰り返し敷き詰める。横スクロール背景等に最適。

```ts
import { TilingSprite, Texture } from "pixi.js";

const bg = new TilingSprite({
  texture: Texture.from("bg-pattern.png"),
  width: app.screen.width,
  height: app.screen.height,
});

app.stage.addChild(bg);
```

### スクロールアニメーション

```ts
app.ticker.add((ticker) => {
  // 背景を横にスクロール
  bg.tilePosition.x -= 2 * ticker.deltaTime;
});
```

### タイルのスケール

```ts
// テクスチャの繰り返しサイズを変更
bg.tileScale.set(0.5); // 小さくして密に繰り返す
bg.tileScale.set(2);   // 大きくして粗く繰り返す
```

### パララックス（視差スクロール）

```ts
const farBg = new TilingSprite({
  texture: Texture.from("far.png"),
  width: 800,
  height: 600,
});
const nearBg = new TilingSprite({
  texture: Texture.from("near.png"),
  width: 800,
  height: 600,
});

app.stage.addChild(farBg, nearBg);

app.ticker.add((ticker) => {
  // 遠景はゆっくり、近景は速く
  farBg.tilePosition.x -= 0.5 * ticker.deltaTime;
  nearBg.tilePosition.x -= 2 * ticker.deltaTime;
});
```

---

## 13. Mask — マスク

マスクを使うと、表示物の見える範囲を制限できる。

### Graphics マスク

ステンシルバッファを使うため高速。

```ts
import { Graphics, Sprite } from "pixi.js";

// マスク形状を定義
const mask = new Graphics();
mask.circle(200, 200, 100);
mask.fill(0xffffff);

// マスクを適用
const photo = Sprite.from("photo.png");
photo.mask = mask;

app.stage.addChild(photo, mask);
```

### Sprite マスク

画像の明暗でマスクする。グラデーションマスク等に使える。

```ts
const gradientMask = Sprite.from("gradient-circle.png");
gradientMask.x = 200;
gradientMask.y = 200;

const content = Sprite.from("scene.png");
content.mask = gradientMask;

app.stage.addChild(content, gradientMask);
```

### 逆マスク

```ts
// マスクの外側を表示する
content.setMask({
  mask: maskGraphics,
  inverse: true,
});
```

### マスクの解除

```ts
content.mask = null;
```

---

## 14. Filters — フィルター

表示オブジェクトにポストプロセスのエフェクトを適用できる。

### 組み込みフィルター

```ts
import {
  BlurFilter,
  AlphaFilter,
  ColorMatrixFilter,
  NoiseFilter,
  DisplacementFilter,
  Sprite,
} from "pixi.js";

// ぼかし
sprite.filters = [new BlurFilter({ strength: 8, quality: 4 })];

// 透明度（alpha プロパティとは独立）
sprite.filters = [new AlphaFilter({ alpha: 0.5 })];

// 色変換
const colorMatrix = new ColorMatrixFilter();
colorMatrix.grayscale(0.5);   // グレースケール
// colorMatrix.sepia();       // セピア
// colorMatrix.negative();    // ネガティブ
// colorMatrix.saturate(2);   // 彩度UP
sprite.filters = [colorMatrix];

// ノイズ
sprite.filters = [new NoiseFilter({ noise: 0.3 })];

// ディスプレイスメント（歪み）
const displacementSprite = Sprite.from("displacement-map.png");
sprite.filters = [
  new DisplacementFilter({ sprite: displacementSprite, scale: 20 }),
];
```

### フィルターの組み合わせ

```ts
sprite.filters = [
  new BlurFilter({ strength: 2 }),
  new ColorMatrixFilter(),
];
```

### フィルターの解除

```ts
sprite.filters = [];
```

### 動的なフィルター

```ts
const blur = new BlurFilter({ strength: 0 });
sprite.filters = [blur];

app.ticker.add((ticker) => {
  // 徐々にぼかす
  blur.strength = Math.sin(Date.now() / 500) * 5 + 5;
});
```

---

## 15. パフォーマンスTips

### 描画効率

- **テクスチャアトラス（Spritesheet）を使う** — 画像ファイルが少ないほど描画バッチがまとまり高速
- **同じテクスチャの Sprite はまとめる** — 自動的にバッチ描画される
- **Graphics の `clear()` は最小限に** — 毎フレーム再描画が必要なら、形状が変わる部分だけ更新
- **見えないものは `visible = false`** — `alpha = 0` より軽い

### マスクの速度

| 方式 | 速度 | 用途 |
|---|---|---|
| `Rectangle` マスク | 最速 | 矩形の切り抜き |
| `Graphics` マスク | 高速 | 任意形状の切り抜き（ステンシル） |
| `Sprite` マスク | やや重い | グラデーション、画像ベースのマスク |

### メモリ

- **不要なテクスチャは `Assets.unload()` で解放する**
- **オブジェクトプール** を使って弾やパーティクルの生成・破棄を減らす
- **`removeChild` だけでなく `destroy()` も呼ぶ** — GPU メモリを解放する

```ts
// 完全な破棄
sprite.destroy({ children: true });
```

### Ticker

- **`maxFPS` を設定する** — モバイルで不必要に高い FPS を出さない
- **`deltaTime` を常に使う** — フレームレートに依存しない動きにする

### イベント

- **インタラクションが不要なオブジェクトは `eventMode = "none"` を明示する**
- **`static` vs `dynamic`** — 動かないボタンは `static`、動くオブジェクトは `dynamic`

---

## 参考リンク

- [PixiJS 公式サイト](https://pixijs.com/)
- [PixiJS v8 ガイド](https://pixijs.com/8.x/guides)
- [PixiJS API ドキュメント](https://pixijs.download/dev/docs/)
- [PixiJS Examples](https://pixijs.com/examples)
- [PixiJS v8 Migration Guide](https://pixijs.com/8.x/guides/migrations/v8)
