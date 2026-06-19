import { type Application, Container } from "pixi.js";
import type { Scene } from "../../lib/core/scene";
import type { SceneManager } from "../../lib/core/scene-manager";
import { BattleEngine } from "../../lib/engine/battle-engine";
import { blasterWashingMachine, centerFirework, circularConverge, doubleSpiral, topBottomSqueeze } from "../patterns";

const BOX_DIALOG = { centerX: 400, centerY: 530, width: 550, height: 150 };
const BOX_BATTLE = { centerX: 400, centerY: 550, width: 350, height: 350 };

export class BattleScene implements Scene {
	container = new Container();
	private engine!: BattleEngine;

	async init(_app: Application, _sceneManager: SceneManager): Promise<void> {
		this.engine = new BattleEngine({
			box: BOX_DIALOG,
			battleBox: BOX_BATTLE,
			enemy: {
				name: "Smiley",
				lines: ["* test", "* apple", "* pen"],
				x: 400,
				y: 220,
				sprite: "src/assets/img/sprite.png",
			},
			script: async (e) => {
				while (true) {
					e.attack(circularConverge);
					await e.wait(80);

					e.player.slam("down");
					e.attack(topBottomSqueeze);
					await e.wait(80);

					e.player.slam("up");
					e.attack(centerFirework);
					await e.wait(80);

					e.player.setSoulMode("red");
					await blasterWashingMachine(e);

					e.attack(doubleSpiral);
					await e.wait(80);
				}
			},
		});
		await this.engine.init();
		this.container.addChild(this.engine.container);
		this.engine.start();
	}

	update(dt: number): void {
		this.engine.update(dt);
	}

	destroy(): void {
		this.container.destroy({ children: true });
	}
}
