module tanks {
	class Angle {
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
	class Coord {
		public static distance(coordA: Coord, coordB: Coord): number {
			return Math.sqrt(Math.pow(coordA.x - coordB.x, 2) + Math.pow(coordA.y - coordB.y, 2));
		}
		public static angle(coordA: Coord, coordB: Coord): Angle {
			var angle = Math.atan2(coordA.y - coordB.y, coordA.x - coordB.x) * 180 / Math.PI;
			if (angle < 0) {
				angle = Math.abs(angle - 180);
			}

			return new Angle(angle);
		}
		constructor(public x: number = 0, public y: number = 0) {

		}
	}

	class Player {
		constructor(public position: Coord, public color: string = (function () {
			var keys: string[] = "123456789abcdef".split("");
			var color: string = "#";
			while (color.length < 7) {
				color = color + keys[Math.floor(Math.random() * (keys.length - 1))];
			}
			return color;
		})(), public angle = new Angle()) {

		}
	}
	export class World {
		public static worldActive: boolean = false;
		public static canvas: HTMLElement | HTMLCanvasElement = null;
		private static updatehandle;
		public static players: Player[] = [];
		public static create(canvas: HTMLElement | HTMLCanvasElement = null, players: number = 1) {
			World.canvas = canvas;
			//Generate players
			while (World.players.length < players) {
				World.players.push(
					new Player(
						new Coord(
							Math.floor(Math.random() * parseInt(canvas.getAttribute("width"))),
							Math.floor(Math.random() * parseInt(canvas.getAttribute("height")))
						)
					)
				);
			}
			//Start "World"
			World.worldActive = true;
			World.update();
			return World;
		}
		public static update() {
			//Runs every frame
			if (World.worldActive !== true) {
				return false;
			}
			World.updatehandle = requestAnimationFrame(World.update);

			//Draw World
			//Draw players
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];

			}
			//Draw bullets
			//Draw UI

		}
		public static draw() {
			//Runs if frame needs to repaint
		}
		public static kill() {
			cancelAnimationFrame(World.updatehandle);
			World.worldActive = false;
			World.players = [];
		}
	}
}