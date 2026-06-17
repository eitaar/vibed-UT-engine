import type { Application } from "pixi.js";
import type { Scene } from "./scene";

export class SceneManager {
	app: Application;
	currentScene: Scene | null = null;
	isTransitioning: boolean = false;
	constructor(app: Application) {
		this.app = app;
	}
	async changeScene(scene: Scene) {
		if (this.isTransitioning) return;
		this.isTransitioning = true;
		if (this.currentScene) {
			this.app.stage.removeChild(this.currentScene.container);
			this.currentScene.destroy();
		}
		this.app.stage.addChild(scene.container);
		await scene.init(this.app, this);
		this.currentScene = scene;
		this.isTransitioning = false;
	}

	update(dt: number) {
		if (this.currentScene) this.currentScene.update(dt);
	}
}