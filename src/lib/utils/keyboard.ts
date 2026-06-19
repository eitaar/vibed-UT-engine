export type Key =
	| "ArrowUp"
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "z"
	| "x"
	| "Shift"
	| "Enter"
	| "Escape"
	| (string & {});

const current = new Set<string>();
const previous = new Set<string>();
let initialized = false;

export function initKeyboard(): void {
	if (initialized) return;
	initialized = true;

	window.addEventListener("keydown", (e) => {
		current.add(e.key);
	});

	window.addEventListener("keyup", (e) => {
		current.delete(e.key);
	});

	window.addEventListener("blur", () => {
		current.clear();
	});
}

export function updateKeyboard(): void {
	previous.clear();
	for (const key of current) {
		previous.add(key);
	}
}

export function isDown(key: Key): boolean {
	return current.has(key);
}

export function isJustPressed(key: Key): boolean {
	return current.has(key) && !previous.has(key);
}

export function isJustReleased(key: Key): boolean {
	return !current.has(key) && previous.has(key);
}

export function getDirection(): { x: number; y: number } {
	let x = 0;
	let y = 0;
	if (current.has("ArrowLeft")) x -= 1;
	if (current.has("ArrowRight")) x += 1;
	if (current.has("ArrowUp")) y -= 1;
	if (current.has("ArrowDown")) y += 1;
	return { x, y };
}
