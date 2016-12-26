/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//Projectiles contains classes for each kind of projectile in the game
//A projectile is a self propelling game object without direct user control, usually intended for dealing damage
module tanks {

	export interface IWall extends IActor {
		//Obligatory field
		from: Coord,
		to: Coord
	}

	export class Wall extends Actor {
		public size = 32;
		public sprite: Resource = Resource.get("bulletsprite");
		public collision: Basics.Circle | Basics.Rect;
		public from: Coord = null;
		public to: Coord = null;
		public render = false;
		constructor(parameters: IWall = { from: null, to: null }) {
			super(parameters);
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			this.angle = Coord.angleBetweenCoords(this.from, this.to);

			//this.collision = new Basics.Circle(this.position, this.size / 2);
		}
		public update(): boolean {
			var self = this;
			return true;
		}
		public die() {
		}
	}
}
