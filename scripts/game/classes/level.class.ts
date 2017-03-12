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
		animation?: string
	}

	export class Tile {
		//List of all tiles in existence
		static _tiles: ITile[] = [];
		//Running static id number of level
		static _id = 0;
		//tile image
		static tileImage: Resource = Resource.get("tileset");
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
		static id: string | number = (function () {
			var id = 0;
			while (Tile._tiles.some(function (tile) {
				return tile.id == id;
			})) {
				id++;
			}
			return id;
		})();
		//Can a player/projectile traverse this tile
		static isBlocking: boolean = false;
		//The ressource to draw on this tile
		static ressource: Resource = Resource.get("tileset");
		//Default animation name
		static animation: string | number = "grass1";
		//On a scale from 0 to 1, how much friction does this tile excert
		static friction: number = 1;
		//How big should one of these tiles be.
		static tileSize: number = 16;
		constructor(parameters: ITile = {}) {
		}
	}


	export class TileGrass extends Tile {
		static id = "tilegrass1";
		static animation: string | number = "grass1";
		constructor(parameters: ITile = {}) {
			super(parameters);
		}
	}

	export class TileIce extends Tile {
		static id = "tileice1";
		static animation: string | number = "water1";
		constructor(parameters: ITile = {}) {
			super(parameters);
		}
	}

	export class TileSand extends Tile {
		static id = "tilesand1"
		static animation: string | number = "sand1";
		constructor(parameters: ITile = {}) {
			super(parameters);
		}
	}

	export class TileWall extends Tile {
		static id = "tilewall1"
		static animation: string | number = "grass1";
		constructor(parameters: ITile = {}) {
			super(parameters);
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
		public id;
		//Default tile to use in this level
		public defaultTile: ITile = TileSand;
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
			if (this.id == void 0) {
				this.id = Level._id++;
			}
			this.tileSet = new Hashmap(this.size, this.defaultTile.id)
			if (parameters.hasOwnProperty("tilehash")) {
				this.tileSet.data = parameters["tilehash"];
			}
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
