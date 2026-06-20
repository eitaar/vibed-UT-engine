import { Assets, Container, Sprite } from "pixi.js";

export class Enemy {
	container = new Container();
	sprite!: Sprite;
	name: string;
	dialogueLines: string[];
	private baseY: number;
	private age = 0;

	constructor(name: string, dialogueLines: string[], x: number, y: number) {
		this.name = name;
		this.dialogueLines = dialogueLines;
		this.container.position.set(x, y);
		this.baseY = y;
	}

	async init(spritePath: string, scale = 2.5): Promise<void> {
		const texture = await Assets.load(spritePath);
		texture.source.scaleMode = "nearest";
		this.sprite = new Sprite(texture);
		this.sprite.anchor.set(0.5);
		this.sprite.scale.set(scale);
		this.container.addChild(this.sprite);
	}

	update(dt: number): void {
		this.age += dt;
		this.container.y = this.baseY + Math.sin(this.age * 0.04) * 8;
	}
}
