import { Container, Graphics } from "pixi.js";
import { clamp, lerp } from "../utils/easing";
import type { Vec2 } from "../utils/vector";
import type { Motion, Projectile, ProjectileShape } from "./projectile";

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
		motions: Motion[],
		shape: ProjectileShape,
		rotation = 0,
		lingerTime = 0,
	): void {
		const gfx: Graphics = this.pool.length > 0 ? this.pool.pop()! : new Graphics();
		gfx.clear();
		switch (shape.kind) {
			case "circle":
				gfx.circle(0, 0, shape.radius);
				break;
			case "rect":
				gfx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
				break;
		}
		gfx.fill(0xffffff);

		gfx.x = startPos.x;
		gfx.y = startPos.y;
		gfx.rotation = rotation;
		gfx.scale.set(1, 1);
		gfx.visible = true;

		const projectile: Projectile = {
			pos: { x: startPos.x, y: startPos.y },
			gfx,
			alive: true,
			shape,
			rotation,
			motions,
			motionIndex: 0,
			motionAge: 0,
			motionStartPos: { x: startPos.x, y: startPos.y },
			motionStartScale: 1,
			lingerTime,
			done: false,
		};

		this.projectiles.push(projectile);
		this.container.addChild(gfx);
	}
	update(dt: number) {
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i];

			if (p.done) {
				p.motionAge += dt;
				if (p.motionAge >= p.lingerTime) {
					this.kill(p);
					this.projectiles.splice(i, 1);
				}
				continue;
			}

			const motion = p.motions[p.motionIndex];
			p.motionAge += dt;

			switch (motion.type) {
				case "lerp": {
					const t = clamp(p.motionAge / motion.duration, 0, 1);
					const easedT = motion.easing ? motion.easing(t) : t;
					p.pos.x = lerp(p.motionStartPos.x, motion.endPos.x, easedT);
					p.pos.y = lerp(p.motionStartPos.y, motion.endPos.y, easedT);
					break;
				}
				case "vel":
					p.pos.x += motion.vel.x * dt;
					p.pos.y += motion.vel.y * dt;
					break;
				case "wait":
					break;
			}

			if (motion.rotationSpeed) {
				p.gfx.rotation += motion.rotationSpeed * dt;
			}
			if (motion.scaleTo !== undefined) {
				const st = clamp(p.motionAge / motion.duration, 0, 1);
				const s = lerp(p.motionStartScale, motion.scaleTo, st);
				p.gfx.scale.set(s, s);
			}

			if (p.motionAge >= motion.duration) {
				p.motionStartPos = { x: p.pos.x, y: p.pos.y };
				p.motionStartScale = p.gfx.scale.x;
				p.motionIndex++;
				p.motionAge = 0;
				if (p.motionIndex >= p.motions.length) {
					p.done = true;
					p.motionAge = 0;
				}
			}

			p.gfx.x = p.pos.x;
			p.gfx.y = p.pos.y;

			if (p.pos.x < -100 || p.pos.x > 900 || p.pos.y < -100 || p.pos.y > 900) {
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
