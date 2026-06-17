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

	// spawn(pos: Vec2, vel: Vec2, shape: ProjectileShape): Projectile): void {};
}
