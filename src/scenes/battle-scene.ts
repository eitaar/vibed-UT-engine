import { type Application, Container, Graphics, Text } from "pixi.js";
import { BattleBox } from "../battle/battle-box";
import type { Scene } from "../core/scene";
import type { SceneManager } from "../core/scene-manager";

const battleBox = new BattleBox();
export class BattleScene implements Scene {
	container = new Container();
	async init(app: Application, sceneManager: SceneManager): Promise<void> {
		const g = new Graphics();
		g.rect(100, 100, 100, 100);
		g.fill(0xffaabb);
		this.container.addChild(g);
		this.container.addChild(battleBox.container);
	}
	update(dt: number) {}
	destroy() {
		this.container.destroy({ children: true });
	}
}
