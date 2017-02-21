/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//Projectiles contains classes for each kind of projectile in the game
//A projectile is a self propelling game object without direct user control, usually intended for dealing damage
module tanks {

	export interface ITile {
		id?: string | number,
		name?: string,
		isBlocking?: boolean,
		ressource?: Resource,
		friction?: number,
		tileSize?: number
	}

	export class Tile {
		//List of all tiles in existence
		static _tiles: Tile[] = [];
		//Running static id number of level
		static _id = 0;
		//get Tile By Id
		static getById(id: number | string = null) {
			return this._tiles
				.filter(function (a) {
					return a.id == id
				})
				.slice(0)
				.pop();
		}
		//get Tile By name
		static getByName(name: number | string = null) {
			return this._tiles
				.filter(function (a) {
					return a.name == name
				})
				.slice(0)
				.pop();
		}

		//The identifier for this tile.
		public id: string | number = (function () {
			var id = 0;
			while (Tile._tiles.some(function (tile) {
				return tile.id == id;
			})) {
				id++;
			}
			return id;
		})();;
		//The secondary identifier for this tile.
		//Could be "Ice", "Lake" or "Pavement"
		public name: string | number = "";
		//Can a player/projectile traverse this tile
		public isBlocking: boolean = false;
		//The ressource to draw on this tile
		public ressource: Resource = null;
		//On a scale from 0 to 1, how much friction does this tile excert
		public friction: number = 1;
		//How big should one of these tiles be.
		public tileSize: number = 16;
		constructor(parameters: ITile = {}) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			if (this.friction > 1) {
				this.friction = 1;
			} else if (this.friction < 0) {
				this.friction = 0;
			}
			if (this.tileSize <= 0) {
				this.tileSize = 1;
			}
			Tile._tiles.push(this);
		}
	}

	class TileIce extends Tile {
		constructor(parameters: ITile = {}) {
			super(parameters);
			this.friction = 0.25;
		}
	}

	class TileSand extends Tile {
		constructor(parameters: ITile = {}) {
			super(parameters);
			this.friction = 0.25;
		}
	}

	class TileWall extends Tile {
		constructor(parameters: ITile = {}) {
			super(parameters);
			this.isBlocking = true;
		}
	}

	export interface ILevel {
		id?: string | number,
		defaultTile?: ITile,
		size?: number,
		tilehash?: string[] | number[],
	}

	export class Level {
		//Running static id number of level
		static _id = 0;
		//All levels
		static _levels: Level[] = [];
		//
		public id: number | string = (function () {
			var id = 0;
			while (Level._levels.some(function (lvl) {
				return lvl.id == id;
			})) {
				id++;
			}
			return id;
		})();
		//Default tile to use in this level
		public defaultTile: Tile = Tile.getByName("ice");
		//Map size in tiles
		public size: number = 100;
		//Hashmap over tiles
		public tileSet: Hashmap = null;
		constructor(parameters: ILevel = {}) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			this.tileSet = new Hashmap(this.size, this.defaultTile.id)
			if (parameters.hasOwnProperty("tilehash")) {
				this.tileSet.data = parameters["tilehash"];
			}
			Level._levels.push(this);
		}
		public save() {
			var self = this;
			var saveObject = {
				id: this.id.toString(),
				size: this.size,
				tilehash: Object.keys(this.tileSet.data)
					.filter(function (tile) {
						return (self.tileSet.data[tile] != void 0);
					})
					.map(function (tile) {
						var obj = {};
						obj[tile] = self.tileSet.data[tile];
						return obj
					}),
				defaultTile: this.defaultTile.id
			}
			return JSON.stringify(saveObject);
		}
	}

	/* UNIT TESTS - RUN ONLY IN DEVELOPMENT AS THE TILES REGISTER GLOBALLY!
	var lvl = new Level({ id: "Level 1", size: 6 });
	lvl.tileSet.set(new Coord(1, 1), 5);
	console.log(lvl.save());
	*/

}
