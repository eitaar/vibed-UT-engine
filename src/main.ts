import { Application } from "pixi.js";
import { SceneManager } from "./core/scene-manager";
import { TitleScene } from "./scenes/title-scene";
import { keyboard } from "./utils/index";

const canvas = document.getElementById("pixi-canvas") as HTMLCanvasElement;
const app = new Application();

await app.init({ background: "#000000", canvas: canvas, width: 800, height: 800, roundPixels: true, antialias: false });
await document.fonts.load('24px "DeterminationMono"');
canvas.style.opacity = "1";

const sceneManager = new SceneManager(app);
sceneManager.changeScene(new TitleScene());
keyboard.initKeyboard();

app.ticker.maxFPS = 60;
app.ticker.add((ticker) => {
	const dt: number = ticker.deltaTime;
	sceneManager.update(dt);
	keyboard.updateKeyboard();
});
