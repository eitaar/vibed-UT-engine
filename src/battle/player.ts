import { Graphics } from "pixi.js";
import { keyboard, vec, easing } from "../utils/index";
import type { Vec2 } from "../utils/vector";

export class Player {
	gfx: Graphics;
	pos: Vec2;
	speed = 4;
	slowSpeed = 2.5;
	radius = 7;

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

	update(dt: number, bounds: { left: number; right: number; top: number; bottom: number }): void {
		const dir = keyboard.getDirection();
		const speed = keyboard.isDown("Shift") ? this.slowSpeed : this.speed;
		const norm = vec.normalize(dir);

		this.pos.x += norm.x * speed * dt;
		this.pos.y += norm.y * speed * dt;

		this.pos.x = easing.clamp(this.pos.x, bounds.left + this.radius, bounds.right - this.radius);
		this.pos.y = easing.clamp(this.pos.y, bounds.top + this.radius, bounds.bottom - this.radius);

		this.gfx.x = this.pos.x;
		this.gfx.y = this.pos.y;
	}
}
