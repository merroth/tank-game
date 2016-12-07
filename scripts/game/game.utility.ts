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
	}

	//Defines the concept of an "angle" and utility functions
	export class Angle {
		constructor(public degree: number = 0) {
			this.degree = this.degree % 360;
		}
		public set(degree: number): Angle {
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

	//More Basics
	export module Basics {
		//Shape is a base class for other Shapes
		//This class isn't exported because it shouldn't be used raw
		class Shape {
			constructor() {

			}
		}
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
			public chord(v: number = 1): number {
				return 2 * this.radius * Math.sin(Angle.degreetoRadian(v) / 2);
			}
			constructor(public origo: Coord = new Coord(), public radius: number = 0) {
				super();
			}
		}
		//Rect contains mathematical formulars and data for a rectangle
		export class Rect extends Shape {
			//omkreds
			public circumference(): number {
				return 2 * (
					Basics.distance(this.left, this.top, this.left, this.bottom) +
					Basics.distance(this.left, this.top, this.right, this.top)
				)
			}
			//areal
			public area(): number {
				return Basics.distance(this.left, this.top, this.left, this.bottom) *
					Basics.distance(this.left, this.top, this.right, this.top)
			}
			//Diagonal length of box
			public diagonal(): number {
				return Basics.distance(this.left, this.top, this.right, this.bottom);

			}
			constructor(public top: number, public right: number, public bottom: number, public left: number, public angle: Angle = new Angle()) {
				super();
			}
		}

		//Shortest length between any point on a line and and a circle
		export function shortestDistanceBetweenLineAndCircle(circleOrigo: Coord, startPoint: Coord, endPoint: Coord): number {
			var A = circleOrigo.x - startPoint.x;
			var B = circleOrigo.y - startPoint.y;
			var C = endPoint.x - startPoint.x;
			var D = endPoint.y - startPoint.y;

			var dot = A * C + B * D;
			var len_sq = C * C + D * D;
			var param = -1;
			if (len_sq != 0) { //in case of 0 length line
				param = dot / len_sq;
			}
			var xx: number, yy: number;

			if (param < 0) {
				xx = startPoint.x;
				yy = startPoint.y;
			} else if (param > 1) {
				xx = endPoint.x;
				yy = endPoint.y;
			} else {
				xx = startPoint.x + param * C;
				yy = startPoint.y + param * D;
			}

			var dx = circleOrigo.x - xx;
			var dy = circleOrigo.y - yy;
			return Math.sqrt(dx * dx + dy * dy);
		}

		//Calculate if a Circle overlaps a Rect
		export function overlapCircleRect(c: Circle, r: Rect): boolean {

			//If topleft of Rect is more than Circle radius + Rect diagonal away, then there is no way they overlap
			if (c.radius + r.diagonal() > Coord.distanceBetweenCoords(c.origo, new Coord(r.left, r.top))) {
				return false;
			}

			//if Circle origo is inside rect, return true
			if (r.left <= c.origo.x && c.origo.x <= r.right && c.origo.y >= r.top && c.origo.y <= r.bottom) {
				return true;
			}
			//if any wall intersects the circle
			if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.top), new Coord(r.right, r.top)) < c.radius) {//Top line
				return true;
			} else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.top), new Coord(r.left, r.bottom)) < c.radius) {//Left line
				return true;
			} else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.bottom), new Coord(r.right, r.bottom)) < c.radius) {//Bottom line
				return true;
			} else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.right, r.top), new Coord(r.right, r.bottom)) < c.radius) {//Right line
				return true;
			}
			//Return false if no overlap found
			return false;
		}

		//Shape overlap
		//Used for collisions
		export function shapeOverlap(objA: Shape, objB: Shape): boolean {

			if (objA instanceof Rect && objB instanceof Rect) {
				return objA.right >= objB.left && objA.bottom >= objB.top
					&& objB.right >= objA.left && objB.bottom >= objA.top;
			} else if (objA instanceof Circle && objB instanceof Circle) {
				return Coord.distanceBetweenCoords(objA.origo, objB.origo) <= objA.radius + objB.radius;
			} else if (objA instanceof Rect && objB instanceof Circle) {
				return overlapCircleRect(objB, objA);
			} else if (objA instanceof Circle && objB instanceof Rect) {
				return overlapCircleRect(objA, objB);
			}

			return false;
		}
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
			for (var soundBankIndex = 0; soundBankIndex < this.soundBanks.length; soundBankIndex++) {
				var soundBank = this.soundBanks[soundBankIndex];
				if (soundBank.paused) {
					soundBank.play();
					return this;
				}
			}
			if (force) {
				var sfx = this.soundBanks[0];
				sfx.currentTime = 0;
				sfx.play();
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
	new Resource({ fileLocation: "resources/single-tank-red.png", descriptorLocation: "resources/single-tank-red.json", id: "tanksprite" });
	new Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletsprite" });
	new Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
	new Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
	new Resource({ fileLocation: "resources/sfx/bullet_bounce.m4a", id: "sfxBulletBounce" });
	new Resource({ fileLocation: "resources/sfx/bullet_spawn.m4a", id: "sfxBulletSpawn" });
	new Resource({ fileLocation: "resources/sfx/tank_hit.m4a", id: "sfxTankHit" });
	new Resource({ fileLocation: "resources/sfx/tank_die.m4a", id: "sfxTankDie" });
	//Sound
	new Sound({ id: "sfxMenuBack", resource: Resource.get("sfxMenuBack") });
	new Sound({ id: "sfxMenuSelect", resource: Resource.get("sfxMenuSelect") });
	new Sound({ id: "sfxBulletBounce", resource: Resource.get("sfxBulletBounce") });
	new Sound({ id: "sfxBulletSpawn", resource: Resource.get("sfxBulletSpawn"), soundBankCount: 10 });
	new Sound({ id: "sfxTankHit", resource: Resource.get("sfxTankHit"), soundBankCount: 4 });
	new Sound({ id: "sfxTankDie", resource: Resource.get("sfxTankDie"), soundBankCount: 4 });
}
