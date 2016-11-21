//This file contains utility elements for the game engine.
module tanks {
	//Defines the concept of an "angle" and utility functions concerning said points
	export class Angle {
		constructor(public degree: number = 0) {
			this.degree = this.degree % 360;
		}
		public set(degree: number) {
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
	//Defines a point in space and utility functions concerning said points
	export class Coord {
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
		constructor(public x: number = 0, public y: number = 0) {

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
	//Ressources consists of a graphic file and optionally a descriptor JSON file
	//Ressources are loaded before game launch and referenced by assigned ID
	export class Ressource {
		private static id: 0;
		public static Ressources: Ressource[] = [];
		public ressource: HTMLImageElement | string | any = null;
		public descriptor: IDescriptor = null;
		public ready: boolean = false;
		public static get(id: string): Ressource {
			var ressource = this.Ressources
				.filter(function (a) {
					return a.id == id;
				});
			if (ressource.length > 0) {
				return ressource[0];
			}
		}
		constructor(public fileLocation: string, public descriptorLocation: string = null, public id: string = "#" + (Ressource.id++)) {
			var self = this;
			var ready = 2;
			if (descriptorLocation == null) {
				ready--;
			}
			function testReady() {
				ready--;
				if (ready <= 0) {
					self.ready = true;
				}
			}

			//ressource
			if (fileLocation.match(/\.png$|.jpg$|.bmp$|.gif$/ig) !== null) {
				//Image
				this.ressource = document.createElement("img");
				this.ressource.onload = function loaded() {
					testReady();
				}
				this.ressource.src = this.fileLocation;
			} else if (fileLocation.match(/\.json$/ig) !== null) {
				//JSON
				var req = new XMLHttpRequest();
				req.open('GET', fileLocation);
				req.onreadystatechange = function loaded() {
					self.ressource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
					testReady()
				}
				req.send();
			} else {
				//Unkown filetype
				var req = new XMLHttpRequest();
				req.open('GET', fileLocation);
				req.onreadystatechange = function loaded() {
					self.ressource = req.responseText;
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
					req.onreadystatechange = function () {
						if (req.readyState === 4) {
							self.descriptor = JSON.parse(req.responseText);
							testReady()
						}
					}
					req.send();
				}
			}
			Ressource.Ressources.push(this);
		}
	}
}
//initialize load
//in the future this should be elsewhere
module tanks {
	new Ressource("resources/single-tank-red.png", "resources/single-tank-red.json", "tanksprite");
}