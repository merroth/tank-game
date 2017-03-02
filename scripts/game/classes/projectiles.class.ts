/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//Projectiles contains classes for each kind of projectile in the game
//A projectile is a self propelling game object without direct user control, usually intended for dealing damage
module tanks {

	export interface IProjectile extends IActor {
		//Obligatory field
		owner: Weapon;
		//Optional fields
		lifespan?: number;
		damage?: number;
	}

	export class Projectile extends Actor {
		public lifespan: number = 1;
		public owner: Weapon = null;
		public damage: number = 0;
		public size = 8;
		public hit: boolean = false;
		static repeatFire: boolean = false;
		public sprite: Resource = Resource.get("bulletSprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public zIndex: EZindex = EZindex.projectile;
		public collision: Basics.Circle | Basics.Rect;
		//Sound effects associated with the projectile, can be set to 'null' to make no sound.
		//Perhaps the check for null should be moved to the Sound class as a more general solution
		//instead of just checking wherever when we're just about to use it.
		public sfx = { spawn: Sound.get("sfxBulletSpawn"), hit: Sound.get("sfxBulletHit"), bounce: Sound.get("sfxBulletBounce") };

		constructor(parameters: IProjectile = { owner: null }) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			this.collision = new Basics.Circle(this.position, this.size / 2);
		}
		public update(): boolean {
			var self = this;
			self.lifespan--;
			self.anim.count += 1;
			if (self.lifespan < 1) {
				if (self.hit && self.sfx.hit != null) {
					self.sfx.hit.play();
				} else if (self.sfx.bounce != null) {
					self.sfx.bounce.play();
				}

				self.die();
				return false;
			}
			self.position.x += self.momentum.get().x;
			self.position.y += self.momentum.get().y;
			return true;
		}
		public die() {
			var self = this;
			//Remove from owner
			self.owner.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
			self.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
			//die
			self._die();
		}
	}

	//Instances

	export class FlameThrowerProjectile extends Projectile {
		public damage: number = 10;
		public sprite: Resource = Resource.get("bulletBurningSprite");
		public sfx = { spawn: Sound.get("sfxFlamethrowerSpawn"), hit: Sound.get("sfxBulletHit"), bounce: null };
	}

	export class MainGunProjectile extends Projectile {
		public damage: number = 34;
	}
}
