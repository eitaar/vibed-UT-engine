import type { Graphics } from "pixi.js";
import type { Vec2 } from "../utils/vector";

export interface Projectile {
	pos: Vec2;
	vel?: Vec2;
	gfx: Graphics;
	alive: boolean;
	age: number;
	shape: ProjectileShape;
	rotation: number;
	duration: number;
	easing?: (t: number) => number;
	startPos?: Vec2;
	endPos?: Vec2;
	lingerTime?: number;
}
export type ProjectileShape =
	| { kind: "circle"; radius: number }
	| { kind: "rect"; width: number; height: number };
