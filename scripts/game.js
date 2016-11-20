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
        function Player(position, color, angle) {
            if (color === void 0) { color = (function () {
                var keys = "123456789abcdef".split("");
                var color = "#";
                while (color.length < 7) {
                    color = color + keys[Math.floor(Math.random() * (keys.length - 1))];
                }
                return color;
            })(); }
            if (angle === void 0) { angle = new Angle(); }
            this.position = position;
            this.color = color;
            this.angle = angle;
        }
        return Player;
    }());
    var World = (function () {
        function World() {
        }
        World.create = function (canvas, players) {
            if (canvas === void 0) { canvas = null; }
            if (players === void 0) { players = 1; }
            World.canvas = canvas;
            //Generate players
            while (World.players.length < players) {
                World.players.push(new Player(new Coord(Math.floor(Math.random() * parseInt(canvas.getAttribute("width"))), Math.floor(Math.random() * parseInt(canvas.getAttribute("height"))))));
            }
            //Start "World"
            World.worldActive = true;
            World.update();
            return World;
        };
        World.update = function () {
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
        };
        World.draw = function () {
            //Runs if frame needs to repaint
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
