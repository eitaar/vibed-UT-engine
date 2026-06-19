import { type Application, Graphics } from "pixi.js";
import type { Scene } from "./scene";

export class SceneManager {
	app: Application;
	currentScene: Scene | null = null;
	private isTransitioning = false;
	private overlay: Graphics;
	private fadeState: "none" | "out" | "in" = "none";
	private fadeSpeed = 0.04;
	private pendingScene: Scene | null = null;

	constructor(app: Application) {
		this.app = app;
		this.overlay = new Graphics();
		this.overlay.rect(0, 0, 800, 800);
		this.overlay.fill(0x000000);
		this.overlay.alpha = 0;
		this.overlay.visible = false;
		this.app.stage.addChild(this.overlay);
	}

	async changeScene(scene: Scene): Promise<void> {
		if (this.isTransitioning) return;
		this.isTransitioning = true;

		if (this.currentScene) {
			this.pendingScene = scene;
			this.fadeState = "out";
			this.overlay.visible = true;
		} else {
			this.app.stage.addChild(scene.container);
			await scene.init(this.app, this);
			this.currentScene = scene;
			this.overlay.alpha = 1;
			this.overlay.visible = true;
			this.fadeState = "in";
			this.app.stage.addChild(this.overlay);
		}
	}

	update(dt: number): void {
		if (this.fadeState === "out") {
			this.overlay.alpha += this.fadeSpeed * dt;
			this.app.stage.addChild(this.overlay);
			if (this.overlay.alpha >= 1) {
				this.overlay.alpha = 1;
				this.swapScene();
			}
			return;
		}

		if (this.fadeState === "in") {
			this.overlay.alpha -= this.fadeSpeed * dt;
			this.app.stage.addChild(this.overlay);
			if (this.overlay.alpha <= 0) {
				this.overlay.alpha = 0;
				this.overlay.visible = false;
				this.fadeState = "none";
				this.isTransitioning = false;
			}
		}

		if (this.currentScene) this.currentScene.update(dt);
	}

	private async swapScene(): Promise<void> {
		if (this.currentScene) {
			this.app.stage.removeChild(this.currentScene.container);
			this.currentScene.destroy();
		}

		const scene = this.pendingScene!;
		this.pendingScene = null;
		this.app.stage.addChild(scene.container);
		await scene.init(this.app, this);
		this.currentScene = scene;
		this.fadeState = "in";
		this.app.stage.addChild(this.overlay);
	}
}
