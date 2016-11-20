var tanks;
(function (tanks) {
    var Angle = (function () {
        function Angle(degree) {
            if (degree === void 0) { degree = 0; }
            this.degree = degree;
            this.degree = this.degree % 360;
        }
        Angle.prototype.set = function (degree) {
            this.degree = (this.degree + degree) % 360;
            return this;
        };
        Angle.prototype.get = function () {
            return this.degree;
        };
        Angle.degreetoRadian = function (degree) {
            return degree * (Math.PI / 180);
        };
        Angle.radianToDegree = function (radian) {
            return radian * (180 / Math.PI);
        };
        return Angle;
    }());
    var Coord = (function () {
        function Coord(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Coord.distance = function (coordA, coordB) {
            return Math.sqrt(Math.pow(coordA.x - coordB.x, 2) + Math.pow(coordA.y - coordB.y, 2));
        };
        Coord.angle = function (coordA, coordB) {
            var angle = Math.atan2(coordA.y - coordB.y, coordA.x - coordB.x) * 180 / Math.PI;
            if (angle < 0) {
                angle = Math.abs(angle - 180);
            }
            return new Angle(angle);
        };
        return Coord;
    }());
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
            if (angle === void 0) { angle = new Angle(); }
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
            this.size = 32;
            this.movespeed = 4;
            this.turnrate = 4;
        }
        return Player;
    }());
    var World = (function () {
        function World() {
        }
        World.create = function (canvas) {
            if (canvas === void 0) { canvas = null; }
            World.canvas = canvas;
            //Generate players
            World.players.push(new Player(new Coord(40, 40), "#0000ff"), new Player(new Coord(parseInt(canvas.getAttribute("width")) - 40, parseInt(canvas.getAttribute("height")) - 40), "#00ff00", new Angle(180)));
            //Start "World"
            //event listener
            function listener(evt) {
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
        };
        World.update = function (changes) {
            if (changes === void 0) { changes = false; }
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
                                    changes = true;
                                    break;
                                case "right":
                                    player.angle.set(player.turnrate);
                                    changes = true;
                                    break;
                            }
                        }
                    }
                }
            }
            //Simulate bullets
            if (changes === true) {
                console.log("draw");
                World.draw();
            }
            else {
                console.log("skip");
            }
        };
        World.draw = function () {
            var ctx = World.canvas.getContext("2d");
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
        };
        World.kill = function () {
            cancelAnimationFrame(World.updatehandle);
            World.worldActive = false;
            World.players = [];
        };
        World.worldActive = false;
        World.canvas = null;
        World.players = [];
        return World;
    }());
    tanks.World = World;
})(tanks || (tanks = {}));
