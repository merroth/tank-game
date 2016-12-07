/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
var tanks;
(function (tanks) {
    var World = (function () {
        function World() {
        }
        World.create = function (canvas) {
            if (canvas === void 0) { canvas = null; }
            World.canvas = canvas;
            //Generate players
            World.players.push(new tanks.Player({
                position: new tanks.Coord(40, 40)
            }), new tanks.Player({
                position: new tanks.Coord(parseInt(canvas.getAttribute("width")) - 40, parseInt(canvas.getAttribute("height")) - 40),
                angle: new tanks.Angle(180)
            }));
            //Start "World"
            //event listener
            window.addEventListener("keydown", World.listener, false);
            window.addEventListener("keyup", World.listener, false);
            World.worldActive = true;
            var startInterval = setInterval(function () {
                if (tanks.Resource.Resources.filter(function (a) { return a.ready == false; })) {
                    clearInterval(startInterval);
                    World.update(true);
                }
            }, 4);
            return World;
        };
        World.listener = function (evt) {
            var value = (evt.type == "keydown" ? true : false);
            switch (evt.keyCode) {
                //Player 1
                case 38:
                    World.players[0].controls.forward = value;
                    break;
                case 40:
                    World.players[0].controls.backward = value;
                    break;
                case 37:
                    World.players[0].controls.left = value;
                    break;
                case 39:
                    World.players[0].controls.right = value;
                    break;
                case 16:
                    World.players[0].controls.shoot = value;
                    break;
                //Player 2
                case 87:
                    World.players[1].controls.forward = value;
                    break;
                case 83:
                    World.players[1].controls.backward = value;
                    break;
                case 65:
                    World.players[1].controls.left = value;
                    break;
                case 68:
                    World.players[1].controls.right = value;
                    break;
                case 32:
                    World.players[1].controls.shoot = value;
                    break;
            }
        };
        World.update = function (changes) {
            if (changes === void 0) { changes = false; }
            //Runs every frame
            if (World.worldActive !== true) {
                return this;
            }
            World.updatehandle = requestAnimationFrame(function () { World.update(); });
            World.frame++;
            //Simulate terrain
            //Simulate actors
            //find actors who can actually collide
            var collisionSuspects = tanks.Actor._actors
                .filter(function collisionSuspectsFilter(actor) {
                return actor.collision != null;
            });
            //Return the largest collision radius to test against
            //We can use this to filter later
            var maxCollisonDistanceToCheck = collisionSuspects
                .map(function maxCollisonToCheckMap(actor) {
                if (actor.collision instanceof tanks.Basics.Circle) {
                    return actor.collision.radius;
                }
                else if (actor.collision instanceof tanks.Basics.Rect) {
                    return actor.collision.diagonal() / 2;
                }
            })
                .sort()
                .slice(0, 1)[0] * 2;
            //Load actors and sort by rendering order
            var actors = tanks.Actor._actors
                .sort(function (a, b) {
                return b.zIndex - a.zIndex;
            });
            var _loop_1 = function(actorIndex) {
                var actor = actors[actorIndex];
                //Remove current actor from collision suspects
                //This way we greatly reduces the amount of checks from n^n to n^log(n)
                collisionSuspects.splice(collisionSuspects.indexOf(actor), 1);
                //Only test collision on object within a realistic vicinity
                var localCollisionSuspects = collisionSuspects
                    .filter(function (suspect) {
                    return tanks.Coord.distanceBetweenCoords(suspect.position, actor.position) <= maxCollisonDistanceToCheck;
                });
                //Test for collision
                for (var collisionSuspectsIndex = 0; collisionSuspectsIndex < localCollisionSuspects.length; collisionSuspectsIndex++) {
                    //current suspect
                    var collisionSuspect = localCollisionSuspects[collisionSuspectsIndex];
                    if (actor === collisionSuspect) {
                        continue;
                    }
                    //Test if collision shapes overlap
                    if (tanks.Basics.shapeOverlap(collisionSuspect.collision, actor.collision)) {
                        //If Projectile on Player collision
                        if (actor instanceof tanks.Projectile && collisionSuspect instanceof tanks.Player && collisionSuspect != actor.owner) {
                            collisionSuspect.hitPoints -= actor.damage;
                            actor.lifespan = 0;
                        }
                        else if (actor instanceof tanks.Player && collisionSuspect instanceof tanks.Player) {
                            //Calculate a force based upon the angle between actors
                            var force = new tanks.Coord(Math.abs(Math.cos(tanks.Angle.degreetoRadian(tanks.Coord.angleBetweenCoords(actor.position, collisionSuspect.position).degree))), Math.abs(Math.sin(tanks.Angle.degreetoRadian(tanks.Coord.angleBetweenCoords(actor.position, collisionSuspect.position).degree))));
                            //Align the force
                            if (actor.position.x < collisionSuspect.position.x) {
                                force.x *= -1;
                            }
                            if (actor.position.y < collisionSuspect.position.y) {
                                force.y *= -1;
                            }
                            //Add the force to the colliding actor
                            actor.momentum.addForce(force);
                            //Add an equal and opposite force to the collisionSuspect
                            collisionSuspect.momentum.addForce(new tanks.Coord(force.x * -1, force.y * -1));
                        }
                    }
                }
                //Run update and listen for changes
                changes = (actor.update() ? true : changes);
            };
            for (var actorIndex = 0; actorIndex < actors.length; actorIndex++) {
                _loop_1(actorIndex);
            }
            //Simulate UI?
            //Draw if changes
            if (changes === true) {
                World.draw();
            }
            return this;
        };
        World.draw = function () {
            var ctx = World.canvas.getContext("2d");
            ctx.save();
            //clear rect
            ctx.clearRect(0, 0, parseInt(World.canvas.getAttribute("width")), parseInt(World.canvas.getAttribute("height")));
            //Paint world
            //Paint actors
            var actorsToDraw = tanks.Actor._actors
                .filter(function filterActorsToDraw(actor) {
                return actor.render == true;
            })
                .sort(function (actorA, actorB) {
                return actorA.zIndex - actorB.zIndex;
            });
            for (var actorIndex = 0; actorIndex < actorsToDraw.length; actorIndex++) {
                var actor = actorsToDraw[actorIndex];
                //Move and rotate canvas to object
                ctx.translate(actor.position.x, actor.position.y);
                ctx.rotate(tanks.Angle.degreetoRadian(actor.angle.get()));
                //Draw image
                //Get current animation
                var animation = actor.sprite.descriptor.anim
                    .filter(function findAnimation(anim) {
                    return anim.name === actor.anim.name;
                })[0];
                //Get current animation state
                var animationState = Math.floor(actor.anim.count /
                    animation.rate);
                //Loop animation
                if (animationState >= animation.count) {
                    animationState = 0;
                    actor.anim.count = animationState;
                }
                else if (animationState < 0) {
                    animationState = animation.count - 1;
                    actor.anim.count = animationState;
                }
                //Draw sprite image
                ctx.drawImage(actor.sprite.resource, animationState * actor.sprite.descriptor.width, animation.top * actor.sprite.descriptor.height, actor.sprite.descriptor.width, actor.sprite.descriptor.height, 0 - Math.floor(actor.sprite.descriptor.width / 2), 0 - Math.floor(actor.sprite.descriptor.height / 2), actor.sprite.descriptor.width, actor.sprite.descriptor.height);
                //Reset canvas
                ctx.rotate(0 - tanks.Angle.degreetoRadian(actor.angle.get()));
                ctx.translate(0 - actor.position.x, 0 - actor.position.y);
            }
            //Paint ui
            ctx.restore();
            return this;
        };
        World.kill = function () {
            //Destroy World
            cancelAnimationFrame(World.updatehandle);
            World.worldActive = false;
            World.players = [];
            World.frame = 0;
            tanks.Actor._actors = [];
            window.removeEventListener("keydown", World.listener, false);
            window.removeEventListener("keyup", World.listener, false);
        };
        World.worldActive = false;
        World.settings = {};
        World.canvas = null;
        World.players = [];
        World.frame = 0;
        return World;
    }());
    tanks.World = World;
})(tanks || (tanks = {}));
