/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains weapon sets for the player objects
//A weapon is a "hardpoint" for players that can manage meta information for projectiles such as fireRate or fireArc
//or their position/angle relative to their respective player objects
module tanks {

	export interface IWeapon extends IActor {
		//Obligatory field
		owner: Player;
		//Optional fields
		lifespan?: number;
		projectileType?: Projectile;
		fireArc?: Angle;
		angle?: Angle;
		position?: Coord;
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

		constructor(parameters: IWeapon = { owner: null }) {
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

				var projectile = new self.projectileType({
					lifespan: self.lifespan,
					owner: self,
					position: new Coord(self.owner.position.x + cos * self.position.x, self.owner.position.y + sin * self.position.y),
					angle: new Angle(degrees),
					momentum: new Vector(new Coord(cos * self.speed, sin * self.speed), self.speed, 1)
				});

				self.owner.projectiles.push(projectile);
				self.projectiles.push(projectile);

				if (projectile.sfx.spawn != null) {
					projectile.sfx.spawn.play();
				}
			}
			return this;
		}
	}

	export class WeaponTankFlameThrower extends Weapon {
		public lifespan: number = 20;
		public fireRateMax: number = 10;
		public speed: number = 1.3;
		public fireArc: Angle = new Angle(45);
		public projectileType = FlameThrowerProjectile;
	}

	export class WeaponTankMainGun extends Weapon {
		public lifespan: number = 100;
		public fireRateMax: number = 200;
		public speed: number = 4;
		public fireArc: Angle = new Angle(1);
		public projectileType = MainGunProjectile;
	}

}
