import type { BattleEngine, BulletPattern } from "../lib/engine/battle-engine";
import { easeOutCubic } from "../lib/utils/easing";

export const circularConverge: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy } = e.box;
	const baseAngle = e.wave * 0.15;
	const spin = e.wave % 2 === 0 ? 0.4 : -0.4;
	const count = 8;
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + baseAngle;
		e.spawn({
			x: cx + Math.cos(angle) * 380,
			y: cy + Math.sin(angle) * 380,
			motions: [
				{
					type: "lerp",
					endPos: { x: cx + Math.cos(angle) * 70, y: cy + Math.sin(angle) * 70 },
					duration: 35,
					easing: easeOutCubic,
				},
				{ type: "wait", duration: 25, rotationSpeed: spin, scaleTo: 0.2 },
				{
					type: "vel",
					vel: { x: Math.cos(angle + Math.PI * 0.5) * 4, y: Math.sin(angle + Math.PI * 0.5) * 4 },
					duration: 160,
					rotationSpeed: 0.1,
				},
			],
			rotation: angle,
		});
	}
};

export const topBottomSqueeze: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy } = e.box;
	const spin = e.wave % 2 === 0 ? 0.4 : -0.4;
	const count = 6;
	for (let i = 0; i < count; i++) {
		const x = cx - 120 + (i / (count - 1)) * 240;
		for (const dir of [-1, 1]) {
			e.spawn({
				x,
				y: cy + dir * 350,
				motions: [
					{ type: "lerp", endPos: { x, y: cy + dir * 40 }, duration: 40, easing: easeOutCubic },
					{ type: "wait", duration: 20, rotationSpeed: spin, scaleTo: 0.3 },
					{ type: "vel", vel: { x: dir * 3.5, y: dir * -2 }, duration: 150, rotationSpeed: 0.15 },
				],
				rotation: dir > 0 ? Math.PI : 0,
			});
		}
	}
};

export const centerFirework: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy } = e.box;
	const baseAngle = e.wave * 0.15;
	const spin = e.wave % 2 === 0 ? 0.4 : -0.4;
	const count = 10;
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + baseAngle;
		const midX = cx + Math.cos(angle) * 130;
		const midY = cy + Math.sin(angle) * 130;
		const outAngle = angle + Math.PI;
		e.spawn({
			x: cx,
			y: cy,
			motions: [
				{ type: "lerp", endPos: { x: midX, y: midY }, duration: 30, easing: easeOutCubic },
				{ type: "wait", duration: 35, rotationSpeed: spin, scaleTo: 0.25 },
				{
					type: "vel",
					vel: { x: Math.cos(outAngle) * 3, y: Math.sin(outAngle) * 3 },
					duration: 180,
					rotationSpeed: 0.08,
				},
			],
			rotation: angle,
		});
	}
};

export const doubleSpiral: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy } = e.box;
	const baseAngle = e.wave * 0.15;
	const spin = e.wave % 2 === 0 ? 0.4 : -0.4;
	const count = 6;
	for (let arm = 0; arm < 2; arm++) {
		const armOffset = arm * Math.PI;
		const exitDir = arm === 0 ? 1 : -1;
		for (let i = 0; i < count; i++) {
			const angle = armOffset + (i / count) * Math.PI * 0.8 + baseAngle;
			const dist = 60 + i * 25;
			e.spawn({
				x: cx,
				y: cy,
				motions: [
					{
						type: "lerp",
						endPos: { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist },
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
				rotation: angle,
			});
		}
	}
};

export async function blasterWashingMachine(
	e: BattleEngine,
	count = 20,
	interval = 5,
): Promise<void> {
	const cx = e.box.centerX;
	const cy = e.box.centerY;
	const radius = 250;
	const step = (Math.PI * 2) / count;

	for (let i = 0; i < count; i++) {
		const angle = i * step;
		e.blast({
			x: cx + Math.cos(angle) * radius,
			y: cy + Math.sin(angle) * radius,
			angle: angle + Math.PI,
			chargeTime: 20,
			duration: 25,
			width: 28,
		});
		await e.wait(interval);
	}
	await e.wait(45);
}
