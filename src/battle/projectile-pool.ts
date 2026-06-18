import { Container, Graphics } from "pixi.js";
import { clamp, lerp } from "../utils/easing";
import type { Vec2 } from "../utils/vector";
import type { Projectile, ProjectileShape } from "./projectile";
export class ProjectilePool {
	container: Container;
	projectiles: Projectile[];
	pool: Graphics[];

	constructor() {
		this.container = new Container();
		this.projectiles = [];
		this.pool = [];
	}

	spawn(
		startPos: Vec2,
		endPos: Vec2,
		kind: ProjectileShape,
		rotation: number,
		duration: number,
		lingerTime?: number,
	): void {
		const gfx: Graphics = this.pool.length > 0 ? this.pool.pop()! : new Graphics();
		gfx.clear();
		switch (kind.kind) {
			case "circle":
				gfx.circle(0, 0, kind.radius);
				break;
			case "rect":
				gfx.rect(-kind.width / 2, -kind.height / 2, kind.width, kind.height);
				break;
		}
		gfx.fill(0xffffff);

		gfx.x = startPos.x;
		gfx.y = startPos.y;
		gfx.rotation = rotation;
		gfx.visible = true;

		const projectile: Projectile = {
			pos: startPos,
			gfx,
			alive: true,
			age: 0,
			shape: kind,
			rotation,
			duration,
			startPos,
			endPos,
			lingerTime,
		};
		this.projectiles.push(projectile);
		this.container.addChild(gfx);
	}
	spawn_vel(pos: Vec2, vel: Vec2, kind: ProjectileShape, rotation: number, duration: number): void {
		const gfx: Graphics = this.pool.length > 0 ? this.pool.pop()! : new Graphics();
		gfx.clear();
		switch (kind.kind) {
			case "circle":
				gfx.circle(0, 0, kind.radius);
				break;
			case "rect":
				gfx.rect(-kind.width / 2, -kind.height / 2, kind.width, kind.height);
				break;
		}
		gfx.fill(0xffffff);

		gfx.x = pos.x;
		gfx.y = pos.y;
		gfx.rotation = rotation;
		gfx.visible = true;

		const projectile: Projectile = {
			pos,
			vel,
			gfx,
			alive: true,
			age: 0,
			shape: kind,
			rotation,
			duration,
		};

		this.projectiles.push(projectile);
		this.container.addChild(gfx);
	}
	update(dt: number) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i];
			p.age += dt;
			if (p.vel) {
				p.pos.x += p.vel.x * dt;
				p.pos.y += p.vel.y * dt;
			} else if (p.startPos && p.endPos) {
				const t = clamp(p.age / p.duration, 0, 1);
				const easedT = p.easing ? p.easing(t) : t;
				p.pos.x = lerp(p.startPos.x, p.endPos.x, easedT);
				p.pos.y = lerp(p.startPos.y, p.endPos.y, easedT);
				const dx = p.endPos.x - p.pos.x;
				const dy = p.endPos.y - p.pos.y;
				if (dx * dx + dy * dy < 0.25) {
					p.pos.x = p.endPos.x;
					p.pos.y = p.endPos.y;
					p.age = p.duration;
				}
			}
			p.gfx.x = p.pos.x;
			p.gfx.y = p.pos.y;
			if (
				p.pos.x < 0 ||
				p.pos.x > 800 ||
				p.pos.y < 0 ||
				p.pos.y > 800 ||
				p.age >= p.duration + (p.lingerTime ?? 0)
			) {
				this.kill(p);
				this.projectiles.splice(i, 1);
			}
		}
	}

	kill(p: Projectile): void {
		p.alive = false;
		p.gfx.visible = false;
		this.container.removeChild(p.gfx);
		this.pool.push(p.gfx);
	}

	clear() {
		while (this.projectiles.length > 0) {
			this.kill(this.projectiles.pop()!);
		}
	}

	getAlive(): Projectile[] {
		return this.projectiles;
	}
}
