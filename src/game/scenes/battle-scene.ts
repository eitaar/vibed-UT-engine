import { type Application, Container } from "pixi.js";
import type { Scene } from "../../lib/core/scene";
import type { SceneManager } from "../../lib/core/scene-manager";
import { BattleEngine } from "../../lib/engine/battle-engine";
import { easeInCubic, easeInOutSine, easeOutCubic, easeOutElastic, linear } from "../../lib/utils/easing";
import {
	blasterWashingMachine,
	boneCage,
	boneColumnRush,
	boneStab,
	boneWall,
	boneWave,
	centerFirework,
	circularConverge,
	doubleSpiral,
	groundBones,
	topBottomSqueeze,
} from "../patterns";

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
				const cx = 400;
				const cy = 550;

				while (true) {
					// ========== 1: 開幕 — 骨壁で威嚇 ==========
					e.attack.pattern(boneWall);
					await e.wait(60);
					e.attack.pattern(boneWall);
					await e.wait(70);

					// ========== 2: 収束弾 → 骨ケージ ==========
					e.attack.pattern(circularConverge);
					await e.wait(70);
					e.attack.pattern(boneCage);
					await e.wait(90);

					// ========== 3: 叩きつけ → 地面骨ラッシュ ==========
					e.player.slam("down", 8, 10);
					await e.wait(12);
					await groundBones(e, 14, 3);

					e.player.slam("up", 8, 10);
					await e.wait(12);
					e.attack.pattern(topBottomSqueeze);
					await e.wait(60);

					// ========== 4: 骨ウェーブ — ボックス縮小 ==========
					e.player.setSoulMode("red");
					e.box.transform({ width: 250, height: 250, duration: 40, easing: easeInOutSine });
					await e.wait(20);
					await boneWave(e, 3, 16, 3);
					await e.box.transform({ width: 350, height: 350, duration: 30, easing: easeOutElastic });

					// ========== 5: 横長廊下 — 骨柱ラッシュ + ブラスター ==========
					await e.box.transform({ width: 550, height: 130, duration: 40, easing: easeOutCubic });
					e.player.slam("down", 6, 20);
					await e.wait(8);
					await boneColumnRush(e, 10, 6);
					for (let i = 0; i < 4; i++) {
						const side = i % 2 === 0 ? -1 : 1;
						e.attack.blast({
							x: cx + side * 400, y: cy + (i - 1.5) * 25,
							angle: side > 0 ? Math.PI : 0,
							chargeTime: 12, duration: 18, width: 22,
						});
						await e.wait(8);
					}
					await e.wait(40);

					// ========== 6: 洗濯機 — ボックス回転 ==========
					e.player.setSoulMode("red");
					await e.box.transform({ width: 300, height: 300, duration: 30, easing: easeOutCubic });
					e.box.transform({ rotation: Math.PI * 2, duration: 130, easing: linear });
					await blasterWashingMachine(e);
					await e.box.transform({ rotation: 0, width: 350, height: 350, duration: 40, easing: easeOutCubic });
					await e.wait(20);

					// ========== 7: 骨スタブ連打 — ボックス左右揺さぶり ==========
					e.player.setSoulMode("red");
					for (let i = 0; i < 3; i++) {
						const targetX = i % 2 === 0 ? 280 : 520;
						e.box.transform({ centerX: targetX, duration: 25, easing: easeInCubic });
						await boneStab(e, 4, 8);
					}
					await e.box.transform({ centerX: cx, duration: 30, easing: easeOutCubic });

					// ========== 8: 縦長通路 — 左右slam + 骨壁 ==========
					await e.box.transform({ width: 130, height: 480, duration: 40, easing: easeOutCubic });
					e.player.slam("right", 8, 12);
					await e.wait(15);
					e.attack.pattern(boneWall);
					await e.wait(50);
					e.player.slam("left", 8, 12);
					await e.wait(15);
					e.attack.pattern(boneWall);
					await e.wait(50);
					e.attack.pattern(doubleSpiral);
					await e.wait(60);

					// ========== 9: 花火 + 骨ケージ — ボックス呼吸 ==========
					e.player.setSoulMode("red");
					await e.box.transform({ width: 350, height: 350, duration: 35, easing: easeOutCubic });
					e.attack.pattern(centerFirework);
					await e.wait(40);
					e.box.transform({ width: 220, height: 220, duration: 30, easing: easeInOutSine });
					await e.wait(35);
					e.attack.pattern(boneCage);
					await e.wait(50);
					await e.box.transform({ width: 350, height: 350, duration: 25, easing: easeOutElastic });

					// ========== 10: クライマックス ==========
					e.player.setSoulMode("red");
					await e.wait(15);

					// 全方位ブラスター
					for (let i = 0; i < 12; i++) {
						const angle = (i / 12) * Math.PI * 2;
						e.attack.blast({
							x: cx + Math.cos(angle) * 350,
							y: cy + Math.sin(angle) * 350,
							angle: angle + Math.PI,
							chargeTime: 25, duration: 30, width: 22,
						});
						if (i % 4 === 0) e.attack.pattern(doubleSpiral);
						await e.wait(4);
					}
					await e.wait(30);

					// 骨スタブ + 骨壁 同時
					e.shake.trigger(15, 20);
					e.attack.pattern(boneWall);
					await boneStab(e, 6, 6);
					e.attack.pattern(circularConverge);
					e.attack.pattern(boneCage);
					await e.wait(100);

					// ========== リセット ==========
					await e.box.transform({
						centerX: cx, centerY: cy,
						width: 350, height: 350, rotation: 0,
						duration: 60, easing: easeOutCubic,
					});
					await e.wait(50);
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
