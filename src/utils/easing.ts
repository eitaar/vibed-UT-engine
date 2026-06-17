export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function easeInQuad(t: number): number {
	return t * t;
}

export function easeOutQuad(t: number): number {
	return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeInCubic(t: number): number {
	return t * t * t;
}

export function easeOutCubic(t: number): number {
	return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function easeInSine(t: number): number {
	return 1 - Math.cos((t * Math.PI) / 2);
}

export function easeOutSine(t: number): number {
	return Math.sin((t * Math.PI) / 2);
}

export function easeInOutSine(t: number): number {
	return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeOutElastic(t: number): number {
	if (t === 0 || t === 1) return t;
	return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

export function easeOutBounce(t: number): number {
	if (t < 1 / 2.75) {
		return 7.5625 * t * t;
	} else if (t < 2 / 2.75) {
		return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
	} else if (t < 2.5 / 2.75) {
		return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
	} else {
		return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
	}
}
