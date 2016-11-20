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

	interface IPlayerControls {
		forward: boolean;
		backward: boolean;
		left: boolean;
		right: boolean;
		shoot: boolean;
	}
	class Player {
		public size: number = 32;
		public movespeed: number = 4;
		public turnrate: number = 4;
		constructor(public position: Coord, public color: string = (function () {
			var keys: string[] = "123456789abcdef".split("");
			var color: string = "#";
			while (color.length < 7) {
				color = color + keys[Math.floor(Math.random() * (keys.length - 1))];
			}
			return color;
		})(), public angle = new Angle(), public controls: IPlayerControls = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			shoot: false
		}) {

		}
	}
	export class World {
		public static worldActive: boolean = false;
		public static canvas: HTMLCanvasElement = null;
		private static updatehandle;
		public static players: Player[] = [];
		public static create(canvas: HTMLCanvasElement = null) {
			World.canvas = canvas;
			//Generate players
			World.players.push(
				new Player(
					new Coord(
						40, 40
					), "#0000ff"
				),
				new Player(
					new Coord(
						parseInt(canvas.getAttribute("width")) - 40,
						parseInt(canvas.getAttribute("height")) - 40
					), "#00ff00", new Angle(180)
				)
			);
			//Start "World"
			//event listener
			function listener(evt: KeyboardEvent) {
				switch (evt.keyCode) {
					//Player 1
					case 38:
						World.players[0].controls.forward = (evt.type == "keydown" ? true : false);
						World.players[0].controls.backward = false;
						break;
					case 40:
						World.players[0].controls.forward = false;
						World.players[0].controls.backward = (evt.type == "keydown" ? true : false);
						break;
					case 37:
						World.players[0].controls.left = (evt.type == "keydown" ? true : false);
						World.players[0].controls.right = false;
						break;
					case 39:
						World.players[0].controls.left = false;
						World.players[0].controls.right = (evt.type == "keydown" ? true : false);
						break;
					//Player 2
					case 87:
						World.players[1].controls.forward = (evt.type == "keydown" ? true : false);
						World.players[1].controls.backward = false;
						break;
					case 83:
						World.players[1].controls.forward = false;
						World.players[1].controls.backward = (evt.type == "keydown" ? true : false);
						break;
					case 65:
						World.players[1].controls.left = (evt.type == "keydown" ? true : false);
						World.players[1].controls.right = false;
						break;
					case 68:
						World.players[1].controls.left = false;
						World.players[1].controls.right = (evt.type == "keydown" ? true : false);
				}

			}
			window.addEventListener("keydown", listener, false);
			window.addEventListener("keyup", listener, false);
			World.worldActive = true;
			World.update(true);
			return World;
		}
		public static update(changes: boolean = false) {
			//Runs every frame
			if (World.worldActive !== true) {
				return false;
			}
			World.updatehandle = requestAnimationFrame(World.update);

			//Simulate terrain
			//Simulate players
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];
				var cos = Math.cos(Angle.degreetoRadian(player.angle.get()));
				var sin = Math.sin(Angle.degreetoRadian(player.angle.get()));
				for (var keyIndex in player.controls) {
					if (player.controls.hasOwnProperty(keyIndex)) {
						var key = player.controls[keyIndex];
						if (key == true) {
							var direction = 1;
							switch (keyIndex) {
								case "backward": direction = 0 - direction;
								case "forward":
									player.position.x += (player.movespeed * cos) * direction;
									player.position.y += (player.movespeed * sin) * direction;
									changes = true;
									break;
								case "left":
									player.angle.set(0 - player.turnrate);
									changes = true; break;
								case "right":
									player.angle.set(player.turnrate);
									changes = true; break;
							}
						}
					}
				}
			}
			//Simulate bullets
			if (changes === true) {
				console.log("draw");

				World.draw();
			} else {
				console.log("skip");
			}
		}
		public static draw() {
			var ctx: CanvasRenderingContext2D = World.canvas.getContext("2d");
			ctx.save();
			//clear rect
			ctx.clearRect(0, 0, parseInt(World.canvas.getAttribute("width")), parseInt(World.canvas.getAttribute("height")));
			//Paint world
			//Paint players
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];
				//Modify canvas
				ctx.fillStyle = player.color;
				ctx.translate(player.position.x, player.position.y);
				ctx.rotate(Angle.degreetoRadian(player.angle.get()));
				//Draw shape
				ctx.fillRect(0 - player.size / 2, 0 - player.size / 2, player.size, player.size);
				ctx.fillStyle = "#ff0000";
				ctx.fillRect(player.size / 2 - 1, -1, 2, 2);
				//Reset canvas
				ctx.rotate(0 - Angle.degreetoRadian(player.angle.get()));
				ctx.translate(0 - player.position.x, 0 - player.position.y);
			}
			//Paint bullets
			//Paint ui
			ctx.restore();
		}
		public static kill() {
			cancelAnimationFrame(World.updatehandle);
			World.worldActive = false;
			World.players = [];
		}
	}
}