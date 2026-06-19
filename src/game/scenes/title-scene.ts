import { type Application, Container, Text } from "pixi.js";
import type { Scene } from "../../lib/core/scene";
import type { SceneManager } from "../../lib/core/scene-manager";
import { keyboard } from "../../lib/utils/index";
import { BattleScene } from "./battle-scene";

export class TitleScene implements Scene {
	container = new Container();
	private age = 0;
	private sceneManager!: SceneManager;
	private prompt!: Text;

	async init(_app: Application, sceneManager: SceneManager): Promise<void> {
		this.sceneManager = sceneManager;

		const title = new Text({
			text: "Test",
			style: { fontSize: 48, fill: 0xffffff, fontFamily: "DeterminationMono" },
		});
		title.anchor.set(0.5);
		title.position.set(400, 300);

		this.prompt = new Text({
			text: "Press Z to Start",
			style: { fontSize: 24, fill: 0xffffff, fontFamily: "DeterminationMono" },
		});
		this.prompt.anchor.set(0.5);
		this.prompt.position.set(400, 500);

		this.container.addChild(title, this.prompt);
	}

	update(dt: number): void {
		this.age += dt;
		this.prompt.alpha = 0.5 + 0.5 * Math.sin(this.age * 0.05);

		if (keyboard.isJustPressed("z")) {
			this.sceneManager.changeScene(new BattleScene());
		}
	}

	destroy(): void {
		this.container.destroy({ children: true });
	}
}
