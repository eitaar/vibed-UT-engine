import { Container, Graphics } from "pixi.js";
import type { Projectile, ProjectileShape } from "./projectile";
import type { Vec2 } from "../utils/vector";
export class ProjectilePool {
	container: Container;
	projectiles: Projectile[];
	pool: Graphics[];

	constructor() {
		this.container = new Container();
		this.projectiles = [];
		this.pool = [];
	}

	spawn(pos: Vec2, vel: Vec2, kind: ProjectileShape, rotation: number): void {
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
		};

		this.projectiles.push(projectile);
		this.container.addChild(gfx);
	}
	update(dt: number) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i];
			p.age += dt;
			p.pos.x += p.vel.x * dt;
			p.pos.y += p.vel.y * dt;
			p.gfx.x = p.pos.x;
			p.gfx.y = p.pos.y;
			if (p.pos.x < 0 || p.pos.x > 800 || p.pos.y < 0 || p.pos.y > 800) {
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
