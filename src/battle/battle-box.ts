import { Graphics } from "pixi.js";
import { vec, easing } from "../utils/index";
import type { Vec2 } from "../utils/vector";

export class BattleBox {
	container: Graphics = new Graphics();
	centerX: number = 400;
	centerY: number = 550;
	width: number = 350;
	height: number = 350;
	strokeWidth: number = 6;

	constructor() {
		this.container.position.set(this.centerX, this.centerY);
		this.draw();
	}

	draw(): void {
		this.container.clear();
		this.container.rect(-this.width / 2, -this.height / 2, this.width, this.height);
		this.container.stroke({ width: this.strokeWidth, color: 0xffffff });
	}

	constrainPoint(worldPoint: Vec2, radius: number): Vec2 {
		const center = { x: this.centerX, y: this.centerY };
		const rotation = this.container.rotation;
		const local = vec.rotate(vec.sub(worldPoint, center), -rotation);
		const sw = this.strokeWidth;
		const clamped = {
			x: easing.clamp(local.x, -this.width / 2 + sw + radius, this.width / 2 - sw - radius),
			y: easing.clamp(local.y, -this.height / 2 + sw + radius, this.height / 2 - sw - radius),
		};
		return vec.add(vec.rotate(clamped, rotation), center);
	}
}
