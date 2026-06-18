import { type Application, Container } from "pixi.js";
import { BattleBox } from "../battle/battle-box";
import { Player } from "../battle/player";
import type { Scene } from "../core/scene";
import type { SceneManager } from "../core/scene-manager";
import { ProjectilePool } from "../battle/projectile-pool";

const battleBox = new BattleBox();
const projectilePool = new ProjectilePool();
const player = new Player({ x: battleBox.centerX, y: battleBox.centerY });

export class BattleScene implements Scene {
	container = new Container();
	async init(_app: Application, _sceneManager: SceneManager): Promise<void> {
		this.container.addChild(battleBox.container);
		this.container.addChild(player.gfx);

		projectilePool.spawn({ x: 100, y: 100 }, { x: 1, y: 1 }, { kind: "circle", radius: 10 }, 0);

		this.container.addChild(projectilePool.container);
	}
	update(dt: number) {
		player.update(dt, (pos, radius) => battleBox.constrainPoint(pos, radius));
		projectilePool.update(dt);
	}
	destroy() {
		this.container.destroy({ children: true });
	}
}
