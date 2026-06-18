import { type Application, Container } from "pixi.js";
import { BOX_BATTLE, BOX_DIALOG, BattleBox } from "../battle/battle-box";
import { checkCollisions } from "../battle/collision";
import { Dialog } from "../battle/dialog";
import {
	Enemy,
	centerFirework,
	circularConverge,
	doubleSpiral,
	topBottomSqueeze,
} from "../battle/enemy";
import { HpBar } from "../battle/hp-bar";
import { Player } from "../battle/player";
import { ProjectilePool } from "../battle/projectile-pool";
import type { Scene } from "../core/scene";
import type { SceneManager } from "../core/scene-manager";

type BattleState = "dialog" | "transition" | "fighting" | "dead";

export class BattleScene implements Scene {
	container = new Container();
	private battleBox = new BattleBox();
	private pool = new ProjectilePool();
	private player!: Player;
	private hpBar!: HpBar;
	private enemy!: Enemy;
	private dialog!: Dialog;
	private state: BattleState = "dialog";
	private timer = 0;
	private wave = 0;

	async init(_app: Application, _sceneManager: SceneManager): Promise<void> {
		this.battleBox.setConfig(BOX_DIALOG);

		const cx = BOX_BATTLE.centerX;
		const cy = BOX_BATTLE.centerY;

		this.player = new Player({ x: cx, y: cy });
		this.player.gfx.visible = false;
		this.hpBar = new HpBar(cx - 75, cy + BOX_BATTLE.height / 2 + 20);
		this.hpBar.container.alpha = 0;

		this.enemy = new Enemy(
			"Smiley",
			["* こんにちは！", "* 覚悟はいい？", "* いくよ！"],
			[circularConverge, topBottomSqueeze, centerFirework, doubleSpiral],
			cx,
			220,
		);
		await this.enemy.init();

		this.dialog = new Dialog(this.battleBox);

		this.container.addChild(this.battleBox.container);
		this.container.addChild(this.pool.container);
		this.container.addChild(this.player.gfx);
		this.container.addChild(this.hpBar.container);
		this.container.addChild(this.enemy.container);

		this.dialog.start(this.enemy.dialogueLines, () => {
			this.state = "transition";
			this.battleBox.transitionTo(BOX_BATTLE, () => {
				this.player.gfx.visible = true;
				this.state = "fighting";
			});
		});
	}

	update(dt: number): void {
		this.enemy.update(dt);
		this.battleBox.update(dt);

		if (this.state === "dialog") {
			this.dialog.update(dt);
			return;
		}

		if (this.state === "transition") {
			if (this.hpBar.container.alpha < 1) {
				this.hpBar.container.alpha = Math.min(1, this.hpBar.container.alpha + 0.03 * dt);
			}
			return;
		}

		if (this.state === "fighting") {
			if (this.hpBar.container.alpha < 1) {
				this.hpBar.container.alpha = Math.min(1, this.hpBar.container.alpha + 0.03 * dt);
			}

			const cx = this.battleBox.centerX;
			const cy = this.battleBox.centerY;

			this.timer += dt;
			if (this.timer >= 80) {
				this.timer = 0;
				const phase = this.wave % this.enemy.patterns.length;
				this.enemy.patterns[phase](this.pool, cx, cy, this.wave);
				this.wave++;
			}

			this.player.update(dt, (pos, radius) => this.battleBox.constrainPoint(pos, radius));
			this.pool.update(dt);

			const hits = checkCollisions(this.player, this.pool.getAlive());
			if (hits.length > 0) {
				this.player.hit();
			}
			this.hpBar.update(this.player.hp, this.player.maxHp);

			if (this.player.hp <= 0) {
				this.pool.clear();
				this.state = "dead";
			}
		}
	}

	destroy(): void {
		this.container.destroy({ children: true });
	}
}
