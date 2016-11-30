//This file contains utility elements for the game engine.
module tanks {
	//Defines the concept of an "angle" and utility functions
	export class Angle {
		constructor(public degree: number = 0) {
			this.degree = this.degree % 360;
		}
		public set(degree: number): Angle {
			this.degree = (this.degree + degree) % 360;
			return this;
		}
		public get() {
			return this.degree;
		}
		public static degreetoRadian(degree: number) {
			return degree * (Math.PI / 180);
		}
		public static radianToDegree(radian: number) {
			return radian * (180 / Math.PI);
		}
	}
	//Defines a point in space and utility functions
	export class Coord {
		constructor(public x: number = 0, public y: number = 0) {

		}
		public static distanceBetweenCoords(coordA: Coord, coordB: Coord): number {
			return Math.sqrt(Math.pow(coordA.x - coordB.x, 2) + Math.pow(coordA.y - coordB.y, 2));
		}
		public static angleBetweenCoords(coordA: Coord, coordB: Coord): Angle {
			var angle = Math.atan2(coordA.y - coordB.y, coordA.x - coordB.x) * 180 / Math.PI;
			if (angle < 0) {
				angle = Math.abs(angle - 180);
			}

			return new Angle(angle);
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
		//Add a force based upon Coord
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
		public get() {
			return this.velocity;
		}
		public set(force: Coord = this.velocity): Vector {
			this.velocity = force;
			return this;
		}
		public getAngle() {
			return Coord.angleBetweenCoords(new Coord(), this.velocity);
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
	//Resources consists of a graphic file and optionally a descriptor JSON file
	//Resources are loaded before game launch and referenced by assigned ID
	export class Resource {
		private static id: 0;
		public static Resources: Resource[] = [];
		public resource: HTMLImageElement | string | any = null;
		public descriptor: IDescriptor = null;
		public ready: boolean = false;
		public static get(id: string): Resource {
			var resource = this.Resources
				.filter(function (a) {
					return a.id == id;
				});
			if (resource.length > 0) {
				return resource[0];
			}
		}
		constructor(public fileLocation: string, public descriptorLocation: string = null, public id: string = "#" + (Resource.id++)) {
			var self = this;
			var ready = 2;
			if (descriptorLocation == null) {
				testReady();
			}
			function testReady() {
				ready--;
				if (ready <= 0) {
					self.ready = true;
				}
			}

			//resource
			if (fileLocation.match(/\.png$|\.jpg$|\.bmp$|\.gif$/ig) !== null) {
				//Image
				this.resource = document.createElement("img");
				this.resource.onload = function loaded() {
					testReady();
				}
				this.resource.src = this.fileLocation;
			} else if (fileLocation.match(/\.json$/ig) !== null) {
				//JSON
				var req = new XMLHttpRequest();
				req.open('GET', fileLocation);
				req.overrideMimeType("application/json");
				req.onreadystatechange = function loaded() {
					self.resource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
					testReady()
				}
				req.send();
			} else if (fileLocation.match(/\.m4a$|\.mp3$|\.ogg/ig) !== null) {
				//Sound
				var req = new XMLHttpRequest();
				req.open('GET', fileLocation);
				req.onreadystatechange = function loaded() {
					self.resource = req.responseText;
					testReady()
				}
				req.send();
			} else {
				//Unkown filetype
				var req = new XMLHttpRequest();
				req.open('GET', fileLocation);
				req.onreadystatechange = function loaded() {
					self.resource = req.responseText;
					testReady()
				}
				req.send();
			}

			//descriptor
			if (descriptorLocation != null) {
				if (descriptorLocation.match(/\.json$/ig) !== null) {
					//JSON
					var req = new XMLHttpRequest();
					req.open('GET', descriptorLocation);
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
}
//initialize load
//in the future this should be elsewhere
module tanks {
	new Resource("resources/single-tank-red.png", "resources/single-tank-red.json", "tanksprite");
	new Resource("resources/bullet_normal.png", "resources/bullet_normal.json", "bulletsprite");
}
