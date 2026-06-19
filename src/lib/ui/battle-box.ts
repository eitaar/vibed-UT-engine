import { Graphics } from "pixi.js";
import { clamp, lerp } from "../utils/easing";
import { add, rotate, sub } from "../utils/vector";
import type { Vec2 } from "../utils/vector";

export interface BoxConfig {
	centerX: number;
	centerY: number;
	width: number;
	height: number;
}

export class BattleBox {
	container: Graphics = new Graphics();
	centerX!: number;
	centerY!: number;
	width!: number;
	height!: number;
	strokeWidth = 6;

	private targetCenterX!: number;
	private targetCenterY!: number;
	private targetWidth!: number;
	private targetHeight!: number;
	private transitioning = false;
	private lerpSpeed = 0.08;
	private onTransitionDone: (() => void) | null = null;

	constructor(config: BoxConfig) {
		this.setConfig(config);
	}

	setConfig(config: BoxConfig): void {
		this.centerX = config.centerX;
		this.centerY = config.centerY;
		this.width = config.width;
		this.height = config.height;
		this.targetCenterX = config.centerX;
		this.targetCenterY = config.centerY;
		this.targetWidth = config.width;
		this.targetHeight = config.height;
		this.container.position.set(this.centerX, this.centerY);
		this.draw();
	}

	transitionTo(config: BoxConfig, onDone?: () => void): void {
		this.targetCenterX = config.centerX;
		this.targetCenterY = config.centerY;
		this.targetWidth = config.width;
		this.targetHeight = config.height;
		this.transitioning = true;
		this.onTransitionDone = onDone ?? null;
	}

	update(dt: number): void {
		if (!this.transitioning) return;

		const speed = this.lerpSpeed * dt;
		this.centerX = lerp(this.centerX, this.targetCenterX, speed);
		this.centerY = lerp(this.centerY, this.targetCenterY, speed);
		this.width = lerp(this.width, this.targetWidth, speed);
		this.height = lerp(this.height, this.targetHeight, speed);

		const dx = Math.abs(this.centerX - this.targetCenterX);
		const dy = Math.abs(this.centerY - this.targetCenterY);
		const dw = Math.abs(this.width - this.targetWidth);
		const dh = Math.abs(this.height - this.targetHeight);
		if (dx < 0.5 && dy < 0.5 && dw < 0.5 && dh < 0.5) {
			this.centerX = this.targetCenterX;
			this.centerY = this.targetCenterY;
			this.width = this.targetWidth;
			this.height = this.targetHeight;
			this.transitioning = false;
		}

		this.container.position.set(this.centerX, this.centerY);
		this.draw();

		if (!this.transitioning) {
			this.onTransitionDone?.();
			this.onTransitionDone = null;
		}
	}

	draw(): void {
		this.container.clear();
		this.container.rect(-this.width / 2, -this.height / 2, this.width, this.height);
		this.container.stroke({ width: this.strokeWidth, color: 0xffffff });
	}

	constrainPoint(worldPoint: Vec2, radius: number): Vec2 {
		const center = { x: this.centerX, y: this.centerY };
		const rotation = this.container.rotation;
		const local = rotate(sub(worldPoint, center), -rotation);
		const sw = this.strokeWidth;
		const clamped = {
			x: clamp(local.x, -this.width / 2 + sw + radius, this.width / 2 - sw - radius),
			y: clamp(local.y, -this.height / 2 + sw + radius, this.height / 2 - sw - radius),
		};
		return add(rotate(clamped, rotation), center);
	}
}
