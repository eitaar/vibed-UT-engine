import { Container, Graphics, Text } from "pixi.js";
import { lerp } from "../utils/easing";

export class HpBar {
	container = new Container();
	private bg = new Graphics();
	private bar = new Graphics();
	private trailBar = new Graphics();
	private label: Text;
	private width: number;
	private height: number;
	private displayRatio = 1;
	private trailRatio = 1;

	constructor(x: number, y: number, width = 200, height = 20) {
		this.width = width;
		this.height = height;

		this.label = new Text({ text: "HP", style: { fontSize: 18, fill: 0xffffff, fontFamily: "DeterminationMono" } });
		this.label.x = -40;
		this.label.y = -2;

		this.container.position.set(x, y);
		this.container.addChild(this.bg, this.trailBar, this.bar, this.label);
		this.drawBg();
	}

	private drawBg(): void {
		this.bg.rect(0, 0, this.width, this.height);
		this.bg.fill(0x333333);
	}

	update(hp: number, maxHp: number): void {
		const targetRatio = Math.max(0, hp / maxHp);
		this.displayRatio = lerp(this.displayRatio, targetRatio, 0.15);
		this.trailRatio = lerp(this.trailRatio, targetRatio, 0.04);

		this.trailBar.clear();
		this.trailBar.rect(0, 0, this.width * this.trailRatio, this.height);
		this.trailBar.fill(0x880000);

		this.bar.clear();
		this.bar.rect(0, 0, this.width * this.displayRatio, this.height);
		this.bar.fill(0xffff00);
	}
}
