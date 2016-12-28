/// <reference path="game.utility.ts" />
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
					sprite: Resource.get("tankBlueSprite"),
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
				case 16: World.players[0].controls.shoot = value; break;
				//Player 2
				case 87: World.players[1].controls.forward = value; break;
				case 83: World.players[1].controls.backward = value; break;
				case 65: World.players[1].controls.left = value; break;
				case 68: World.players[1].controls.right = value; break;
				case 32: World.players[1].controls.shoot = value; break;
			}
		}
		public static update(changes: boolean = World.frame % 15 === 0): World {
			//Runs every frame
			if (World.worldActive !== true) {
				return this;
			}
			World.updatehandle = requestAnimationFrame(function () { World.update(); });

			World.frame++;

			//Simulate terrain
			//Simulate actors

			//find actors who can actually collide
			var collisionSuspects = Actor._actors
				.filter(function collisionSuspectsFilter(actor) {
					return actor.collision != null;
				});

			//Return the largest collision radius to test against
			//We can use this to filter later
			var maxCollisonDistanceToCheck = collisionSuspects
				.map(function maxCollisonToCheckMap(actor) {
					if (actor.collision instanceof Basics.Circle) {
						return actor.collision.radius;
					} else if (actor.collision instanceof Basics.Rect) {
						return actor.collision.diagonal() / 2;
					}
				})
				.sort()
				.slice(0, 1)[0] * 2;

			//Load actors and sort by rendering order
			var actors = Actor._actors
				.sort(function (a, b) {
					return b.zIndex - a.zIndex;
				});

			for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
				let actor = actors[actorIndex];

				//Remove current actor from collision suspects
				//This way we greatly reduces the amount of checks from n^n to n^log(n)
				collisionSuspects.splice(collisionSuspects.indexOf(actor), 1);

				//Only test collision on object within a realistic vicinity
				let localCollisionSuspects = collisionSuspects
					.filter(function (suspect) {
						return Coord.distanceBetweenCoords(
							suspect.position,
							actor.position
						) <= maxCollisonDistanceToCheck;
					})

				//Test for collision
				for (let collisionSuspectsIndex = 0; collisionSuspectsIndex < localCollisionSuspects.length; collisionSuspectsIndex++) {
					//current suspect
					let collisionSuspect = localCollisionSuspects[collisionSuspectsIndex];

					if (actor === collisionSuspect) { //Shouldn't be possible but just in case:
						continue;
					}
					//Test if collision shapes overlap
					if (Basics.shapeOverlap(collisionSuspect.collision, actor.collision)) {
						//If Projectile on Player collision
						if (actor instanceof Projectile && collisionSuspect instanceof Player && collisionSuspect != actor.owner.owner) {
							collisionSuspect.hitPoints -= actor.damage;
							actor.lifespan = 0;
							actor.hit = true;
						}
						//If Player on Player collision
						else if (actor instanceof Player && collisionSuspect instanceof Player) {
							//Calculate a force based upon the angle between actors
							let force = new Coord(
								Math.abs(Math.cos(
									Angle.degreetoRadian(
										Coord.angleBetweenCoords(
											actor.position, collisionSuspect.position
										).degree
									)
								)),
								Math.abs(Math.sin(
									Angle.degreetoRadian(
										Coord.angleBetweenCoords(
											actor.position, collisionSuspect.position
										).degree
									)
								))
							);
							//Align the force
							if (actor.position.x < collisionSuspect.position.x) {
								force.x *= -1
							}
							if (actor.position.y < collisionSuspect.position.y) {
								force.y *= -1
							}
							//Add the force to the colliding actor
							actor.momentum.addForce(force);
							//Add an equal and opposite force to the collisionSuspect
							collisionSuspect.momentum.addForce(new Coord(force.x * -1, force.y * -1));
						}
					}
				}
				//Run update and listen for changes
				changes = (actor.update() ? true : changes);
			}
			//Simulate UI?

			//Draw if changes
			if (changes === true) {
				World.draw();
			}

			return this;
		}
		public static draw(): World {
			var ctx: CanvasRenderingContext2D = World.canvas.getContext("2d");
			ctx.save();
			//clear rect
			ctx.clearRect(0, 0, parseInt(World.canvas.getAttribute("width")), parseInt(World.canvas.getAttribute("height")));

			//Paint world
			//Paint actors
			var actorsToDraw = Actor._actors
				//filter to renderable actors. maybe filter to actors on canvas in the future?
				.filter(function filterActorsToDraw(actor: Actor) {
					return actor.render == true;
				})
				.sort(function (actorA, actorB) {
					return actorA.zIndex - actorB.zIndex;
				})
				;


			for (var actorIndex = 0; actorIndex < actorsToDraw.length; actorIndex++) {
				var actor = actorsToDraw[actorIndex];

				//Move and rotate canvas to object
				ctx.translate(actor.position.x, actor.position.y);
				ctx.rotate(Angle.degreetoRadian(actor.angle.get()));

				//Draw image

				//Get current animation
				var animation = actor.sprite.descriptor.anim
					.filter(function findAnimation(anim) {
						return anim.name === actor.anim.name;
					})[0];

				//Get current animation state
				var animationState = Math.floor(
					actor.anim.count /
					animation.rate
				);

				//Loop animation
				if (animationState >= animation.count) {
					animationState = 0;
					actor.anim.count = animationState;
				} else if (animationState < 0) {
					animationState = animation.count - 1;
					actor.anim.count = animationState;
				}

				//Draw sprite image
				ctx.drawImage(
					actor.sprite.resource,
					animationState * actor.sprite.descriptor.width,
					animation.top * actor.sprite.descriptor.height,
					actor.sprite.descriptor.width,
					actor.sprite.descriptor.height,
					0 - Math.floor(actor.sprite.descriptor.width / 2),
					0 - Math.floor(actor.sprite.descriptor.height / 2),
					actor.sprite.descriptor.width,
					actor.sprite.descriptor.height
				);

				//Reset canvas
				ctx.rotate(0 - Angle.degreetoRadian(actor.angle.get()));
				ctx.translate(0 - actor.position.x, 0 - actor.position.y);

			}
			//Paint ui
			ctx.restore();

			return this;
		}
		public static kill() {
			//Destroy World
			cancelAnimationFrame(World.updatehandle);
			World.worldActive = false;
			World.players = [];
			World.frame = 0;
			Actor._actors = [];
			window.removeEventListener("keydown", World.listener, false);
			window.removeEventListener("keyup", World.listener, false);
		}
	}
}
