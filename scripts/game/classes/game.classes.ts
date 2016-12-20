/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
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
		owner?: Weapon;
	}

	export class Projectile extends Actor {
		public lifespan: number = 1;
		public owner: Weapon = null;
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
			self.owner.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
			self.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
			//die
			self._die();
		}
	}

	export interface IWeapon extends IActor {
		lifespan?: number;
		projectileType?: Projectile;
		fireArc?: Angle;
		angle?: Angle;
		position?: Coord;
		owner?: Player;
		hitpoint?: number;
		fireRateMax?: number;
		fireRate?: number;
		maxProjectiles?: number;
		speed?: number;
	}
	export class Weapon extends Actor {
		//Lifespan of projectiles
		public lifespan: number = 100;
		//Type of projectile fired (This contains projectile relevant data like damage)
		public projectileType = Projectile;
		//List of fired projectiles
		public projectiles: Projectile[] = [];
		//Bullet spread by angle
		public fireArc: Angle = new Angle();
		//Weapon angle (as offset to parent angle)
		public angle: Angle = new Angle();
		//Position on parent (as offset by angle, numbers should be 2 equal numbers)
		public position: Coord = new Coord();
		//A reference to parent
		public owner: Player = null;
		//If this weapon can be destroyed
		public hitpoint: number = Infinity;
		//Time between shots
		public fireRateMax: number = 20;
		//Countdown between shots
		public fireRate: number = 0;
		//Maximum allowed projectiles from this weapon at any given moment
		public maxProjectiles: number = Infinity;
		//Does this weapon have a renderable part?
		public render: boolean = false;
		//Speed of projectiles fired by this weapon
		public speed: number = 4;
		constructor(parameters: IWeapon = {}) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
		}
		public update(): boolean {
			var self = this;
			self.cool();
			return false;
		}
		public cool(amount: number = 1) {
			if (this.fireRate > 0) {
				this.fireRate -= amount;
			}
			return this;
		}
		public shoot(): Weapon {
			var self = this;
			if (self.fireRate < 1 && self.projectiles.length < self.maxProjectiles) {
				self.fireRate = self.fireRateMax * 1;

				var arcDegree = (Math.random() * self.fireArc.degree) - (self.fireArc.degree / 2);

				var degrees = self.owner.angle.degree + self.angle.degree + arcDegree;

				var cos = Math.cos(Angle.degreetoRadian(degrees));
				var sin = Math.sin(Angle.degreetoRadian(degrees));

				Sound.get('sfxBulletSpawn').play();

				var projectile = new self.projectileType({
					lifespan: self.lifespan,
					owner: self,
					position: new Coord(self.owner.position.x + cos * self.position.x, self.owner.position.y + sin * self.position.y),
					angle: new Angle(degrees),
					momentum: new Vector(new Coord(cos * self.speed, sin * self.speed), self.speed, 1)
				});

				self.owner.projectiles.push(projectile);
				self.projectiles.push(projectile);
			}
			return this;
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
		public weaponBanks: Weapon[] = [];
		public projectiles: Projectile[] = [];
		public sprite: Resource = Resource.get("tanksprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public momentum: Vector = new Vector(new Coord(), 2, 0.92);
		public acceleration: number = 0.05;
		public size: number = 32;
		public turnrate: number = 1;
		public hitPoints: number = 100;
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

			//These are "Proof of concept" for gunplacement and gun modification.
			//Real implementations should have a derived subclass to reference directly
			//instead of modifying the existing one directly
			this.weaponBanks.push(
				//Flamethrower
				new Weapon({
					position: new Coord(10, 10),
					lifespan: 20,
					owner: this,
					fireRateMax: 20,
					speed: 1.3,
					fireArc: new Angle(45),
					angle: new Angle(180)
				}),
				//Sniper
				new Weapon({
					position: new Coord(10, 10),
					lifespan: 100,
					fireRateMax: 200,
					owner: this,
					speed: 4,
					fireArc: new Angle(10),
				})
			);
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

				self.angle.set(self.turnrate * turn);

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
