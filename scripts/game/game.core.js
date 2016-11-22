/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
var tanks;
(function (tanks) {
    var Player = (function () {
        function Player(position, color, angle, controls) {
            if (color === void 0) { color = (function () {
                var keys = "123456789abcdef".split("");
                var color = "#";
                while (color.length < 7) {
                    color = color + keys[Math.floor(Math.random() * (keys.length - 1))];
                }
                return color;
            })(); }
            if (angle === void 0) { angle = new tanks.Angle(); }
            if (controls === void 0) { controls = {
                forward: false,
                backward: false,
                left: false,
                right: false,
                shoot: false
            }; }
            this.position = position;
            this.color = color;
            this.angle = angle;
            this.controls = controls;
            this.sprite = tanks.Ressource.get("tanksprite");
            this.anim = { name: "idle", count: 0 };
            this.size = 32;
            this.movespeed = 1;
            this.turnrate = 1;
        }
        return Player;
    }());
    tanks.Player = Player;
    //initial load of player statics:
    var World = (function () {
        function World() {
        }
        World.create = function (canvas) {
            if (canvas === void 0) { canvas = null; }
            World.canvas = canvas;
            //Generate players
            World.players.push(new Player(new tanks.Coord(40, 40), "#0000ff"), new Player(new tanks.Coord(parseInt(canvas.getAttribute("width")) - 40, parseInt(canvas.getAttribute("height")) - 40), "#00ff00", new tanks.Angle(180)));
            //Start "World"
            //event listener
            window.addEventListener("keydown", World.listener, false);
            window.addEventListener("keyup", World.listener, false);
            World.worldActive = true;
            setTimeout(function () {
                World.update(true);
            }, 2500);
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
            }
        };
        World.update = function (changes) {
            if (changes === void 0) { changes = false; }
            //Runs every frame
            if (World.worldActive !== true) {
                return false;
            }
            World.updatehandle = requestAnimationFrame(function () { World.update(); });
            //Simulate terrain
            //Simulate players
            for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
                var player = World.players[playerIndex];
                var cos = Math.cos(tanks.Angle.degreetoRadian(player.angle.get()));
                var sin = Math.sin(tanks.Angle.degreetoRadian(player.angle.get()));
                for (var keyIndex in player.controls) {
                    if (player.controls.hasOwnProperty(keyIndex)) {
                        var key = player.controls[keyIndex];
                        if (key === true) {
                            var direction = 1;
                            var turn = 1;
                            switch (keyIndex) {
                                case "backward":
                                    direction = 0 - direction;
                                case "forward":
                                    player.anim.name = "move";
                                    player.anim.count += direction;
                                    player.position.x += (player.movespeed * cos) * direction;
                                    player.position.y += (player.movespeed * sin) * direction;
                                    changes = true;
                                    break;
                                case "left":
                                    turn = 0 - 1;
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
        };

        World.draw = function () {
            var ctx = World.canvas.getContext("2d");
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
            ctx.save();
            //clear rect
            ctx.clearRect(0, 0, parseInt(World.canvas.getAttribute("width")), parseInt(World.canvas.getAttribute("height")));
            //Paint world
            //Paint players
            for (var playerIndex = 0; playerIndex < World.players.length; playerIndex++) {
                var player = World.players[playerIndex];
                //Modify canvas
                ctx.translate(player.position.x, player.position.y);
                ctx.rotate(tanks.Angle.degreetoRadian(player.angle.get()));
                //Draw image
                var animation = player.sprite.descriptor.anim
                    .filter(function findAnimation(anim) {
                    return anim.name === player.anim.name;
                })[0];
                var animationState = Math.floor(player.anim.count /
                    animation.rate);
                if (animationState >= animation.count) {
                    animationState = 0;
                    player.anim.count = animationState;
                }
                else if (animationState < 0) {
                    animationState = animation.count - 1;
                    player.anim.count = animationState;
                }
                ctx.drawImage(player.sprite.ressource, animationState * player.sprite.descriptor.width, animation.top, player.sprite.descriptor.width, player.sprite.descriptor.height, 0 - Math.floor(player.sprite.descriptor.width / 2), 0 - Math.floor(player.sprite.descriptor.height / 2), player.sprite.descriptor.width, player.sprite.descriptor.height);
                //Reset canvas
                ctx.rotate(0 - tanks.Angle.degreetoRadian(player.angle.get()));
                ctx.translate(0 - player.position.x, 0 - player.position.y);
            }
            //Paint bullets
            //Paint ui
            ctx.restore();
        };
        World.kill = function () {
            cancelAnimationFrame(World.updatehandle);
            World.worldActive = false;
            World.players = [];
            window.removeEventListener("keydown", World.listener, false);
            window.removeEventListener("keyup", World.listener, false);
        };
        World.worldActive = false;
        World.canvas = null;
        World.players = [];
        return World;
    }());
    tanks.World = World;
})(tanks || (tanks = {}));
