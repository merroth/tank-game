var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="game.utility.ts" />
//This file contains gameobject classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
var tanks;
(function (tanks) {
    var Actor = (function () {
        function Actor(parameters) {
            if (parameters === void 0) { parameters = {}; }
            this.position = new tanks.Coord();
            this.angle = new tanks.Angle();
            this.momentum = new tanks.Vector();
            this.acceleration = 0;
            this.size = 0;
            this.anim = { name: "", count: 0 };
            this.turnrate = 1;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
        }
        return Actor;
    }());
    tanks.Actor = Actor;
    var Projectile = (function (_super) {
        __extends(Projectile, _super);
        function Projectile(parameters) {
            if (parameters === void 0) { parameters = {}; }
            _super.call(this, parameters);
            this.lifespan = 1;
            this.size = 10;
            this.sprite = tanks.Ressource.get("bulletsprite");
            this.anim = { name: "move", count: 0 };
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
        }
        return Projectile;
    }(Actor));
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(parameters) {
            if (parameters === void 0) { parameters = {}; }
            _super.call(this, parameters);
            this.projectiles = [];
            this.sprite = tanks.Ressource.get("tanksprite");
            this.anim = { name: "idle", count: 0 };
            this.momentum = new tanks.Vector(new tanks.Coord(), 2, 0.95);
            this.acceleration = 0.05;
            this.size = 32;
            this.turnrate = 1;
            this.controls = {
                forward: false,
                backward: false,
                left: false,
                right: false,
                shoot: false
            };
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
        }
        Player.prototype.shoot = function () {
            var projectile = new Projectile({
                lifespan: 100,
                owner: this,
                position: new tanks.Coord(this.position.x, this.position.y),
                angle: new tanks.Angle(this.angle.degree),
                momentum: new tanks.Vector(new tanks.Coord(Math.cos(tanks.Angle.degreetoRadian(this.angle.degree)) * 4, Math.sin(tanks.Angle.degreetoRadian(this.angle.degree)) * 4), 4, 1)
            });
            this.projectiles.push(projectile);
        };
        return Player;
    }(Actor));
    tanks.Player = Player;
})(tanks || (tanks = {}));
