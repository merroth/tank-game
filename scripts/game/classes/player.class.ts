/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains the player class
//The player class describes a players "Actor", deals in control schemes and holds important information like hitPoints
//Notice that player classes should never produce a "Projectile" on its own, but rather use "weaponBanks" as an in-between
module tanks {
	export interface IPlayerControls {
		forward: boolean;
		backward: boolean;
		left: boolean;
		right: boolean;
		shoot: boolean;
	}

	export interface IPlayer extends IActor {
		controls?: IPlayerControls;
	}

	export class Player extends Actor {
		public weaponBanks: Weapon[] = [];
		public projectiles: Projectile[] = [];
		public sprite: Resource = Resource.get("tankRedSprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public momentum: Vector = new Vector(new Coord(), 2, 0.92);
		public acceleration: number = 0.05;
		public size: number = 32;
		public turnrate: number = 1;
		public hitPoints: number = tankApp.userOptions.playerHealth;
		public controls: IPlayerControls = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			shoot: false
		}
		public collision: Basics.Circle | Basics.Rect;

		constructor(parameters: IPlayer = {}) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			this.collision = new Basics.Rect(this.position, this.size * 0.9, this.size * 0.7, this.angle);

			//These are "Proof of concept" for gun placement and gun modification.
			//Real implementations should have a derived subclass to reference directly
			//instead of modifying the existing one directly
			this.weaponBanks.push(
				//Flamethrower
				new WeaponTankFlameThrower({
					position: new Coord(10, 10),
					owner: this,
					angle: new Angle(180),
				}),
				//Main gun
				new WeaponTankMainGun({
					owner: this,
					position: new Coord(10, 10),
				})
			);

			this.collision.distributePoints();
		}
		public update(): boolean {
			var self = this;
			var changes = false;

			if (self.hitPoints < 1) {
				Sound.get('sfxTankDie').play();
				self.die();
				console.log("PLAYER " + (World.players.indexOf(self) * 1 + 1) + " IS DEAD!");
			}

			//cooldowns
			for (var b = 0; b < self.weaponBanks.length; b++) {
				var bank = self.weaponBanks[b];
				bank.cool();
			}

			var cos = Math.cos(Angle.degreetoRadian(self.angle.get()));
			var sin = Math.sin(Angle.degreetoRadian(self.angle.get()));

			//Controls
			if (Math.abs(self.momentum.velocity.x) + Math.abs(self.momentum.velocity.y) > 0) {
				self.momentum.degrade();

				self.position.x += self.momentum.get().x;
				self.position.y += self.momentum.get().y;

				changes = true;
			}
			if (self.controls.forward || self.controls.backward) {
				var direction = (self.controls.backward ? 0 - 1 : 1);
				self.anim.name = "move";
				self.anim.count += direction;

				self.momentum.addForce(new Coord(
					(self.acceleration * cos) * direction,
					(self.acceleration * sin) * direction
				));

				self.position.x += self.momentum.get().x;
				self.position.y += self.momentum.get().y;
				changes = true;
			}
			if (self.controls.left || self.controls.right) {
				var turn = (self.controls.left ? 0 - 1 : 1);
				if (!self.controls.forward && !self.controls.backward) {
					self.anim.name = "turn";
					self.anim.count += turn;
				}

				self.angle.add(self.turnrate * turn);

				changes = true;
			}

			if (self.controls.shoot) {
				for (var w = 0; w < self.weaponBanks.length; w++) {
					var bank = self.weaponBanks[w];
					bank.shoot();
				}
				changes = true;
			}

			if (changes) {
				//Fix self animation overflow
				var animation = self.sprite.descriptor.anim
					.filter(function findAnimation(anim) {
						return anim.name === self.anim.name;
					})[0];
				var animationState = Math.floor(
					self.anim.count /
					animation.rate
				);
				if (animationState < 0) {
					self.anim.count = (animation.count * animation.rate) - 1;
				} else if (animationState >= animation.count) {
					self.anim.count = 0;
				}
			}

			return changes;
		}
	}
}
