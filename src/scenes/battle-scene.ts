import { type Application, Container, Graphics, Text } from "pixi.js";
import { BattleBox } from "../battle/battle-box";
import type { Scene } from "../core/scene";
import type { SceneManager } from "../core/scene-manager";
import { Player } from "../battle/player";

const battleBox = new BattleBox();
const player = new Player({
	x: battleBox.x + battleBox.width / 2,
	y: battleBox.y + battleBox.height / 2,
});
export class BattleScene implements Scene {
	container = new Container();
	async init(app: Application, sceneManager: SceneManager): Promise<void> {
		this.container.addChild(battleBox.container);
		this.container.addChild(player.gfx);
	}
	update(dt: number) {
		player.update(dt, battleBox.getInnerBounds());
	}
	destroy() {
		this.container.destroy({ children: true });
	}
}
