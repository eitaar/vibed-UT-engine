import { Graphics } from "pixi.js";
import { getDirection, isDown } from "../utils/keyboard";
import type { Vec2 } from "../utils/vector";
import { normalize } from "../utils/vector";
import { Health } from "./health";

export type SoulMode = "red" | "blue";
export type GravityDirection = "down" | "up" | "left" | "right";

const GRAVITY_CONFIG: Record<
	GravityDirection,
	{ axis: "x" | "y"; sign: 1 | -1; moveNeg: string; movePos: string; jumpKey: string }
> = {
	down: { axis: "y", sign: 1, moveNeg: "ArrowLeft", movePos: "ArrowRight", jumpKey: "ArrowUp" },
	up: { axis: "y", sign: -1, moveNeg: "ArrowLeft", movePos: "ArrowRight", jumpKey: "ArrowDown" },
	right: { axis: "x", sign: 1, moveNeg: "ArrowUp", movePos: "ArrowDown", jumpKey: "ArrowLeft" },
	left: { axis: "x", sign: -1, moveNeg: "ArrowUp", movePos: "ArrowDown", jumpKey: "ArrowRight" },
};

const SOUL_COLORS: Record<SoulMode, number> = { red: 0xff0000, blue: 0x4444ff };

const GRAVITY_ROTATIONS: Record<GravityDirection, number> = {
	down: 0,
	up: Math.PI,
	left: Math.PI / 2,
	right: -Math.PI / 2,
};

export interface SoulPlayerConfig {
	maxHp?: number;
	speed?: number;
	slowSpeed?: number;
	radius?: number;
	gravity?: number;
	jumpForce?: number;
	maxFallSpeed?: number;
	invincibleDuration?: number;
	draw?: (gfx: Graphics, color: number) => void;
}

function defaultDraw(gfx: Graphics, color: number): void {
	gfx.clear();
	const s = 10;
	gfx.circle(-s / 2, -s * 0.15, s / 2);
	gfx.fill(color);
	gfx.circle(s / 2, -s * 0.15, s / 2);
	gfx.fill(color);
	gfx.poly([-s, -s * 0.15, s, -s * 0.15, 0, s * 1.1]);
	gfx.fill(color);
}

export class SoulPlayer {
	gfx: Graphics;
	pos: Vec2;
	radius: number;
	health: Health;

	soulMode: SoulMode = "red";
	gravityDir: GravityDirection = "down";
	onSlamLand: (() => void) | null = null;

	private age = 0;
	private speed: number;
	private slowSpeed: number;
	private velocity = 0;
	private gravityForce: number;
	private jumpForce: number;
	private maxFallSpeed: number;
	private slamActive = false;
	private slamSpeed = 0;
	private slamLockoutTime = 0;
	private slamLockout = 0;
	private grounded = false;
	private drawFn: (gfx: Graphics, color: number) => void;

	constructor(pos: Vec2, config: SoulPlayerConfig = {}) {
		this.pos = { ...pos };
		this.radius = config.radius ?? 7;
		this.speed = config.speed ?? 4;
		this.slowSpeed = config.slowSpeed ?? 2.5;
		this.gravityForce = config.gravity ?? 0.75;
		this.jumpForce = config.jumpForce ?? 11;
		this.maxFallSpeed = config.maxFallSpeed ?? 10;
		this.health = new Health(config.maxHp ?? 20, config.invincibleDuration ?? 40);
		this.drawFn = config.draw ?? defaultDraw;

		this.gfx = new Graphics();
		this.drawFn(this.gfx, SOUL_COLORS[this.soulMode]);
		this.gfx.x = this.pos.x;
		this.gfx.y = this.pos.y;
	}

	get hp(): number {
		return this.health.hp;
	}
	get maxHp(): number {
		return this.health.maxHp;
	}

	hit(damage?: number): void {
		this.health.hit(damage);
	}

	setSoulMode(mode: SoulMode): void {
		if (this.soulMode === mode) return;
		this.soulMode = mode;
		this.drawFn(this.gfx, SOUL_COLORS[mode]);
		if (mode === "red") this.gfx.rotation = 0;
		if (mode === "blue") {
			this.velocity = 0;
			this.grounded = false;
		}
	}

	setGravityDirection(dir: GravityDirection): void {
		if (this.gravityDir === dir) return;
		this.gravityDir = dir;
		this.velocity = 0;
		this.grounded = false;
		this.gfx.rotation = GRAVITY_ROTATIONS[dir];
	}

	slam(dir: GravityDirection, duration = 12, lockout = 0): void {
		this.setGravityDirection(dir);
		this.setSoulMode("blue");
		const cfg = GRAVITY_CONFIG[dir];
		this.slamSpeed = (500 / duration) * cfg.sign;
		this.slamActive = true;
		this.slamLockoutTime = lockout;
		this.slamLockout = 0;
		this.grounded = false;
		this.velocity = 0;
	}

	update(dt: number, constrain: (pos: Vec2, radius: number) => Vec2): void {
		this.age += dt;
		this.gfx.alpha = this.health.updateInvincibility(dt, this.age);

		if (this.soulMode === "red") {
			const dir = getDirection();
			const speed = isDown("Shift") ? this.slowSpeed : this.speed;
			const norm = normalize(dir);
			this.pos.x += norm.x * speed * dt;
			this.pos.y += norm.y * speed * dt;
		} else {
			const cfg = GRAVITY_CONFIG[this.gravityDir];

			if (this.slamLockout > 0) {
				this.slamLockout -= dt;
				if (this.slamLockout <= 0) {
					this.slamLockout = 0;
					if (this.grounded && isDown(cfg.jumpKey)) {
						this.velocity = -this.jumpForce * cfg.sign;
						this.grounded = false;
					}
				}
			} else {
				const speed = isDown("Shift") ? this.slowSpeed : this.speed;
				const moveAxis = cfg.axis === "y" ? "x" : "y";
				if (isDown(cfg.moveNeg)) this.pos[moveAxis] -= speed * dt;
				if (isDown(cfg.movePos)) this.pos[moveAxis] += speed * dt;

				if (this.grounded && isDown(cfg.jumpKey)) {
					this.velocity = -this.jumpForce * cfg.sign;
					this.grounded = false;
				}
			}

			if (this.slamActive) {
				this.pos[cfg.axis] += this.slamSpeed * dt;
			} else if (this.slamLockout <= 0) {
				if (this.velocity * cfg.sign < 0 && !isDown(cfg.jumpKey)) {
					this.velocity += this.gravityForce * cfg.sign * 2.5 * dt;
				} else {
					this.velocity += this.gravityForce * cfg.sign * dt;
				}
				const cappedVel = Math.min(Math.abs(this.velocity), this.maxFallSpeed);
				this.velocity = Math.sign(this.velocity) * cappedVel;
				this.pos[cfg.axis] += this.velocity;
			}
		}

		const prevX = this.pos.x;
		const prevY = this.pos.y;
		const clamped = constrain(this.pos, this.radius);
		this.pos.x = clamped.x;
		this.pos.y = clamped.y;

		if (this.soulMode === "blue") {
			const cfg = GRAVITY_CONFIG[this.gravityDir];
			const prev = cfg.axis === "x" ? prevX : prevY;
			const curr = this.pos[cfg.axis];
			if (curr !== prev) {
				if (this.slamActive) {
					this.slamActive = false;
					this.slamLockout = this.slamLockoutTime;
					this.onSlamLand?.();
				}
				this.velocity = 0;
				this.grounded = true;
			}
		}

		this.gfx.x = this.pos.x;
		this.gfx.y = this.pos.y;
	}
}
