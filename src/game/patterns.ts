import type { BattleEngine, BulletPattern } from "../lib/engine/battle-engine";
import { easeInCubic, easeOutCubic } from "../lib/utils/easing";

export const circularConverge: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy } = e.box;
	const baseAngle = e.wave * 0.15;
	const spin = e.wave % 2 === 0 ? 0.4 : -0.4;
	const count = 8;
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + baseAngle;
		e.attack.spawn({
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
			e.attack.spawn({
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
		e.attack.spawn({
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
			e.attack.spawn({
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
		e.attack.blast({
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

// ===================== 骨攻撃 =====================

export const boneWall: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;
	const horizontal = e.wave % 2 === 0;
	const dir = e.wave % 4 < 2 ? -1 : 1;

	const count = horizontal ? 14 : 10;
	const gap1 = Math.floor(Math.random() * (count - 2)) + 1;
	const gap2 = gap1 + 1;

	for (let i = 0; i < count; i++) {
		if (i === gap1 || i === gap2) continue;

		if (horizontal) {
			const x = cx - bw / 2 + ((i + 0.5) / count) * bw;
			const startY = cy + dir * (bh / 2 + 60);
			e.attack.spawn({
				x, y: startY,
				motions: [{ type: "vel", vel: { x: 0, y: -dir * 3.5 }, duration: 200 }],
				shape: { kind: "rect", width: 10, height: 50 },
			});
		} else {
			const y = cy - bh / 2 + ((i + 0.5) / count) * bh;
			const startX = cx + dir * (bw / 2 + 60);
			e.attack.spawn({
				x: startX, y,
				motions: [{ type: "vel", vel: { x: -dir * 3.5, y: 0 }, duration: 200 }],
				shape: { kind: "rect", width: 50, height: 10 },
				rotation: 0,
			});
		}
	}
};

export async function groundBones(
	e: BattleEngine,
	count = 12,
	interval = 4,
): Promise<void> {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;
	const bottom = cy + bh / 2;

	for (let i = 0; i < count; i++) {
		const x = cx - bw / 2 + ((i + 0.5) / count) * bw;
		const boneHeight = 40 + Math.random() * 100;
		const riseY = bottom - boneHeight;

		e.attack.spawn({
			x, y: bottom + 30,
			motions: [
				{ type: "lerp", endPos: { x, y: riseY }, duration: 6, easing: easeOutCubic },
				{ type: "wait", duration: 35 },
				{ type: "lerp", endPos: { x, y: bottom + 30 }, duration: 8, easing: easeInCubic },
			],
			shape: { kind: "rect", width: 12, height: boneHeight },
		});
		await e.wait(interval);
	}
	await e.wait(40);
}

export async function boneColumnRush(
	e: BattleEngine,
	count = 10,
	interval = 8,
): Promise<void> {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;

	for (let i = 0; i < count; i++) {
		const fromLeft = i % 2 === 0;
		const startX = cx + (fromLeft ? -(bw / 2 + 80) : bw / 2 + 80);
		const y = cy - bh / 2 + ((i + 0.5) / count) * bh;
		const speed = 6 + Math.random() * 2;

		e.attack.spawn({
			x: startX, y,
			motions: [{ type: "vel", vel: { x: (fromLeft ? 1 : -1) * speed, y: 0 }, duration: 160 }],
			shape: { kind: "rect", width: 70, height: 10 },
		});
		await e.wait(interval);
	}
	await e.wait(30);
}

export const boneCage: BulletPattern = (e) => {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;
	const safeRadius = 35;
	const boneCount = 6;

	for (const side of ["top", "bottom", "left", "right"] as const) {
		for (let i = 0; i < boneCount; i++) {
			let startX: number, startY: number, endX: number, endY: number;
			let boneW: number, boneH: number;

			const spread = (i + 0.5) / boneCount;

			if (side === "top" || side === "bottom") {
				const dir = side === "top" ? -1 : 1;
				startX = cx - bw / 2 + spread * bw;
				startY = cy + dir * (bh / 2 + 40);
				endX = startX;
				endY = cy + dir * safeRadius;
				boneW = 10;
				boneH = 45;
			} else {
				const dir = side === "left" ? -1 : 1;
				startY = cy - bh / 2 + spread * bh;
				startX = cx + dir * (bw / 2 + 40);
				endY = startY;
				endX = cx + dir * safeRadius;
				boneW = 45;
				boneH = 10;
			}

			e.attack.spawn({
				x: startX, y: startY,
				motions: [
					{ type: "lerp", endPos: { x: endX, y: endY }, duration: 30, easing: easeOutCubic },
					{ type: "wait", duration: 40 },
					{
						type: "vel",
						vel: { x: (startX - cx) * 0.08, y: (startY - cy) * 0.08 },
						duration: 120,
					},
				],
				shape: { kind: "rect", width: boneW, height: boneH },
			});
		}
	}
};

export async function boneWave(
	e: BattleEngine,
	waves = 3,
	bonesPerWave = 16,
	interval = 3,
): Promise<void> {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;

	for (let w = 0; w < waves; w++) {
		const fromLeft = w % 2 === 0;
		const startX = cx + (fromLeft ? -(bw / 2 + 60) : bw / 2 + 60);
		const dir = fromLeft ? 1 : -1;
		const speed = 3 + w * 0.5;

		for (let i = 0; i < bonesPerWave; i++) {
			const waveOffset = Math.sin((i / bonesPerWave) * Math.PI * 2) * (bh * 0.35);
			const y = cy + waveOffset;

			e.attack.spawn({
				x: startX, y,
				motions: [{ type: "vel", vel: { x: dir * speed, y: 0 }, duration: 200 }],
				shape: { kind: "rect", width: 10, height: 40 },
			});
			await e.wait(interval);
		}
		await e.wait(20);
	}
	await e.wait(30);
}

export async function boneStab(
	e: BattleEngine,
	count = 8,
	interval = 12,
): Promise<void> {
	const { centerX: cx, centerY: cy, width: bw, height: bh } = e.box;
	const edges = ["top", "bottom", "left", "right"] as const;

	for (let i = 0; i < count; i++) {
		const edge = edges[Math.floor(Math.random() * edges.length)];
		const px = e.player.pos.x;
		const py = e.player.pos.y;
		const jitter = (Math.random() - 0.5) * 40;

		let startX: number, startY: number, targetX: number, targetY: number;
		let boneW: number, boneH: number;

		if (edge === "top") {
			startX = px + jitter; startY = cy - bh / 2 - 50;
			targetX = startX; targetY = py;
			boneW = 10; boneH = 55;
		} else if (edge === "bottom") {
			startX = px + jitter; startY = cy + bh / 2 + 50;
			targetX = startX; targetY = py;
			boneW = 10; boneH = 55;
		} else if (edge === "left") {
			startX = cx - bw / 2 - 50; startY = py + jitter;
			targetX = px; targetY = startY;
			boneW = 55; boneH = 10;
		} else {
			startX = cx + bw / 2 + 50; startY = py + jitter;
			targetX = px; targetY = startY;
			boneW = 55; boneH = 10;
		}

		e.attack.spawn({
			x: startX, y: startY,
			motions: [
				{ type: "lerp", endPos: { x: targetX, y: targetY }, duration: 5, easing: easeInCubic },
				{ type: "wait", duration: 8 },
				{ type: "lerp", endPos: { x: startX, y: startY }, duration: 6, easing: easeInCubic },
			],
			shape: { kind: "rect", width: boneW, height: boneH },
		});
		await e.wait(interval);
	}
	await e.wait(20);
}
