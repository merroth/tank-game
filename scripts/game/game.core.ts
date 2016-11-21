/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
module tanks {

	export interface IPlayerControls {
		forward: boolean;
		backward: boolean;
		left: boolean;
		right: boolean;
		shoot: boolean;
	}
	export interface IPlayerAnimation {
		name: string;
		count: number;
	}
	export class Player {
		public sprite: Ressource = Ressource.get("tanksprite");
		public anim: IPlayerAnimation = { name: "idle", count: 0 };
		public size: number = 32;
		public movespeed: number = 1;
		public turnrate: number = 1;
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
	//initial load of player statics:

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
			window.addEventListener("keydown", World.listener, false);
			window.addEventListener("keyup", World.listener, false);
			World.worldActive = true;

			setTimeout(function () {
				World.update(true);
			}, 2500);
			return World;
		}
		public static listener(evt: KeyboardEvent) {
			var value: boolean = (evt.type == "keydown" ? true : false);
			switch (evt.keyCode) {
				//Player 1
				case 38: World.players[0].controls.forward = value; break;
				case 40: World.players[0].controls.backward = value; break;
				case 37: World.players[0].controls.left = value; break;
				case 39: World.players[0].controls.right = value; break;
				//Player 2
				case 87: World.players[1].controls.forward = value; break;
				case 83: World.players[1].controls.backward = value; break;
				case 65: World.players[1].controls.left = value; break;
				case 68: World.players[1].controls.right = value; break;
			}
		}
		public static update(changes: boolean = false) {
			//Runs every frame
			if (World.worldActive !== true) {
				return false;
			}
			World.updatehandle = requestAnimationFrame(function () { World.update(); });

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
							var turn = 1;
							switch (keyIndex) {
								case "backward": direction = 0 - direction;
								case "forward":
									player.anim.name = "move";
									player.anim.count += direction;

									player.position.x += (player.movespeed * cos) * direction;
									player.position.y += (player.movespeed * sin) * direction;
									changes = true;
									break;
								case "left": turn = 0 - 1;
								case "right":
									player.anim.name = "move";
									player.anim.count += turn;

									player.angle.set(player.turnrate * turn);
									changes = true;
									break;
							}
						}
					}
				}
			}
			//Simulate bullets
			if (changes === true) {
				World.draw();
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
				ctx.translate(player.position.x, player.position.y);
				ctx.rotate(Angle.degreetoRadian(player.angle.get()));

				//Draw image
				var animation = player.sprite.descriptor.anim
					.filter(function findAnimation(anim) {
						return anim.name === player.anim.name;
					})[0]
				var animationState = Math.floor(
					player.anim.count /
					animation.rate
				);
				if (animationState >= animation.count) {
					animationState = 0;
					player.anim.count = animationState;
				} else if (animationState < 0) {
					animationState = animation.count - 1;
					player.anim.count = animationState;
				}

				ctx.drawImage(
					player.sprite.ressource,
					animationState * player.sprite.descriptor.width,
					animation.top,
					player.sprite.descriptor.width,
					player.sprite.descriptor.height,
					0 - Math.floor(player.sprite.descriptor.width / 2),
					0 - Math.floor(player.sprite.descriptor.height / 2),
					player.sprite.descriptor.width,
					player.sprite.descriptor.height
				);

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
			window.removeEventListener("keydown", World.listener, false);
			window.removeEventListener("keyup", World.listener, false);
		}
	}
}