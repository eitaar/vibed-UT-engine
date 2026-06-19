import type { Container } from "pixi.js";

export class ScreenShake {
	private target: Container;
	private intensity = 0;
	private duration = 0;
	private age = 0;

	constructor(target: Container) {
		this.target = target;
	}

	trigger(intensity: number, duration: number): void {
		this.intensity = intensity;
		this.duration = duration;
		this.age = 0;
	}

	get active(): boolean {
		return this.duration > 0;
	}

	update(dt: number): void {
		if (this.duration <= 0) return;

		this.age += dt;
		if (this.age >= this.duration) {
			this.duration = 0;
			this.target.position.set(0, 0);
		} else {
			const fade = 1 - this.age / this.duration;
			const i = this.intensity * fade;
			this.target.position.set((Math.random() - 0.5) * 2 * i, (Math.random() - 0.5) * 2 * i);
		}
	}
}
