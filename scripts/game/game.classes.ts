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
	}

	export class Actor {
		public position: Coord = new Coord();
		public angle: Angle = new Angle();
		public momentum: Vector = new Vector();
		public acceleration: number = 0;
		public size: number = 0;
		public sprite: Resource;
		public anim: IActorAnimation = { name: "", count: 0 };
		public turnrate: number = 1;
		constructor(parameters: IActor = {}) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
		}
	}

	export interface IProjectile extends IActor {
		lifespan?: number;
		owner?: Player;
	}

	class Projectile extends Actor {
		public lifespan: number = 1;
		public owner: Player;
		public size = 8;
		public sprite: Resource = Resource.get("bulletsprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		constructor(parameters: IProjectile = {}) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
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
		public projectiles: Projectile[] = [];
		public sprite: Resource = Resource.get("tanksprite");
		public anim: IActorAnimation = { name: "idle", count: 0 };
		public momentum: Vector = new Vector(new Coord(), 2, 0.92);
		public acceleration: number = 0.05;
		public size: number = 32;
		public turnrate: number = 1;
		public canShoot: boolean = true;
		public fireRate: number = 500;
		public maxProjectiles: number = 10;
		public controls: IPlayerControls = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			shoot: false
		}

		constructor(parameters: IPlayer = {}) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
		}

		public shoot() {
			this.canShoot = false;

			var cos = Math.cos(Angle.degreetoRadian(this.angle.degree));
			var sin = Math.sin(Angle.degreetoRadian(this.angle.degree));

			var sfx = Resource.get('sfxBulletSpawn');
			sfx.resource.currentTime = 0;
			sfx.resource.play();

			var projectile = new Projectile({
				lifespan: 100,
				owner: this,
				position: new Coord(this.position.x + cos * 10, this.position.y + sin * 10),
				angle: new Angle(this.angle.degree),
				momentum: new Vector(new Coord(cos * 4, sin * 4), 4, 1)
			});
			this.projectiles.push(projectile);

			var player = this;

			setTimeout(function() {player.canShoot = true}, this.fireRate);
		}
	}
}
