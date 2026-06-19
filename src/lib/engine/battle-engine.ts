import { Container } from "pixi.js";
import { ScreenShake } from "../effects/screen-shake";
import { Enemy } from "../entity/enemy";
import { SoulPlayer, type SoulPlayerConfig } from "../entity/soul-player";
import { Blaster, type BlasterConfig } from "../projectile/blaster";
import type { Motion, ProjectileShape } from "../projectile/projectile";
import { checkCollisions } from "../projectile/collision";
import { ProjectilePool } from "../projectile/projectile-pool";
import { BattleBox, type BoxConfig } from "../ui/battle-box";
import { Dialog } from "../ui/dialog";
import { HpBar } from "../ui/hp-bar";
import type { Vec2 } from "../utils/vector";

export type BattleState = "idle" | "dialog" | "transition" | "fighting" | "dead";

export type BulletPattern = (e: BattleEngine) => void;

export interface SpawnConfig {
	x: number;
	y: number;
	motions: Motion[];
	shape?: ProjectileShape;
	rotation?: number;
	linger?: number;
}

export interface EnemyConfig {
	name: string;
	lines: string[];
	x: number;
	y: number;
	sprite: string;
	scale?: number;
}

export interface BattleConfig {
	box: BoxConfig;
	battleBox: BoxConfig;
	enemy: EnemyConfig;
	player?: SoulPlayerConfig;
	hpBarWidth?: number;
	script?: (engine: BattleEngine) => Promise<void>;
	onHit?: (engine: BattleEngine) => void;
	onDeath?: (engine: BattleEngine) => void;
}

export class BattleEngine {
	container = new Container();
	box: BattleBox;
	pool = new ProjectilePool();
	hpBar: HpBar;
	dialog: Dialog;
	shake: ScreenShake;
	player: SoulPlayer;
	enemy: Enemy;

	state: BattleState = "idle";
	wave = 0;
	private config: BattleConfig;
	private waitTimer = 0;
	private resolveWait: (() => void) | null = null;
	private blasters: Blaster[] = [];

	constructor(config: BattleConfig) {
		this.config = config;
		this.box = new BattleBox(config.box);

		const bc = config.battleBox;
		this.player = new SoulPlayer({ x: bc.centerX, y: bc.centerY }, config.player);
		this.player.gfx.visible = false;
		this.player.onSlamLand = () => this.shake.trigger(12, 15);

		const ec = config.enemy;
		this.enemy = new Enemy(ec.name, ec.lines, ec.x, ec.y);

		const hpW = config.hpBarWidth ?? 200;
		this.hpBar = new HpBar(bc.centerX - hpW / 2, bc.centerY + bc.height / 2 + 20, hpW);
		this.hpBar.container.alpha = 0;

		this.dialog = new Dialog(this.box);
		this.shake = new ScreenShake(this.container);

		this.container.addChild(
			this.box.container,
			this.pool.container,
			this.hpBar.container,
			this.player.gfx,
			this.enemy.container,
		);
	}

	async init(): Promise<void> {
		const ec = this.config.enemy;
		await this.enemy.init(ec.sprite, ec.scale);
	}

	start(): void {
		const lines = this.enemy.dialogueLines;
		if (lines.length > 0) {
			this.state = "dialog";
			this.dialog.start(lines, () => this.transitionToFight());
		} else {
			this.transitionToFight();
		}
	}

	attack(pattern: BulletPattern): void {
		pattern(this);
		this.wave++;
	}

	spawn(config: SpawnConfig): void {
		this.pool.spawn(
			{ x: config.x, y: config.y },
			config.motions,
			config.shape ?? { kind: "rect", width: 8, height: 45 },
			config.rotation ?? 0,
			config.linger ?? 0,
		);
	}

	wait(frames: number): Promise<void> {
		return new Promise((resolve) => {
			this.waitTimer = frames;
			this.resolveWait = resolve;
		});
	}

	blast(config: BlasterConfig): void {
		let angle = config.angle ?? 0;
		if (config.aimAtPlayer) {
			angle = Math.atan2(this.player.pos.y - config.y, this.player.pos.x - config.x);
		}
		const b = new Blaster(
			config.x,
			config.y,
			angle,
			config.chargeTime ?? 30,
			config.duration ?? 40,
			config.width ?? 30,
			config.length ?? 1000,
			config.enterFrom ?? "back",
			() => this.shake.trigger(10, 12),
		);
		this.blasters.push(b);
		this.container.addChild(b.container);
	}

	private transitionToFight(): void {
		this.state = "transition";
		this.box.transitionTo(this.config.battleBox, () => {
			this.state = "fighting";
			this.player.gfx.visible = true;
			this.config.script?.(this);
		});
	}

	constrain(pos: Vec2, radius: number): Vec2 {
		return this.box.constrainPoint(pos, radius);
	}

	update(dt: number): void {
		this.shake.update(dt);
		this.box.update(dt);
		this.pool.update(dt);
		this.enemy.update(dt);

		if (this.state === "dialog") {
			this.dialog.update(dt);
			return;
		}

		if (this.state === "transition") {
			this.fadeInHpBar(dt);
			return;
		}

		if (this.state === "fighting") {
			this.fadeInHpBar(dt);

			if (this.waitTimer > 0) {
				this.waitTimer -= dt;
				if (this.waitTimer <= 0) {
					this.waitTimer = 0;
					this.resolveWait?.();
					this.resolveWait = null;
				}
			}

			this.player.update(dt, (pos, radius) => this.constrain(pos, radius));

			for (let i = this.blasters.length - 1; i >= 0; i--) {
				const b = this.blasters[i];
				b.update(dt);
				if (b.firing && b.checkHit(this.player)) {
					this.player.hit();
					this.config.onHit?.(this);
				}
				if (b.done) {
					this.container.removeChild(b.container);
					this.blasters.splice(i, 1);
				}
			}

			const hits = checkCollisions(this.player, this.pool.getAlive());
			if (hits.length > 0) {
				this.player.hit();
				this.config.onHit?.(this);
			}

			this.hpBar.update(this.player.hp, this.player.maxHp, dt);

			if (this.player.hp <= 0) {
				this.pool.clear();
				this.state = "dead";
				this.config.onDeath?.(this);
			}
		}
	}

	private fadeInHpBar(dt: number): void {
		if (this.hpBar.container.alpha < 1) {
			this.hpBar.container.alpha = Math.min(1, this.hpBar.container.alpha + 0.03 * dt);
		}
	}
}
