import { vec } from "../utils/index";
import type { Vec2 } from "../utils/vector";
import type { Player } from "./player";
import type { Projectile } from "./projectile";

function circleVsCircle(aPos: Vec2, aRadius: number, bPos: Vec2, bRadius: number): boolean {
	const dx = aPos.x - bPos.x;
	const dy = aPos.y - bPos.y;
	const r = aRadius + bRadius;
	return dx * dx + dy * dy < r * r;
}

function circleVsRotatedRect(
	circlePos: Vec2,
	circleRadius: number,
	rectPos: Vec2,
	rectW: number,
	rectH: number,
	rectRotation: number,
	rectScale: number,
): boolean {
	const local = vec.rotate(vec.sub(circlePos, rectPos), -rectRotation);
	const hw = (rectW * rectScale) / 2;
	const hh = (rectH * rectScale) / 2;
	const closestX = Math.max(-hw, Math.min(hw, local.x));
	const closestY = Math.max(-hh, Math.min(hh, local.y));
	const dx = local.x - closestX;
	const dy = local.y - closestY;
	return dx * dx + dy * dy < circleRadius * circleRadius;
}

export function checkCollisions(player: Player, projectiles: Projectile[]): Projectile[] {
	const hits: Projectile[] = [];
	for (const p of projectiles) {
		if (p.done) continue;
		const shape = p.shape;
		let hit = false;
		if (shape.kind === "circle") {
			hit = circleVsCircle(player.pos, player.radius, p.pos, shape.radius * p.gfx.scale.x);
		} else {
			hit = circleVsRotatedRect(
				player.pos,
				player.radius,
				p.pos,
				shape.width,
				shape.height,
				p.gfx.rotation,
				p.gfx.scale.x,
			);
		}
		if (hit) hits.push(p);
	}
	return hits;
}
