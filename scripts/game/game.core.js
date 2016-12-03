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
                return false;
            }
            World.updatehandle = requestAnimationFrame(function () { World.update(); });
            World.frame++;
            //Simulate terrain
            //Simulate actors
            for (var actorIndex = 0; actorIndex < tanks.Actor._actors.length; actorIndex++) {
                var actor = tanks.Actor._actors[actorIndex];
                changes = (actor.update() ? true : changes);
            }
            //Simulate UI?
            //Draw if changes
            if (changes === true) {
                World.draw();
            }
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
                ctx.translate(actor.position.x, actor.position.y);
                ctx.rotate(tanks.Angle.degreetoRadian(actor.angle.get()));
                //Draw image
                var animation = actor.sprite.descriptor.anim
                    .filter(function findAnimation(anim) {
                    return anim.name === actor.anim.name;
                })[0];
                var animationState = Math.floor(actor.anim.count /
                    animation.rate);
                if (animationState >= animation.count) {
                    animationState = 0;
                    actor.anim.count = animationState;
                }
                else if (animationState < 0) {
                    animationState = animation.count - 1;
                    actor.anim.count = animationState;
                }
                ctx.drawImage(actor.sprite.resource, animationState * actor.sprite.descriptor.width, animation.top * actor.sprite.descriptor.height, actor.sprite.descriptor.width, actor.sprite.descriptor.height, 0 - Math.floor(actor.sprite.descriptor.width / 2), 0 - Math.floor(actor.sprite.descriptor.height / 2), actor.sprite.descriptor.width, actor.sprite.descriptor.height);
                //Reset canvas
                ctx.rotate(0 - tanks.Angle.degreetoRadian(actor.angle.get()));
                ctx.translate(0 - actor.position.x, 0 - actor.position.y);
            }
            //Paint ui
            ctx.restore();
        };
        World.kill = function () {
            cancelAnimationFrame(World.updatehandle);
            World.worldActive = false;
            World.players = [];
            World.frame = 0;
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
