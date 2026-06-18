import { type Application, Container } from "pixi.js";
import { BattleBox } from "../battle/battle-box";
import { checkCollisions } from "../battle/collision";
import { Player } from "../battle/player";
import { ProjectilePool } from "../battle/projectile-pool";
import type { Scene } from "../core/scene";
import type { SceneManager } from "../core/scene-manager";
import { easeInQuad, easeOutCubic } from "../utils/easing";

const battleBox = new BattleBox();
const pool = new ProjectilePool();
const player = new Player({ x: battleBox.centerX, y: battleBox.centerY });
const cx = battleBox.centerX;
const cy = battleBox.centerY;

export class BattleScene implements Scene {
	container = new Container();
	timer = 0;
	wave = 0;

	async init(_app: Application, _sceneManager: SceneManager): Promise<void> {
		this.container.addChild(battleBox.container);
		this.container.addChild(pool.container);
		this.container.addChild(player.gfx);
	}

	update(dt: number) {
		this.timer += dt;

		if (this.timer >= 80) {
			this.timer = 0;
			const phase = this.wave % 4;
			const spin = this.wave % 2 === 0 ? 0.4 : -0.4;
			const baseAngle = this.wave * 0.15;

			if (phase === 0) {
				// 外から集まって時計回りに散る
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
			} else if (phase === 1) {
				// 上下から挟み撃ち → 横に分裂
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
			} else if (phase === 2) {
				// 中心から花火のように展開 → 一旦停止 → プレイヤー方向に再発射
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
			} else {
				// 螺旋 — 2重渦巻きが逆回転で射出
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

			this.wave++;
		}

		player.update(dt, (pos, radius) => battleBox.constrainPoint(pos, radius));
		pool.update(dt);

		const hits = checkCollisions(player, pool.getAlive());
		if (hits.length > 0) {
			player.gfx.alpha = 0.3;
		} else {
			player.gfx.alpha = 1;
		}
	}

	destroy() {
		this.container.destroy({ children: true });
	}
}
