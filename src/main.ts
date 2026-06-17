import { Application } from "pixi.js";
import { keyboard } from "./utils/index";
import { BattleScene } from "./scenes/battle-scene";
import { SceneManager } from "./core/scene-manager";

const canvas = document.getElementById("pixi-canvas") as HTMLCanvasElement;
const app = new Application();

await app.init({ background: "#000000", canvas: canvas, width: 800, height: 800 });
canvas.style.opacity = "1";

const sceneManager = new SceneManager(app);
sceneManager.changeScene(new BattleScene());
keyboard.initKeyboard();

app.ticker.maxFPS = 60;
app.ticker.add((ticker) => {
	const dt: number = ticker.deltaTime;
	sceneManager.update(dt);
	keyboard.updateKeyboard();
});
