import { Text } from "pixi.js";
import { isJustPressed } from "../utils/keyboard";
import type { BattleBox } from "./battle-box";

export class Dialog {
	private text: Text;
	private box: BattleBox;
	private lines: string[] = [];
	private lineIndex = 0;
	private charIndex = 0;
	private charTimer = 0;
	private charInterval = 2;
	private active = false;
	private onComplete: (() => void) | null = null;

	constructor(box: BattleBox) {
		this.box = box;
		this.text = new Text({
			text: "",
			style: {
				fontSize: 22,
				fill: 0xffffff,
				fontFamily: "DeterminationMono",
				wordWrap: true,
				wordWrapWidth: box.width - 40,
			},
		});
		this.text.visible = false;
		box.container.addChild(this.text);
	}

	start(lines: string[], onComplete: () => void): void {
		this.lines = lines;
		this.lineIndex = 0;
		this.charIndex = 0;
		this.charTimer = 0;
		this.active = true;
		this.onComplete = onComplete;
		this.text.visible = true;
		this.text.text = "";
	}

	get done(): boolean {
		return !this.active;
	}

	update(dt: number): void {
		if (!this.active) return;

		this.text.style.wordWrapWidth = this.box.width - 40;
		this.text.x = -this.box.width / 2 + 20;
		this.text.y = -this.box.height / 2 + 18;

		const currentLine = this.lines[this.lineIndex];
		const typing = this.charIndex < currentLine.length;

		if (typing) {
			this.charTimer += dt;
			while (this.charTimer >= this.charInterval && this.charIndex < currentLine.length) {
				this.charTimer -= this.charInterval;
				this.charIndex++;
				this.text.text = currentLine.slice(0, this.charIndex);
			}

			if (isJustPressed("z")) {
				this.charIndex = currentLine.length;
				this.text.text = currentLine;
			}
		} else if (isJustPressed("z")) {
			this.lineIndex++;
			if (this.lineIndex >= this.lines.length) {
				this.active = false;
				this.text.visible = false;
				this.onComplete?.();
			} else {
				this.charIndex = 0;
				this.charTimer = 0;
				this.text.text = "";
			}
		}
	}
}
