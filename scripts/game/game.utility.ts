//This file contains utility elements for the game engine.
module tanks {
	/* utility interfaces & enums */

	//Enum for rendering order
	export enum EZindex {
		//Dont assign values, simply move lines up or down to change rendering order
		"background",
		"terrain",
		"sub-sfx",
		"actor",
		"actor-sfx",
		"projectile",
		"top-sfx",
		"ui"
	}


	//Testing
	export var runTests = true;
	export function assert(label: string = "Unlabeled", statement: any, exptected: any = true) {
		var str = label + " exptected " + exptected + " found " + statement;
		if (statement != exptected) {
			console.warn(label, "exptected", exptected, "found", statement);
		}
	}

	//Container for basic elements like funtions or shapes
	export module Basics {
		//Distance betweem two coordinates
		export function distance(x1: number, y1: number, x2: number, y2: number): number {
			return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		}
		//Angle betweem two coordinates
		export function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
			var angle = (Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI) % 360;
			if (angle < 0) {
				angle = Math.abs(angle - 180);
			}
			return angle;
		}
		//Would two lines intersect
		//http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function#24392281
		export function intersects(l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2): boolean | { lamb: number, gamma: number } {

			var det: number, gamma: number, lamb: number;
			det = (l1x2 - l1x1) * (l2y2 - l2y1) - (l2x2 - l2x1) * (l1y2 - l1y1);
			if (det === 0) {
				return false;
				//Return overlapping circle
				//return (angleBetweenPoints(l1x1, l1y1, l1x2, l1y2) == 0);
			} else {
				//lamb is progess over x axis
				lamb = ((l2y2 - l2y1) * (l2x2 - l1x1) + (l2x1 - l2x2) * (l2y2 - l1y1)) / det;
				//gamma is progess over y axis
				gamma = ((l1y1 - l1y2) * (l2x2 - l1x1) + (l1x2 - l1x1) * (l2y2 - l1y1)) / det;
				if ((0 < lamb && lamb < 1) && (0 < gamma && gamma < 1)) {
					return {
						lamb: lamb, gamma: gamma
					}
				} else {
					return false;
				}
			}
		};
	}

	//Defines the concept of an "angle" and utility functions
	export class Angle {
		constructor(public degree: number = 0) {
			this.degree = this.degree % 360;
		}
		public set(degree: number): Angle {
			this.degree = degree % 360;
			return this;
		}
		public add(degree: number): Angle {
			this.degree = (this.degree + degree) % 360;
			return this;
		}
		public get(): number {
			return this.degree;
		}
		public static degreetoRadian(degree: number): number {
			return degree * (Math.PI / 180);
		}
		public static radianToDegree(radian: number): number {
			return radian * (180 / Math.PI);
		}
	}
	//Defines a point in space and utility functions
	export class Coord {
		constructor(public x: number = 0, public y: number = 0) {

		}
		//Distance between points wrapped for Coords
		public static distanceBetweenCoords(coordA: Coord, coordB: Coord): number {
			return Basics.distance(coordA.x, coordA.y, coordB.x, coordB.y);
		}
		//Angle between points formular wrapped for Coords
		public static angleBetweenCoords(coordA: Coord, coordB: Coord): Angle {
			return new Angle(Basics.angleBetweenPoints(coordA.x, coordA.y, coordB.x, coordB.y));
		}
	}
	//Defines a force in space, based upon Coord
	export class Vector {
		constructor(public velocity: Coord = new Coord(), public max: number = Infinity, public degradeForce: number = 0.95) {

		}
		//Degrade the current momentum by an overridable factor
		public degrade(degradeForce: number = this.degradeForce): Vector {
			this.velocity.x *= this.degradeForce;
			this.velocity.y *= this.degradeForce;
			return this;
		}
		//Reverse the Vector to point in the opposite direction
		public reverse(): Vector {
			this.velocity.x = -1 * this.velocity.x;
			this.velocity.y = -1 * this.velocity.y;
			return this;
		}
		//Add a Coord force to the Vector
		public addForce(force: Coord = new Coord()): Vector {

			this.velocity.x += force.x;
			if (Math.abs(this.velocity.x) > this.max) {
				this.velocity.x = (this.velocity.x > 0 ? this.max : 0 - this.max);
			}
			this.velocity.y += force.y;
			if (Math.abs(this.velocity.y) > this.max) {
				this.velocity.y = (this.velocity.y > 0 ? this.max : 0 - this.max);
			}
			return this;
		}
		public get(): Coord {
			return this.velocity;
		}
		public set(force: Coord = this.velocity): Vector {
			this.velocity = force;
			return this;
		}
		//Get angle of force
		public getAngle(): Angle {
			return Coord.angleBetweenCoords(new Coord(), this.velocity);
		}
	}

	//A Hashmap maps 2 dimensional elements to a 1 dimensional array
	//This way we can use native array methods for faster manipulations if needed
	export class Hashmap {
		public data: any[] = [];
		public size: number = 10
		public defaultValue: any = null
		constructor(size: number = 10, defaultValue: any = null) {

			if (defaultValue != this.defaultValue) {
				this.defaultValue = defaultValue;
			}
			if (typeof size == typeof this.size && isFinite(size) && size > 0) {
				this.size = Math.abs(size);
			} else {
				//console.warn("invalid size:", size, "using default", this.size, "instead");
			}
			this.data.length = Math.pow(size, 2);
		}
		public get(coord: Coord) {
			let target = coord.x + (coord.y * this.size);
			if (target >= this.data.length) {
				//console.warn("out of range: too high", coord.x, ':', coord.y);
				return false;
			}
			if (target < 0) {
				//console.warn("out of range: only positive values accepted", coord.x, ':', coord.y);
				return false;
			}
			if (this.data[target] == void 0) {
				return this.defaultValue;
			}

			return this.data[target];
		}
		public getAll(fillEmpty = true) {
			var arr = this.data.slice(0);
			for (let arrIndex = 0; arrIndex < arr.length; arrIndex++) {
				if (arr[arrIndex] == void 0 && fillEmpty == true) {
					arr[arrIndex] = this.defaultValue;
				}
			}
			return arr;
		}
		public set(coord: Coord, value: any) {
			let target = coord.x + (coord.y * this.size);
			if (target >= this.data.length) {
				//console.warn("out of range: too high", coord.x, ':', coord.y);
				return false;
			}
			if (target < 0) {
				//console.warn("out of range: only positive values accepted", coord.x, ':', coord.y);
				return false;
			}
			this.data[target] = value;
			return this;
		}
		public remove(coord: Coord) {
			let target = coord.x + (coord.y * this.size);
			if (target >= this.data.length) {
				//console.warn("out of range: too high", coord.x, ':', coord.y);
				return false;
			}
			if (target < 0) {
				//console.warn("out of range: only positive values accepted", coord.x, ':', coord.y);
				return false;
			}
			if (this.data[target] != void 0) {
				this.data[target] = void 0;
			}
			return this;
		}
		public setDefault(value: any) {
			this.defaultValue = value;
			return this;
		}
	}

	(function unitTest() {
		var h = new Hashmap();
		assert("Hashmap gets negative", h.get(new Coord(-1, -1)), false);
		assert("Hashmap sets negative", h.set(new Coord(-1, -1), false), false);
	})()

	//More Basics
	export module Basics {
		//Shape is a base class for other Shapes
		//This class isn't exported because it shouldn't be used raw

		/**
		 * Shape
		 */
		class Shape {
			constructor(public origo: Coord = new Coord()) {

			}
		}
		export class Rect extends Shape {
			constructor(public origo: Coord = new Coord(), public width: number = 0, public height: number = 0) {
				super(origo);
			}
			public setWidth(value: number = this.width) {
				this.width = Math.abs(value);
				return this;
			}
			public setHeight(value: number = this.height) {
				this.height = Math.abs(value);
				return this;
			}
			public circumference(): number {
				return 2 * (
					Basics.distance(0, 0, 0, this.height) +
					Basics.distance(0, 0, this.width, 0)
				)
			}
			public area(): number {
				return Basics.distance(0, 0, 0, this.height) *
					Basics.distance(0, 0, this.width, 0)
			}
			//Diagonal length of box
			public diagonal(): number {
				return Basics.distance(0, 0, this.width, this.height);
			}

		}
		/* */ // Unit Tests
		(function unitTest() {
			if (!runTests) { return false; }
			var c = new Rect(new Coord(10, 20), 10, 10);
			assert("Area of rect is 100", Math.floor(c.area()), 100);
			assert("Circumference of rect is 40", Math.floor(c.circumference()), 40);
			assert("Diagonal of rect is 14", Math.floor(c.diagonal()), 14);
		})();
		/* */
		//Circle contains mathematical formulars and data for a circle
		//This can easily be used for range factors and collisions
		export class Circle extends Shape {
			static areaToRadius(area: number): number {
				return area / Math.PI;
			}
			//omkreds
			public circumference(): number {
				return 2 * this.radius * Math.PI;
			}
			//areal
			public area(): number {
				return Math.PI * (this.radius * this.radius);
			}
			//korde
			public chord(vinkel: number = 1): number {
				//https://www.regneregler.dk/cirkel-korde
				return 2 * this.radius * Math.sin(Angle.degreetoRadian(vinkel) / 2);
			}
			constructor(public origo: Coord = new Coord(), public radius: number = 0) {
				super();
			}
		}
		/* // Unit Tests */
		(function unitTest() {
			if (!runTests) { return false; }
			var c = new Circle(new Coord(100, 100), 10);
			assert("Area of circle is 314", Math.floor(c.area()), 314);
			assert("Circumference of circle is 62", Math.floor(c.circumference()), 62);
			assert("Chord of circle is radius * 2 (10 * 2)", Math.floor(c.chord(180)), 20);
		})();

		function RectCircleColliding(circle: Circle, rect: Rect) {
			var x = rect.origo.x - 0.5 * rect.width;
			var y = rect.origo.y - 0.5 * rect.height;
			//http://stackoverflow.com/a/21096179
			var distX = Math.abs(circle.origo.x - x - rect.width / 2);
			var distY = Math.abs(circle.origo.y - y - rect.height / 2);

			if (distX > (rect.width / 2 + circle.radius)) {
				return false;
			}
			if (distY > (rect.height / 2 + circle.radius)) {
				return false;
			}

			if (distX <= (rect.width / 2)) {
				return true;
			}
			if (distY <= (rect.height / 2)) {
				return true;
			}

			var dx = distX - rect.width / 2;
			var dy = distY - rect.height / 2;
			return (dx * dx + dy * dy <= (circle.radius * circle.radius));
		}

		export function shapeOverlap(shape1: Shape, shape2: Shape) {
			if (shape1 instanceof Rect && shape2 instanceof Rect) {
				return (
					//Shape1 start before Shape2 ends (x)
					shape1.origo.x - 0.5 * shape1.width < shape2.origo.x + 0.5 * shape2.width &&
					//Shape2 start before Shape1 ends (x)
					shape2.origo.x - 0.5 * shape2.width < shape1.origo.x + 0.5 * shape1.width &&
					//Shape1 start before Shape2 ends (y)
					shape1.origo.y - 0.5 * shape1.height < shape2.origo.y + 0.5 * shape2.height &&
					//Shape2 start before Shape1 ends (y)
					shape2.origo.y - 0.5 * shape2.height < shape1.origo.y + 0.5 * shape1.height
				);
			} else if (shape1 instanceof Circle && shape2 instanceof Circle) {
				return Coord.distanceBetweenCoords(shape1.origo, shape2.origo) < shape1.radius + shape2.radius
			} else if (shape1 instanceof Circle && shape2 instanceof Rect) {
				return RectCircleColliding(shape1, shape2);
			} else if (shape1 instanceof Rect && shape2 instanceof Circle) {
				return RectCircleColliding(shape2, shape1);
			} else {
				return false;
			}
		}

		/* */
		//Enum settings for bounce
		enum EBounce {
			//Moving in negative direction
			"substractive",
			//Moving in positive direction
			"additive",
		}
		//Determine angle of bounceof
		export function bounce(incomingAngle: number, angleOfCollisionTarget: number, solution: EBounce = EBounce.additive): number {
			//The Normal is tangent to the angleOfCollisionTarget
			var normal = (solution == EBounce.additive ? angleOfCollisionTarget - 90 : angleOfCollisionTarget + 90);
			//Force between 0 and 360
			if (normal <= 0) { normal += 360; }
			if (incomingAngle <= 0) { incomingAngle += 360; }
			//
			var result = 90 * (1 + (angleOfCollisionTarget % 180 / 90)) - incomingAngle + normal;
			//Force result to be a positive degree
			while (result < 0) {
				result += 360;
			}
			return result % 360;
		}
		/* // Unit Tests */
		(function unitTest() {
			if (!runTests) { return false; }
			assert("45 on 0 is 315", bounce(45, 0), 315);
			assert("135 on 0 is 225", bounce(135, 0), 225);
			assert("225 on 0 is 135", bounce(225, 0), 135);
			assert("315 on 0 is 45", bounce(315, 0), 45);

			assert("45 on 90 is 135", bounce(45, 90), 135);
			assert("135 on 90 is 45", bounce(135, 90), 45);
			assert("225 on 90 is 315", bounce(225, 90), 315);
			assert("315 on 90 is 225", bounce(315, 90), 225);
		})();
	}

	export interface IDescriptorAnimation {
		name: string;
		top: number;
		count: number;
		rate: number;
	}
	export interface IDescriptor {
		width: number;
		height: number;
		anim: IDescriptorAnimation[];
	}

	export interface IResource {
		fileLocation: string,
		descriptorLocation?: string,
		id?: string
	}
	//Resources consists of a graphic file and optionally a descriptor JSON file
	//Resources are loaded before game launch and referenced by assigned ID
	export class Resource {
		private static id: 0;
		public static Resources: Resource[] = [];
		public resource: HTMLImageElement | HTMLAudioElement | string | any = null;
		public descriptor: IDescriptor = null;
		public ready: boolean = false;
		public fileLocation: string = "";
		public descriptorLocation: string = null;
		public id: string = "#" + (Resource.id++)
		public static get(id: string): Resource {
			var resource = this.Resources
				.filter(function (a) {
					return a.id == id;
				});
			if (resource.length > 0) {
				return resource[0];
			}
		}
		constructor(parameters: IResource = { fileLocation: "" }) {
			var self = this;
			var ready = 2;

			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}

			if (this.descriptorLocation == null) {
				testReady();
			}
			function testReady() {
				ready--;
				if (ready <= 0) {
					self.ready = true;
				}
			}

			//resource
			if (this.fileLocation.match(/\.png$|\.jpg$|\.bmp$|\.gif$/ig) !== null) {
				//Image
				this.resource = document.createElement("img");
				this.resource.onload = function loaded() {
					testReady();
				}
				this.resource.src = this.fileLocation;
			} else if (this.fileLocation.match(/\.json$/ig) !== null) {
				//JSON
				var req = new XMLHttpRequest();
				req.open('GET', this.fileLocation);
				req.overrideMimeType("application/json");
				req.onreadystatechange = function loaded() {
					self.resource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
					testReady()
				}
				req.send();
			} else if (this.fileLocation.match(/\.m4a$|\.mp3$|\.ogg/ig) !== null) {
				//Sound
				this.resource = document.createElement("audio");
				this.resource.onload = function loaded() {
					testReady();
				}
				this.resource.src = this.fileLocation;
			} else {
				//Unkown filetype
				var req = new XMLHttpRequest();
				req.open('GET', this.fileLocation);
				req.onreadystatechange = function loaded() {
					self.resource = req.responseText;
					testReady()
				}
				req.send();
			}

			//descriptor
			if (this.descriptorLocation != null) {
				if (this.descriptorLocation.match(/\.json$/ig) !== null) {
					//JSON
					var req = new XMLHttpRequest();
					req.open('GET', this.descriptorLocation);
					req.overrideMimeType("application/json");
					req.onreadystatechange = function () {
						if (req.readyState === 4) {
							self.descriptor = JSON.parse(req.responseText);
							testReady()
						}
					}
					req.send();
				}
			}
			Resource.Resources.push(this);
		}
	}

	export interface ISound {
		resource?: Resource
		soundBankCount?: number
		id?: string
	}

	//A class to hold sound specific attributes
	export class Sound {
		private static _id: number = 0;
		public static Sounds: Sound[] = [];
		public static get(id: string): Sound {
			var sound = this.Sounds
				.filter(function (a) {
					return a.id == id;
				});
			if (sound.length > 0) {
				return sound[0];
			}
		}

		public soundBankCount: number = 1;
		public soundBanks: HTMLAudioElement[] = [];
		public resource: Resource = null;
		public id: string = null;
		constructor(parameters: ISound = { id: "#" + (Sound._id++).toString() }) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
					this[key] = parameters[key];
				}
			}
			this.soundBanks.push(this.resource.resource);
			while (this.soundBanks.length < this.soundBankCount) {
				this.soundBanks.push(this.resource.resource.cloneNode());
			}
			Sound.Sounds.push(this);
		}
		public play(force: boolean = false) {
			if (tankApp.userOptions.soundVolume > 0) {
				for (var soundBankIndex = 0; soundBankIndex < this.soundBanks.length; soundBankIndex++) {
					var soundBank = this.soundBanks[soundBankIndex];
					if (soundBank.paused) {
						soundBank.volume = tankApp.userOptions.soundVolume;
						soundBank.play();
						return this;
					}
				}
				if (force) {
					var sfx = this.soundBanks[0];
					sfx.currentTime = 0;
					sfx.play();
				}
			}
			return this;
		}
		public pause(rewind: boolean = false) {
			for (var soundBankIndex = 0; soundBankIndex < this.soundBanks.length; soundBankIndex++) {
				this.soundBanks[soundBankIndex].pause();
				if (rewind) {
					this.soundBanks[soundBankIndex].currentTime = 0;
				}
			}
			return this;
		}
	}
}
//initialize load
//in the future this should be elsewhere
module tanks {
	//Resources
	new Resource({ fileLocation: "resources/single-tank-red.png", descriptorLocation: "resources/single-tank-red.json", id: "tankRedSprite" });
	new Resource({ fileLocation: "resources/single-tank-blue.png", descriptorLocation: "resources/single-tank-red.json", id: "tankBlueSprite" });
	new Resource({ fileLocation: "resources/single-tank-green.png", descriptorLocation: "resources/single-tank-red.json", id: "tankGreenSprite" });
	new Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletSprite" });
	new Resource({ fileLocation: "resources/bullet_burning.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletBurningSprite" });
	new Resource({ fileLocation: "resources/tiles_vertical.png", descriptorLocation: "resources/tileset_vertical.json", id: "tileset" });
	new Resource({ fileLocation: "resources/wall.png", id: "wallSprite" });
	new Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
	new Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
	new Resource({ fileLocation: "resources/sfx/bullet_bounce.m4a", id: "sfxBulletBounce" });
	new Resource({ fileLocation: "resources/sfx/bullet_spawn.m4a", id: "sfxBulletSpawn" });
	new Resource({ fileLocation: "resources/sfx/flamethrower_spawn.m4a", id: "sfxFlamethrowerSpawn" });
	new Resource({ fileLocation: "resources/sfx/bullet_hit.m4a", id: "sfxBulletHit" });
	new Resource({ fileLocation: "resources/sfx/tank_die.m4a", id: "sfxTankDie" });
	//Sound
	new Sound({ id: "sfxMenuBack", resource: Resource.get("sfxMenuBack") });
	new Sound({ id: "sfxMenuSelect", resource: Resource.get("sfxMenuSelect") });
	new Sound({ id: "sfxBulletBounce", resource: Resource.get("sfxBulletBounce") });
	new Sound({ id: "sfxBulletSpawn", resource: Resource.get("sfxBulletSpawn"), soundBankCount: 10 });
	new Sound({ id: "sfxFlamethrowerSpawn", resource: Resource.get("sfxFlamethrowerSpawn"), soundBankCount: 10 });
	new Sound({ id: "sfxBulletHit", resource: Resource.get("sfxBulletHit"), soundBankCount: 4 });
	new Sound({ id: "sfxTankDie", resource: Resource.get("sfxTankDie"), soundBankCount: 4 });
}
