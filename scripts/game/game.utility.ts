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
				//Return overlapping circle
				return (angleBetweenPoints(l1x1, l1y1, l1x2, l1y2) == 0);
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

	//More Basics
	export module Basics {
		//Shape is a base class for other Shapes
		//This class isn't exported because it shouldn't be used raw
		class Shape {
			constructor() {

			}
		}

		export class Line {
			static intersects(a: Line, b: Line): boolean {
				return Basics.intersects(
					a.start.x,
					a.start.y,
					a.end.x,
					a.end.y,
					b.start.x,
					b.start.y,
					b.end.x,
					b.end.y
				) !== false
			}
			constructor(public start: Coord, public end: Coord) {

			}
		}

		//Polygons are always closed shapes
		export class Polygon extends Shape {
			static intersects(p1: Polygon, p2: Polygon) {
				for (let p1EdgeIndex = 0; p1EdgeIndex < p1.edges.length; p1EdgeIndex++) {
					let p1Edge = p1.edges[p1EdgeIndex];
					for (let p2EdgeIndex = 0; p2EdgeIndex < p2.edges.length; p2EdgeIndex++) {
						let p2Edge = p2.edges[p2EdgeIndex];

						let intersection = Line.intersects(p1Edge, p2Edge);
						if (intersection !== false) {
							return true;
						}
					}
				}
				return false;
			}
			static containsPoint(pol: Polygon, point: Coord): boolean {
				var e = pol.buildEdges().getExtremes(true);
				var count = 0;
				var lineA = new Line(
					new Coord(e.left - pol.origo.x, point.y - pol.origo.y),
					new Coord(point.x - pol.origo.x, point.y - pol.origo.y)
				);
				var lineB = new Line(
					new Coord(point.x - pol.origo.x, e.top - pol.origo.y),
					new Coord(point.x - pol.origo.x, point.y - pol.origo.y)
				);
				for (let edgeIndex = 0; edgeIndex < pol.edges.length; edgeIndex++) {
					if (Line.intersects(lineA, pol.edges[edgeIndex]) === true) {
						count++;
					}
				}
				if (count > 0 && count % 2 === 1) {
					return count % 2 === 1;
				}
				count = 0;
				for (let edgeIndex = 0; edgeIndex < pol.edges.length; edgeIndex++) {
					if (Line.intersects(lineB, pol.edges[edgeIndex]) === true) {
						count++;
					}
				}

				if (count > 0 && count % 2 === 1) {
					return count % 2 === 1;
				}

				return false;
			}
			public edges: Line[] = [];
			constructor(public origo: Coord = new Coord(), public points: Coord[] = [], public angle: Angle = new Angle()) {
				super();
				this.buildEdges();
			}
			public buildEdges() {
				var theta = Angle.degreetoRadian(this.angle.get());
				this.edges = [];

				for (let indexa = 0; indexa < this.points.length; indexa++) {
					let a = this.points[indexa];
					let b = this.points[(indexa + 1) % this.points.length];

					this.edges.push(
						new Line(
							new Coord(
								a.x * Math.cos(theta) - a.y * Math.sin(theta),
								a.x * Math.sin(theta) + a.y * Math.cos(theta)
							),
							new Coord(
								b.x * Math.cos(theta) - b.y * Math.sin(theta),
								b.x * Math.sin(theta) + b.y * Math.cos(theta)
							)
						)
					);
				}
				return this;
			}
			public getExtremes(applyOrigo = true) {
				this.buildEdges();
				var returner = {
					top: 0,
					left: 0,
					bottom: 0,
					right: 0
				}
				for (var index = 0; index < this.edges.length; index++) {
					var edge = this.edges[index];

					if (Math.min(edge.start.x, edge.end.x) < returner.left) {
						returner.left = Math.min(edge.start.x, edge.end.x);
					}
					if (Math.max(edge.start.x, edge.end.x) > returner.right) {
						returner.right = Math.max(edge.start.x, edge.end.x);
					}

					if (Math.min(edge.start.y, edge.end.y) < returner.top) {
						returner.top = Math.min(edge.start.y, edge.end.y);
					}
					if (Math.max(edge.start.y, edge.end.y) > returner.bottom) {
						returner.bottom = Math.max(edge.start.y, edge.end.y);
					}
				}
				if (applyOrigo === true) {
					returner.top += this.origo.y
					returner.bottom += this.origo.y
					returner.left += this.origo.x
					returner.right += this.origo.x
				}
				return returner;
			}
		}
		(function unitTest() {
			if (!runTests) { return false; }
			var p1 = new Polygon(
				new Coord(100, 100),
				[
					new Coord(-10, -10),
					new Coord(0, 10),
					new Coord(10, -10)
				],
				new Angle(45)
			);
			var p2 = new Polygon(
				new Coord(100, 100),
				[
					new Coord(-50, -5),
					new Coord(50, -5),
				],
				new Angle(45)
			);
			var p3 = new Polygon(
				new Coord(100, 100),
				[
					new Coord(-50, -50),
					new Coord(50, -50),
				],
				new Angle(45)
			);
			assert("Polygons intersect", Polygon.intersects(p1, p2), true);
			assert("Polygons does not intersect", Polygon.intersects(p1, p3), false);
			assert("Polygon contain point", Polygon.containsPoint(p1, p1.origo), true);
			assert("Polygon does not contain point", Polygon.containsPoint(p1, new Coord(p1.origo.x + 1000, p1.origo.y)), false);
		})()

		export class Rect extends Polygon {
			constructor(public origo: Coord = new Coord(), public width: number = 0, public height: number = 0, public angle: Angle = new Angle()) {
				super(origo);
				this.distributePoints();
			}
			public setWidth(value: number = this.width) {
				this.width = Math.abs(value);
				this.buildEdges();
				return this;
			}
			public setHeight(value: number = this.height) {
				this.height = Math.abs(value);
				this.buildEdges();
				return this;
			}
			public setAngle(value: number | Angle = this.angle) {
				if (value instanceof Angle) {
					this.angle.set(value.degree)
				} else {
					this.angle.set(value)
				}
				this.buildEdges();
				return this;
			}
			private distributePoints() {
				this.points = [
					//Top Left
					new Coord(-0.5 * this.width, -0.5 * this.height),
					//Top Right
					new Coord(0.5 * this.width, -0.5 * this.height),
					//Bottom Right
					new Coord(0.5 * this.width, 0.5 * this.height),
					//Bottom Left
					new Coord(-0.5 * this.width, 0.5 * this.height),

				];
				this.buildEdges();
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
		})()
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
		/* */

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
		/* */
		//Calculate if a Circle overlaps a Rect
		export function overlapCircleRect(c: Circle, r: Rect): boolean {

			//If distance between origo is more than Circle radius + (0.5 * Rect diagonal) away, then there is no way they overlap
			if (c.radius + (r.diagonal() / 2) < Coord.distanceBetweenCoords(c.origo, r.origo)) {
				return false;
			}

			//if Circle origo is inside Rect or Rect origo inside Circle, return true
			//if (er.left <= c.origo.x && c.origo.x <= er.right && c.origo.y >= er.top && c.origo.y <= er.bottom) {
			if (Polygon.containsPoint(r, c.origo) || Coord.distanceBetweenCoords(c.origo, r.origo) < c.radius) {
				return true;
			}
			//Check collisions on all edges
			for (let edgeIndex = 0; edgeIndex < r.edges.length; edgeIndex++) {
				let edge = r.edges[edgeIndex];
				if (shortestDistanceBetweenLineAndCircle(c.origo, edge.start, edge.end) < c.radius) {
					return true;
				}
			}
			//Return false if no overlap found
			return false;
		}
		/* // Unit Tests */
		(function unitTest() {
			if (!runTests) { return false; }
			var c = new Circle(new Coord(6, 6), 10);
			var r = new Rect(new Coord(5, 15), 15, 15);
			assert("Circle and Rect overlap", overlapCircleRect(c, r));
			r.origo.x = 100;
			r.buildEdges();
			assert("Circle and Rect dont overlap", overlapCircleRect(c, r), false);
		})()
		/* */

		//Shape overlap
		//Used for collisions
		/* */
		export function shapeOverlap(objA: Shape, objB: Shape): boolean {

			if (objA instanceof Rect && objB instanceof Rect) {
				return Polygon.intersects(objA, objB) || Polygon.containsPoint(objA, objB.origo) || Polygon.containsPoint(objB, objA.origo)
			} else if (objA instanceof Circle && objB instanceof Circle) {
				return Coord.distanceBetweenCoords(objA.origo, objB.origo) <= objA.radius + objB.radius;
			} else if (objA instanceof Rect && objB instanceof Circle) {
				return overlapCircleRect(objB, objA) || Polygon.containsPoint(objA, objB.origo)
			} else if (objA instanceof Circle && objB instanceof Rect) {
				return overlapCircleRect(objA, objB) || Polygon.containsPoint(objB, objA.origo)
			}

			return false;
		}
		/* // Unit Tests */
		(function unitTest() {
			if (!runTests) { return false; }
			var c1 = new Circle(new Coord(10, 10), 10);
			var c2 = new Circle(new Coord(10, 10), 10);
			var r1 = new Rect(new Coord(15, 15), 15, 15);
			var r2 = new Rect(new Coord(14, 14), 15, 15);
			assert("Shape overlap 1", shapeOverlap(c1, c2));
			assert("Shape overlap 2", shapeOverlap(r1, r2));
			assert("Shape overlap 2.5", shapeOverlap(r1, r2));
			assert("Shape overlap 3", shapeOverlap(c1, r1));
			assert("Shape overlap 4", shapeOverlap(c1, r2));
			assert("Shape overlap 5", shapeOverlap(c2, r1));
			assert("Shape overlap 6", shapeOverlap(c2, r2));
		})()
		/* */
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
			if (tankApp.Options.soundEnabled) {
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
	new Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletSprite" });
	new Resource({ fileLocation: "resources/bullet_burning.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletBurningSprite" });
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
	new Sound({ id: "sfxFlamethrowerSpawn", resource: Resource.get("sfxFlamethrowerSpawn"), soundBankCount: 10});
	new Sound({ id: "sfxBulletHit", resource: Resource.get("sfxBulletHit"), soundBankCount: 4 });
	new Sound({ id: "sfxTankDie", resource: Resource.get("sfxTankDie"), soundBankCount: 4 });
}
