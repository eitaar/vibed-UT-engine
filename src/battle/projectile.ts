import type { Graphics } from "pixi.js";
import type { Vec2 } from "../utils/vector";

export interface Projectile {
	pos: Vec2;
	vel: Vec2;
	gfx: Graphics;
	alive: boolean;
	age: number;
	shape: ProjectileShape;
	rotation: number;
}
export type ProjectileShape =
	| { kind: "circle"; radius: number }
	| { kind: "rect"; width: number; height: number };
