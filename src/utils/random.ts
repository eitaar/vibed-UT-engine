export function float(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

export function int(min: number, max: number): number {
	return Math.floor(float(min, max + 1));
}

export function pick<T>(array: readonly T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function chance(probability: number): boolean {
	return Math.random() < probability;
}

export function angleRad(): number {
	return Math.random() * Math.PI * 2;
}

export function shuffle<T>(array: readonly T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
