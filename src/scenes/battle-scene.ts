import type { Scene } from "../core/scene";
import { Container, Application, Text, Graphics } from "pixi.js";
import type { SceneManager } from "../core/scene-manager";

export class BattleScene implements Scene {
	container = new Container();
	async init(app: Application, sceneManager: SceneManager): Promise<void> {
		const g = new Graphics();
		g.rect(100, 100, 100, 100);
		g.fill(0xffaabb);
		this.container.addChild(g);
	}
	update(dt: number) {}
	destroy() {
		this.container.destroy({ children: true });
	}
}
