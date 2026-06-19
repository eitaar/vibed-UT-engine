export class Health {
	hp: number;
	maxHp: number;
	invincible = false;
	invincibleTimer = 0;
	invincibleDuration: number;

	constructor(maxHp: number, invincibleDuration = 40) {
		this.hp = maxHp;
		this.maxHp = maxHp;
		this.invincibleDuration = invincibleDuration;
	}

	hit(damage = 1): boolean {
		if (this.invincible) return false;
		this.hp = Math.max(0, this.hp - damage);
		this.invincible = true;
		this.invincibleTimer = this.invincibleDuration;
		return true;
	}

	get isDead(): boolean {
		return this.hp <= 0;
	}

	updateInvincibility(dt: number, age: number): number {
		if (!this.invincible) return 1;
		this.invincibleTimer -= dt;
		if (this.invincibleTimer <= 0) {
			this.invincible = false;
			return 1;
		}
		const fade = this.invincibleTimer / this.invincibleDuration;
		const wave = (Math.sin(age * 0.6) + 1) / 2;
		return 0.2 + wave * 0.5 * (1 - fade) + fade * 0.3;
	}
}
