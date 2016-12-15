/// <reference path="game.utility.ts" />
//This file contains gameobject classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
module tanks {

	export interface IActorAnimation {
		name: string;
		count: number;
	}

	export interface IActor {
		position?: Coord;
		angle?: Angle;
		momentum?: Vector;
		acceleration?: number;
		size?: number;
		sprite?: Resource;
		turnrate?: number;
		anim?: IActorAnimation;
		zIndex?: EZindex;
		render?: boolean;
		collision?: Basics.Circle | Basics.Rect;
	}

	export class Actor {
		static _actors: Actor[] = [];
		public position: Coord = new Coord();
		public angle: Angle = new Angle();
		public momentum: Vector = new Vector();
		public acceleration: number = 0;
		public size: number = 0;
		public sprite: Resource = null;
		public anim: IActorAnimation = { name: "", count: 0 };
		public turnrate: number = 1;
		public zIndex: EZindex = EZindex.actor;
		public render: boolean = true;
		public collision: Basics.Circle | Basics.Rect = null;

		constructor(parameters: IActor = {}) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			Actor._actors.push(this);
		}
		//Do thing on each frame
		public update(): boolean {
			return false;
		}
		protected _die() {
			Actor._actors.splice(Actor._actors.indexOf(this), 1);
		}
		public die() {
			this._die();
		}
	}

	export interface IProjectile extends IActor {
		lifespan?: number;
		damage?: number;
		owner?: Player;
	}

	export class Projectile extends Actor {
		public lifespan: number = 1;
		public owner: Player = null;
		public damage: number = 34;
		public size = 8;
		public hit: boolean = false;
		static repeatFire: boolean = false;
		public sprite: Resource = Resource.get("bulletsprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public zIndex: EZindex = EZindex.projectile;
		public collision: Basics.Circle | Basics.Rect;

		constructor(parameters: IProjectile = {}) {
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
				if (self.hit) {
					Sound.get('sfxBulletHit').play();
				} else {
					Sound.get('sfxBulletBounce').play();
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
			self.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
			//die
			self._die();
		}
	}

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
		public projectileType = Projectile;
		public projectiles: Projectile[] = [];
		public sprite: Resource = Resource.get("tanksprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public momentum: Vector = new Vector(new Coord(), 2, 0.92);
		public acceleration: number = 0.05;
		public size: number = 32;
		public turnrate: number = 1;
		public canShoot: number = 0;
		public hitPoints: number = 100;
		public fireRate: number = 20;
		public maxProjectiles: number = 10;
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
			this.collision = new Basics.Circle(this.position, this.size / 2.2);
		}
		public update(): boolean {
			var self = this;
			var changes = false;

			if (self.hitPoints < 1) {
				Sound.get('sfxTankDie').play();
				self.die();
				alert("PLAYER " + (World.players.indexOf(self) * 1 + 1) + " IS DEAD!");
			}

			//cooldowns
			if (self.canShoot > 0) {
				self.canShoot--;
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

				self.angle.set(self.turnrate * turn);

				changes = true;
			}

			if (self.controls.shoot && self.canShoot < 1 && self.projectiles.length < self.maxProjectiles) {
				self.shoot();

				if (!self.projectileType.repeatFire) {
					self.controls.shoot = false;
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

		public shoot(): Player {
			this.canShoot = this.fireRate;

			this.projectileType.repeatFire;

			var cos = Math.cos(Angle.degreetoRadian(this.angle.degree));
			var sin = Math.sin(Angle.degreetoRadian(this.angle.degree));

			Sound.get('sfxBulletSpawn').play();

			var projectile = new this.projectileType({
				lifespan: 100,
				owner: this,
				position: new Coord(this.position.x + cos * 10, this.position.y + sin * 10),
				angle: new Angle(this.angle.degree),
				momentum: new Vector(new Coord(cos * 4, sin * 4), 4, 1)
			});

			this.projectiles.push(projectile);

			return this;
		}
	}
}
