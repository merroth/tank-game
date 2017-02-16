/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
module tanks {

	interface IWorldSettings {
		resolution?: number;
		drawCollisionShapes?: boolean
	}

	export class World {
		public static worldActive: boolean = false;
		public static settings: IWorldSettings = {
			drawCollisionShapes: true
		}
		public static canvas: HTMLCanvasElement = null;
		private static updatehandle;
		public static players: Player[] = [];
		public static frame: number = 0;
		//CLEANUP: spawnPoints should probably be defined in a Level class or something once we make one.
		public static spawnPoints: { angle: Angle, position: Coord }[] = [];
		public static create(canvas: HTMLCanvasElement = null, settings: IWorldSettings = this.settings) {
			World.settings = settings;

			World.spawnPoints.push(
				{ angle: new Angle(0), position: new Coord(40, 40) },
				{ angle: new Angle(180), position: new Coord(parseInt(canvas.getAttribute("width")) - 40, parseInt(canvas.getAttribute("height")) - 40) },
				{ angle: new Angle(270), position: new Coord(40, parseInt(canvas.getAttribute("height")) - 40) },
				{ angle: new Angle(90), position: new Coord(parseInt(canvas.getAttribute("width")) - 40, 40) },
			);

			World.canvas = canvas;

			//Generate players
			for (let i = 0; i < tankApp.Options.playerCount; i++) {
				//TODO: Possibly assign players randomly to spawnPoints, using something like this:
				//World.spawnPoints.splice(Math.floor(Math.random() * World.spawnPoints.length), 1)

				//CLEANUP: capitalizeFirstLetter function might be an idea at this point...
				let color = tankApp.Options.playerColors[i].charAt(0).toUpperCase() + tankApp.Options.playerColors[i].slice(1);

				World.players.push(
					new Player({
						position: World.spawnPoints[i].position,
						angle: World.spawnPoints[i].angle,
						sprite: Resource.get("tank" + color + "Sprite")
					})
				);
			}

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
			var keyBindings = tankApp.userOptions.playerKeyBindings;

			switch (evt.keyCode) {
				//Player 1
				case keyBindings[0].forward: World.players[0].controls.forward = value; break;
				case keyBindings[0].backward: World.players[0].controls.backward = value; break;
				case keyBindings[0].left: World.players[0].controls.left = value; break;
				case keyBindings[0].right: World.players[0].controls.right = value; break;
				case keyBindings[0].shoot: World.players[0].controls.shoot = value; break;

				//Player 2
				case keyBindings[1].forward: World.players[1].controls.forward = value; break;
				case keyBindings[1].backward: World.players[1].controls.backward = value; break;
				case keyBindings[1].left: World.players[1].controls.left = value; break;
				case keyBindings[1].right: World.players[1].controls.right = value; break;
				case keyBindings[1].shoot: World.players[1].controls.shoot = value; break;

				//Player 3
				case keyBindings[2].forward: World.players[2].controls.forward = value; break;
				case keyBindings[2].backward: World.players[2].controls.backward = value; break;
				case keyBindings[2].left: World.players[2].controls.left = value; break;
				case keyBindings[2].right: World.players[2].controls.right = value; break;
				case keyBindings[2].shoot: World.players[2].controls.shoot = value; break;
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


			for (let actorIndex = 0; actorIndex < collisionSuspects.length; actorIndex++) {
				let actor = collisionSuspects[actorIndex];
				if (actor.collision instanceof Basics.Polygon) {
					actor.collision.distributePoints();
				}
			}


			for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
				let actor = actors[actorIndex];

				//Remove current actor from collision suspects
				//This way we greatly reduces the amount of checks from n^n to n^log(n)
				var splices = collisionSuspects.splice(collisionSuspects.indexOf(actor), 1);
				

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
					/* */
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
							//Half the force if is to be distributed between two objects
							//Each object will get half of the force. Future implementations could consider mass.
							if (actor.moveable && collisionSuspect.moveable) {
								force.y *= 0.5;
								force.x *= 0.5;
							}
							//Add the force to the colliding actor
							if (actor.moveable) {
								actor.momentum.addForce(force);
							}
							//Add an equal and opposite force to the collisionSuspect
							if (collisionSuspect.moveable) {
								collisionSuspect.momentum.addForce(new Coord(force.x * -1, force.y * -1));
							}
						}
					}
					/* */
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
				});


			for (var actorIndex = 0; actorIndex < actorsToDraw.length; actorIndex++) {
				var actor = actorsToDraw[actorIndex];

				if (this.settings.drawCollisionShapes === true) {
					if (actor.collision instanceof Basics.Polygon) {
						actor.collision.setAngle(actor.angle);
						actor.collision.buildEdges();

						ctx.beginPath();
						ctx.moveTo(
							actor.collision.edges[0].start.x + actor.position.x,
							actor.collision.edges[0].start.y + actor.position.y
						);
						for (let edgieIndex = 0; edgieIndex < actor.collision.edges.length; edgieIndex++) {
							let edge = actor.collision.edges[edgieIndex];
							ctx.moveTo(
								edge.start.x + actor.position.x,
								edge.start.y + actor.position.y
							);
							ctx.lineTo(
								edge.end.x + actor.position.x,
								edge.end.y + actor.position.y
							);
						}
						ctx.moveTo(
							actor.collision.edges[0].start.x + actor.position.x,
							actor.collision.edges[0].start.y + actor.position.y
						);
						ctx.lineTo(
							actor.collision.edges[0].end.x + actor.position.x,
							actor.collision.edges[0].end.y + actor.position.y
						);
						ctx.stroke();
						ctx.closePath();
					} else {

					}
				}

				//If actor has an abstract drawing method
				if (actor.draw != void 0) {
					actor.draw(ctx);
					continue;
				}

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
			World.spawnPoints = [];
			World.players = [];
			World.frame = 0;
			Actor._actors = [];
			window.removeEventListener("keydown", World.listener, false);
			window.removeEventListener("keyup", World.listener, false);
		}
	}
}
