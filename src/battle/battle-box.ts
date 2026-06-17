import { Graphics } from "pixi.js";
import { topLeft } from "../utils/vector";

function genBoxProp(
	x: number,
	y: number,
	width: number,
	height: number,
): { x: number; y: number; width: number; height: number } {
	const cord = topLeft({ x: x, y: y }, width, height);
	return { x: cord.x, y: cord.y, width: width, height: height };
}

const boxProp = genBoxProp(400, 490, 750, 320);

export class BattleBox {
	container: Graphics = new Graphics();
	x: number = boxProp.x;
	y: number = boxProp.y;
	width: number = boxProp.width;
	height: number = boxProp.height;
	strokeWidth: number = 6;
	constructor() {
		this.draw();
	}
	draw(): void {
		this.container.rect(this.x, this.y, this.width, this.height);
		this.container.stroke({ width: this.strokeWidth, color: 0xffffff });
	}
	getInnerBounds(): { left: number; top: number; right: number; bottom: number } {
		return {
			left: this.x + this.strokeWidth,
			top: this.y + this.strokeWidth,
			right: this.x + this.width - this.strokeWidth,
			bottom: this.y + this.height - this.strokeWidth,
		};
	}
}
