/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
module tanks {

	interface IWorldSettings {
		resolution?: number;
	}

	export class World {
		public static worldActive: boolean = false;
		public static settings: IWorldSettings = {}
		public static canvas: HTMLCanvasElement = null;
		private static updatehandle;
		public static players: Player[] = [];
		public static frame: number = 0;
		public static create(canvas: HTMLCanvasElement = null) {
			World.canvas = canvas;
			//Generate players
			World.players.push(
				new Player({
					position: new Coord(
						40, 40
					)
				}),
				new Player({
					position: new Coord(
						parseInt(canvas.getAttribute("width")) - 40,
						parseInt(canvas.getAttribute("height")) - 40
					),
					angle: new Angle(180)
				})
			);
			//Start "World"
			//event listener
			window.addEventListener("keydown", World.listener, false);
			window.addEventListener("keyup", World.listener, false);
			World.worldActive = true;

			var startInterval = setInterval(function () {
				if (Resource.Resources.filter(function (a) { return a.ready == false })) {
					clearInterval(startInterval);
					World.update(true);
				}
			}, 4);
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
				case 17: World.players[0].controls.shoot = value; break;
				//Player 2
				case 87: World.players[1].controls.forward = value; break;
				case 83: World.players[1].controls.backward = value; break;
				case 65: World.players[1].controls.left = value; break;
				case 68: World.players[1].controls.right = value; break;
				case 32: World.players[1].controls.shoot = value; break;
			}
		}
		public static update(changes: boolean = false) {
			//Runs every frame
			if (World.worldActive !== true) {
				return false;
			}
			World.updatehandle = requestAnimationFrame(function () { World.update(); });

			World.frame++;

			//Simulate terrain
			//Simulate players
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];
				var cos = Math.cos(Angle.degreetoRadian(player.angle.get()));
				var sin = Math.sin(Angle.degreetoRadian(player.angle.get()));

				//Controls
				if (Math.abs(player.momentum.velocity.x) + Math.abs(player.momentum.velocity.y) > 0) {
					player.momentum.degrade();

					player.position.x += player.momentum.get().x;
					player.position.y += player.momentum.get().y;

					changes = true;
				}
				if (player.controls.forward || player.controls.backward) {
					var direction = (player.controls.backward ? 0 - 1 : 1);
					player.anim.name = "move";
					player.anim.count += direction;

					player.momentum.addForce(new Coord(
						(player.acceleration * cos) * direction,
						(player.acceleration * sin) * direction
					));

					player.position.x += player.momentum.get().x;
					player.position.y += player.momentum.get().y;
					changes = true;
				}
				if (player.controls.left || player.controls.right) {
					var turn = (player.controls.left ? 0 - 1 : 1);
					if (!player.controls.forward && !player.controls.backward) {
						player.anim.name = "move";
						player.anim.count += 1;
					}

					player.angle.set(player.turnrate * turn);

					changes = true;
				}
				if (player.controls.shoot) {
					player.shoot();
					changes = true;
				}

				if (changes) {
					//Fix player animation overflow
					var animation = player.sprite.descriptor.anim
						.filter(function findAnimation(anim) {
							return anim.name === player.anim.name;
						})[0];
					var animationState = Math.floor(
						player.anim.count /
						animation.rate
					);
					if (animationState < 0) {
						player.anim.count = (animation.count * animation.rate) - 1;
					} else if (animationState >= animation.count) {
						player.anim.count = 0;
					}
				}
			}
			//Simulate bullets
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];
				for (var projectileIndex = 0; projectileIndex < player.projectiles.length; projectileIndex++) {
					changes = true;
					var projectile = player.projectiles[projectileIndex];
					projectile.lifespan--;
					projectile.anim.count += 1;
					if (projectile.lifespan < 1) {
						player.projectiles.splice(projectileIndex, 1);
						continue;
					}
					projectile.position.x += projectile.momentum.get().x;
					projectile.position.y += projectile.momentum.get().y;
				}
			}
			//Draw if changes
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
					player.sprite.resource,
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
			for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
				var player = World.players[playerIndex];
				for (var projectileIndex = 0; projectileIndex < player.projectiles.length; projectileIndex++) {
					var projectile = player.projectiles[projectileIndex];

					//Modify canvas
					ctx.translate(projectile.position.x, projectile.position.y);
					ctx.rotate(Angle.degreetoRadian(projectile.angle.get()));

					//Draw image
					var animation = projectile.sprite.descriptor.anim
						.filter(function findAnimation(anim) {
							return anim.name === projectile.anim.name;
						})[0]
					var animationState = Math.floor(
						projectile.anim.count /
						animation.rate
					);
					if (animationState >= animation.count) {
						animationState = 0;
						projectile.anim.count = animationState;
					} else if (animationState < 0) {
						animationState = animation.count - 1;
						projectile.anim.count = animationState;
					}

					ctx.drawImage(
						projectile.sprite.resource,
						animationState * projectile.sprite.descriptor.width,
						animation.top,
						projectile.sprite.descriptor.width,
						projectile.sprite.descriptor.height,
						0 - Math.floor(projectile.sprite.descriptor.width / 2),
						0 - Math.floor(projectile.sprite.descriptor.height / 2),
						projectile.sprite.descriptor.width,
						projectile.sprite.descriptor.height
					);

					//Reset canvas
					ctx.rotate(0 - Angle.degreetoRadian(projectile.angle.get()));
					ctx.translate(0 - projectile.position.x, 0 - projectile.position.y);
				}

			}
			//Paint ui
			ctx.restore();
		}
		public static kill() {
			cancelAnimationFrame(World.updatehandle);
			World.worldActive = false;
			World.players = [];
			World.frame = 0;
			window.removeEventListener("keydown", World.listener, false);
			window.removeEventListener("keyup", World.listener, false);
		}
	}
}
