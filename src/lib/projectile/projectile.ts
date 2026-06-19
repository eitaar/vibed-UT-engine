import type { Graphics } from "pixi.js";
import type { Vec2 } from "../utils/vector";

export interface Projectile {
	pos: Vec2;
	gfx: Graphics;
	alive: boolean;
	shape: ProjectileShape;
	motions: Motion[];
	motionIndex: number;
	motionAge: number;
	motionStartPos: Vec2;
	motionStartScale: number;
	lingerTime: number;
	done: boolean;
}

export type ProjectileShape =
	| { kind: "circle"; radius: number }
	| { kind: "rect"; width: number; height: number };

export type Motion =
	| {
			type: "lerp";
			endPos: Vec2;
			duration: number;
			easing?: (t: number) => number;
			rotationSpeed?: number;
			scaleTo?: number;
	  }
	| { type: "vel"; vel: Vec2; duration: number; rotationSpeed?: number; scaleTo?: number }
	| { type: "wait"; duration: number; rotationSpeed?: number; scaleTo?: number };
