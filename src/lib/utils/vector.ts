export interface Vec2 {
	x: number;
	y: number;
}

export function vec2(x = 0, y = 0): Vec2 {
	return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, s: number): Vec2 {
	return { x: v.x * s, y: v.y * s };
}

export function length(v: Vec2): number {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vec2): Vec2 {
	const len = length(v);
	if (len === 0) return { x: 0, y: 0 };
	return { x: v.x / len, y: v.y / len };
}

export function distance(a: Vec2, b: Vec2): number {
	return length(sub(a, b));
}

export function angle(from: Vec2, to: Vec2): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

export function fromAngle(radians: number, magnitude = 1): Vec2 {
	return { x: Math.cos(radians) * magnitude, y: Math.sin(radians) * magnitude };
}

export function rotate(v: Vec2, radians: number): Vec2 {
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
	return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function topLeft(center: Vec2, width: number, height: number): Vec2 {
	return { x: center.x - width / 2, y: center.y - height / 2 };
}
