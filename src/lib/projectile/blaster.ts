import { Container, Graphics } from "pixi.js";
import { easeInCubic, easeOutCubic, lerp } from "../utils/easing";
import type { Vec2 } from "../utils/vector";

export interface BlasterConfig {
	x: number;
	y: number;
	angle?: number;
	aimAtPlayer?: boolean;
	enterFrom?: "front" | "back";
	chargeTime?: number;
	duration?: number;
	width?: number;
	length?: number;
}

type BlasterPhase = "charge" | "fire" | "done";

export class Blaster {
	container = new Container();
	private emitter = new Graphics();
	private beam = new Graphics();
	private phase: BlasterPhase = "charge";
	private age = 0;
	readonly chargeTime: number;
	readonly duration: number;
	private beamWidth: number;
	private beamLength: number;
	private angle: number;

	private startX: number;
	private startY: number;
	private targetX: number;
	private targetY: number;
	private exitX: number;
	private exitY: number;
	private onFire: (() => void) | null;

	constructor(
		x: number,
		y: number,
		angle: number,
		chargeTime: number,
		duration: number,
		width: number,
		length: number,
		enterFrom: "front" | "back" = "back",
		onFire: (() => void) | null = null,
	) {
		this.chargeTime = chargeTime;
		this.duration = duration;
		this.beamWidth = width;
		this.beamLength = length;
		this.angle = angle;

		this.targetX = x;
		this.targetY = y;

		const slideDistance = 200;
		const sign = enterFrom === "front" ? 1 : -1;
		this.startX = x + Math.cos(angle) * slideDistance * sign;
		this.startY = y + Math.sin(angle) * slideDistance * sign;

		const exitDistance = 400;
		this.exitX = x - Math.cos(angle) * exitDistance;
		this.exitY = y - Math.sin(angle) * exitDistance;

		this.onFire = onFire;

		this.container.position.set(this.startX, this.startY);
		this.container.rotation = angle;

		this.beam.visible = false;
		this.container.addChild(this.beam, this.emitter);
	}

	get done(): boolean {
		return this.phase === "done";
	}

	get firing(): boolean {
		return this.phase === "fire";
	}

	get totalFrames(): number {
		return this.chargeTime + this.duration;
	}

	update(dt: number): void {
		this.age += dt;

		if (this.phase === "charge") {
			const t = easeOutCubic(Math.min(1, this.age / this.chargeTime));
			this.container.x = lerp(this.startX, this.targetX, t);
			this.container.y = lerp(this.startY, this.targetY, t);

			const flash = Math.sin(this.age * 0.8) > 0 ? 1 : 0.5;
			this.drawHead(t, flash);

			if (this.age >= this.chargeTime) {
				this.age = 0;
				this.phase = "fire";
				this.container.position.set(this.targetX, this.targetY);
				this.drawHead(1, 1);
				this.drawBeam();
				this.beam.visible = true;
				this.onFire?.();
			}
		} else if (this.phase === "fire") {
			const slideT = easeInCubic(Math.min(1, this.age / this.duration));
			this.container.x = lerp(this.targetX, this.exitX, slideT);
			this.container.y = lerp(this.targetY, this.exitY, slideT);

			const fadeStart = this.duration * 0.65;
			if (this.age >= fadeStart) {
				const t = (this.age - fadeStart) / (this.duration - fadeStart);
				this.beam.scale.y = 1 - t;
				this.emitter.scale.set(1 - t);
				this.emitter.alpha = 1 - t;
			}

			if (this.age >= this.duration) {
				this.phase = "done";
				this.container.visible = false;
			}
		}
	}

	checkHit(target: { pos: Vec2; radius: number }): boolean {
		if (this.phase !== "fire") return false;
		const dx = target.pos.x - this.container.x;
		const dy = target.pos.y - this.container.y;
		const cos = Math.cos(-this.angle);
		const sin = Math.sin(-this.angle);
		const localX = dx * cos - dy * sin;
		const localY = dx * sin + dy * cos;

		const hw = (this.beamWidth * this.beam.scale.y) / 2;
		const closestX = Math.max(0, Math.min(this.beamLength, localX));
		const closestY = Math.max(-hw, Math.min(hw, localY));
		const ddx = localX - closestX;
		const ddy = localY - closestY;
		return ddx * ddx + ddy * ddy < target.radius * target.radius;
	}

	private drawHead(scale: number, alpha: number): void {
		this.emitter.clear();
		const s = (this.beamWidth / 2 + 6) * scale;
		const mouthGap = s * 0.25;

		// upper jaw
		this.emitter.poly([
			-s * 1.6, -s * 1.2,
			-s * 0.3, -s * 1.2,
			s * 0.6, -mouthGap,
			-s * 0.3, -mouthGap,
			-s * 1.6, -s * 0.4,
		]);
		this.emitter.fill({ color: 0xffffff, alpha });

		// lower jaw
		this.emitter.poly([
			-s * 1.6, s * 0.4,
			-s * 0.3, mouthGap,
			s * 0.6, mouthGap,
			-s * 0.3, s * 1.2,
			-s * 1.6, s * 1.2,
		]);
		this.emitter.fill({ color: 0xffffff, alpha });
	}

	private drawBeam(): void {
		this.beam.clear();
		this.beam.rect(0, -this.beamWidth * 0.65, this.beamLength, this.beamWidth * 1.3);
		this.beam.fill({ color: 0xffffff, alpha: 0.25 });
		this.beam.rect(0, -this.beamWidth / 2, this.beamLength, this.beamWidth);
		this.beam.fill(0xffffff);
	}
}
