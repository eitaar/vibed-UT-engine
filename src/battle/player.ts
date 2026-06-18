import { Graphics } from "pixi.js";
import { keyboard, vec } from "../utils/index";
import type { Vec2 } from "../utils/vector";

export class Player {
	gfx: Graphics;
	pos: Vec2;
	speed = 4;
	slowSpeed = 2.5;
	radius = 7;
	hp = 20;
	maxHp = 20;
	invincible = false;
	invincibleTimer = 0;
	invincibleDuration = 40;
	age = 0;

	constructor(pos: Vec2) {
		this.pos = { ...pos };
		this.gfx = new Graphics();

		const s = 10;
		this.gfx.circle(-s / 2, -s * 0.15, s / 2);
		this.gfx.fill(0xff0000);
		this.gfx.circle(s / 2, -s * 0.15, s / 2);
		this.gfx.fill(0xff0000);
		this.gfx.poly([-s, -s * 0.15, s, -s * 0.15, 0, s * 1.1]);
		this.gfx.fill(0xff0000);

		this.gfx.x = this.pos.x;
		this.gfx.y = this.pos.y;
	}

	hit(damage = 1): void {
		if (this.invincible) return;
		this.hp = Math.max(0, this.hp - damage);
		this.invincible = true;
		this.invincibleTimer = this.invincibleDuration;
	}

	update(dt: number, constrain: (pos: Vec2, radius: number) => Vec2): void {
		this.age += dt;

		if (this.invincible) {
			this.invincibleTimer -= dt;
			if (this.invincibleTimer <= 0) {
				this.invincible = false;
				this.gfx.alpha = 1;
			} else {
				const fade = this.invincibleTimer / this.invincibleDuration;
				const wave = (Math.sin(this.age * 0.6) + 1) / 2;
				this.gfx.alpha = 0.2 + wave * 0.5 * (1 - fade) + fade * 0.3;
			}
		}

		const dir = keyboard.getDirection();
		const speed = keyboard.isDown("Shift") ? this.slowSpeed : this.speed;
		const norm = vec.normalize(dir);

		this.pos.x += norm.x * speed * dt;
		this.pos.y += norm.y * speed * dt;

		const clamped = constrain(this.pos, this.radius);
		this.pos.x = clamped.x;
		this.pos.y = clamped.y;

		this.gfx.x = this.pos.x;
		this.gfx.y = this.pos.y;
	}
}
