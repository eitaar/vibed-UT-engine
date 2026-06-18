import { Assets, Container, Sprite } from "pixi.js";
import { easeOutCubic } from "../utils/easing";
import type { ProjectilePool } from "./projectile-pool";

export type BulletPattern = (pool: ProjectilePool, cx: number, cy: number, wave: number) => void;

export function circularConverge(pool: ProjectilePool, cx: number, cy: number, wave: number): void {
	const baseAngle = wave * 0.15;
	const spin = wave % 2 === 0 ? 0.4 : -0.4;
	const count = 8;
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + baseAngle;
		pool.spawn(
			{ x: cx + Math.cos(angle) * 380, y: cy + Math.sin(angle) * 380 },
			[
				{
					type: "lerp",
					endPos: { x: cx + Math.cos(angle) * 70, y: cy + Math.sin(angle) * 70 },
					duration: 35,
					easing: easeOutCubic,
				},
				{ type: "wait", duration: 25, rotationSpeed: spin, scaleTo: 0.2 },
				{
					type: "vel",
					vel: {
						x: Math.cos(angle + Math.PI * 0.5) * 4,
						y: Math.sin(angle + Math.PI * 0.5) * 4,
					},
					duration: 160,
					rotationSpeed: 0.1,
				},
			],
			{ kind: "rect", width: 8, height: 45 },
			angle,
			0,
		);
	}
}

export function topBottomSqueeze(pool: ProjectilePool, cx: number, cy: number, wave: number): void {
	const spin = wave % 2 === 0 ? 0.4 : -0.4;
	const count = 6;
	for (let i = 0; i < count; i++) {
		const x = cx - 120 + (i / (count - 1)) * 240;
		for (const dir of [-1, 1]) {
			pool.spawn(
				{ x, y: cy + dir * 350 },
				[
					{
						type: "lerp",
						endPos: { x, y: cy + dir * 40 },
						duration: 40,
						easing: easeOutCubic,
					},
					{ type: "wait", duration: 20, rotationSpeed: spin, scaleTo: 0.3 },
					{
						type: "vel",
						vel: { x: dir * 3.5, y: dir * -2 },
						duration: 150,
						rotationSpeed: 0.15,
					},
				],
				{ kind: "rect", width: 8, height: 45 },
				dir > 0 ? Math.PI : 0,
				0,
			);
		}
	}
}

export function centerFirework(pool: ProjectilePool, cx: number, cy: number, wave: number): void {
	const baseAngle = wave * 0.15;
	const spin = wave % 2 === 0 ? 0.4 : -0.4;
	const count = 10;
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + baseAngle;
		const midX = cx + Math.cos(angle) * 130;
		const midY = cy + Math.sin(angle) * 130;
		const outAngle = angle + Math.PI;
		pool.spawn(
			{ x: cx, y: cy },
			[
				{ type: "lerp", endPos: { x: midX, y: midY }, duration: 30, easing: easeOutCubic },
				{ type: "wait", duration: 35, rotationSpeed: spin, scaleTo: 0.25 },
				{
					type: "vel",
					vel: { x: Math.cos(outAngle) * 3, y: Math.sin(outAngle) * 3 },
					duration: 180,
					rotationSpeed: 0.08,
				},
			],
			{ kind: "rect", width: 8, height: 45 },
			angle,
			0,
		);
	}
}

export function doubleSpiral(pool: ProjectilePool, cx: number, cy: number, wave: number): void {
	const baseAngle = wave * 0.15;
	const spin = wave % 2 === 0 ? 0.4 : -0.4;
	const count = 6;
	for (let arm = 0; arm < 2; arm++) {
		const armOffset = arm * Math.PI;
		const exitDir = arm === 0 ? 1 : -1;
		for (let i = 0; i < count; i++) {
			const angle = armOffset + (i / count) * Math.PI * 0.8 + baseAngle;
			const dist = 60 + i * 25;
			const endX = cx + Math.cos(angle) * dist;
			const endY = cy + Math.sin(angle) * dist;
			pool.spawn(
				{ x: cx, y: cy },
				[
					{
						type: "lerp",
						endPos: { x: endX, y: endY },
						duration: 25 + i * 6,
						easing: easeOutCubic,
					},
					{ type: "wait", duration: 20, rotationSpeed: spin, scaleTo: 0.3 },
					{
						type: "vel",
						vel: {
							x: Math.cos(angle + exitDir * Math.PI * 0.5) * 4.5,
							y: Math.sin(angle + exitDir * Math.PI * 0.5) * 4.5,
						},
						duration: 160,
						rotationSpeed: exitDir * 0.2,
					},
				],
				{ kind: "rect", width: 8, height: 45 },
				angle,
				0,
			);
		}
	}
}

export class Enemy {
	container = new Container();
	sprite!: Sprite;
	name: string;
	dialogueLines: string[];
	patterns: BulletPattern[];
	private baseY: number;
	private age = 0;

	constructor(name: string, dialogueLines: string[], patterns: BulletPattern[], x: number, y: number) {
		this.name = name;
		this.dialogueLines = dialogueLines;
		this.patterns = patterns;
		this.container.position.set(x, y);
		this.baseY = y;
	}

	async init(): Promise<void> {
		const texture = await Assets.load("src/assets/img/sprite.png");
		texture.source.scaleMode = "nearest";
		this.sprite = new Sprite(texture);
		this.sprite.anchor.set(0.5);
		this.sprite.scale.set(2.5);
		this.container.addChild(this.sprite);
	}

	update(dt: number): void {
		this.age += dt;
		this.container.y = this.baseY + Math.sin(this.age * 0.04) * 8;
	}
}
