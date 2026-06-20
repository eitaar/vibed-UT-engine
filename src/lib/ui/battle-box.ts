import { Graphics } from "pixi.js";
import { clamp, easeOutCubic, lerp } from "../utils/easing";
import type { Vec2 } from "../utils/vector";
import { add, rotate, sub } from "../utils/vector";

export interface BoxConfig {
	centerX: number;
	centerY: number;
	width: number;
	height: number;
	rotation?: number;
}

export interface BoxTransformConfig {
	centerX?: number;
	centerY?: number;
	width?: number;
	height?: number;
	rotation?: number;
	duration?: number;
	easing?: (t: number) => number;
}

export class BattleBox {
	container: Graphics = new Graphics();
	centerX!: number;
	centerY!: number;
	width!: number;
	height!: number;
	rotation = 0;
	strokeWidth = 6;

	private fromCenterX = 0;
	private fromCenterY = 0;
	private fromWidth = 0;
	private fromHeight = 0;
	private fromRotation = 0;
	private targetCenterX = 0;
	private targetCenterY = 0;
	private targetWidth = 0;
	private targetHeight = 0;
	private targetRotation = 0;

	private transitioning = false;
	private transitionAge = 0;
	private transitionDuration = 30;
	private transitionEasing: (t: number) => number = easeOutCubic;
	private onTransitionDone: (() => void) | null = null;

	constructor(config: BoxConfig) {
		this.setConfig(config);
	}

	setConfig(config: BoxConfig): void {
		this.centerX = config.centerX;
		this.centerY = config.centerY;
		this.width = config.width;
		this.height = config.height;
		this.rotation = config.rotation ?? 0;
		this.snapTargets();
		this.container.position.set(this.centerX, this.centerY);
		this.container.rotation = this.rotation;
		this.draw();
	}

	transform(config: BoxTransformConfig): Promise<void> {
		return new Promise((resolve) => {
			this.transitionTo(config, resolve);
		});
	}

	transitionTo(config: BoxTransformConfig, onDone?: () => void): void {
		this.fromCenterX = this.centerX;
		this.fromCenterY = this.centerY;
		this.fromWidth = this.width;
		this.fromHeight = this.height;
		this.fromRotation = this.rotation;

		if (config.centerX !== undefined) this.targetCenterX = config.centerX;
		if (config.centerY !== undefined) this.targetCenterY = config.centerY;
		if (config.width !== undefined) this.targetWidth = config.width;
		if (config.height !== undefined) this.targetHeight = config.height;
		if (config.rotation !== undefined) this.targetRotation = config.rotation;
		if (config.duration !== undefined) this.transitionDuration = config.duration;
		if (config.easing) this.transitionEasing = config.easing;

		this.transitionAge = 0;
		this.transitioning = true;
		this.onTransitionDone = onDone ?? null;
	}

	update(dt: number): void {
		if (!this.transitioning) return;

		this.transitionAge += dt;
		const t = this.transitionEasing(clamp(this.transitionAge / this.transitionDuration, 0, 1));

		this.centerX = lerp(this.fromCenterX, this.targetCenterX, t);
		this.centerY = lerp(this.fromCenterY, this.targetCenterY, t);
		this.width = lerp(this.fromWidth, this.targetWidth, t);
		this.height = lerp(this.fromHeight, this.targetHeight, t);
		this.rotation = lerp(this.fromRotation, this.targetRotation, t);

		if (this.transitionAge >= this.transitionDuration) {
			this.centerX = this.targetCenterX;
			this.centerY = this.targetCenterY;
			this.width = this.targetWidth;
			this.height = this.targetHeight;
			this.rotation = this.targetRotation;
			this.transitioning = false;
		}

		this.container.position.set(this.centerX, this.centerY);
		this.container.rotation = this.rotation;
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
		const local = rotate(sub(worldPoint, center), -this.rotation);
		const sw = this.strokeWidth;
		const clamped = {
			x: clamp(local.x, -this.width / 2 + sw + radius, this.width / 2 - sw - radius),
			y: clamp(local.y, -this.height / 2 + sw + radius, this.height / 2 - sw - radius),
		};
		return add(rotate(clamped, this.rotation), center);
	}

	private snapTargets(): void {
		this.fromCenterX = this.targetCenterX = this.centerX;
		this.fromCenterY = this.targetCenterY = this.centerY;
		this.fromWidth = this.targetWidth = this.width;
		this.fromHeight = this.targetHeight = this.height;
		this.fromRotation = this.targetRotation = this.rotation;
	}
}
