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
            this.sprite = null;
            this.anim = { name: "", count: 0 };
            this.turnrate = 1;
            this.zIndex = tanks.EZindex.actor;
            this.render = true;
            this.collision = null;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
            Actor._actors.push(this);
        }
        //Do thing on each frame
        Actor.prototype.update = function () {
            return false;
        };
        Actor.prototype._die = function () {
            Actor._actors.splice(Actor._actors.indexOf(this), 1);
        };
        Actor.prototype.die = function () {
            this._die();
        };
        Actor._actors = [];
        return Actor;
    }());
    tanks.Actor = Actor;
    var Projectile = (function (_super) {
        __extends(Projectile, _super);
        function Projectile(parameters) {
            if (parameters === void 0) { parameters = {}; }
            _super.call(this, parameters);
            this.lifespan = 1;
            this.owner = null;
            this.damage = 34;
            this.size = 8;
            this.sprite = tanks.Resource.get("bulletsprite");
            this.anim = { name: "idle", count: 0 };
            this.zIndex = tanks.EZindex.projectile;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
            this.collision = new tanks.Basics.Circle(this.position, this.size / 2);
        }
        Projectile.prototype.update = function () {
            var self = this;
            self.lifespan--;
            self.anim.count += 1;
            if (self.lifespan < 1) {
                tanks.Sound.get('sfxBulletBounce').play();
                self.die();
                return false;
            }
            self.position.x += self.momentum.get().x;
            self.position.y += self.momentum.get().y;
            return true;
        };
        Projectile.prototype.die = function () {
            var self = this;
            //Remove from owner
            self.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
            //die
            self._die();
        };
        return Projectile;
    }(Actor));
    tanks.Projectile = Projectile;
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(parameters) {
            if (parameters === void 0) { parameters = {}; }
            _super.call(this, parameters);
            this.projectiles = [];
            this.sprite = tanks.Resource.get("tanksprite");
            this.anim = { name: "idle", count: 0 };
            this.momentum = new tanks.Vector(new tanks.Coord(), 2, 0.92);
            this.acceleration = 0.05;
            this.size = 32;
            this.turnrate = 1;
            this.canShoot = 0;
            this.hitPoints = 100;
            this.fireRate = 20;
            this.maxProjectiles = 10;
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
            this.collision = new tanks.Basics.Circle(this.position, this.size / 2);
        }
        Player.prototype.update = function () {
            var self = this;
            var changes = false;
            if (self.hitPoints < 1) {
                alert("PLAYER " + (tanks.World.players.indexOf(self) * 1 + 1) + " IS DEAD!");
                self.hitPoints = 100;
            }
            //cooldowns
            if (self.canShoot > 0) {
                self.canShoot--;
            }
            var cos = Math.cos(tanks.Angle.degreetoRadian(self.angle.get()));
            var sin = Math.sin(tanks.Angle.degreetoRadian(self.angle.get()));
            //Controls
            if (Math.abs(self.momentum.velocity.x) + Math.abs(self.momentum.velocity.y) > 0) {
                self.momentum.degrade();
                self.position.x += self.momentum.get().x;
                self.position.y += self.momentum.get().y;
                changes = true;
            }
            if (self.controls.forward || self.controls.backward) {
                var direction = (self.controls.backward ? 0 - 1 : 1);
                self.anim.name = "move";
                self.anim.count += direction;
                self.momentum.addForce(new tanks.Coord((self.acceleration * cos) * direction, (self.acceleration * sin) * direction));
                self.position.x += self.momentum.get().x;
                self.position.y += self.momentum.get().y;
                changes = true;
            }
            if (self.controls.left || self.controls.right) {
                var turn = (self.controls.left ? 0 - 1 : 1);
                if (!self.controls.forward && !self.controls.backward) {
                    self.anim.name = "turn";
                    self.anim.count += turn;
                }
                self.angle.set(self.turnrate * turn);
                changes = true;
            }
            if (self.controls.shoot && self.canShoot < 1 && self.projectiles.length < self.maxProjectiles) {
                self.shoot();
                changes = true;
            }
            if (changes) {
                //Fix self animation overflow
                var animation = self.sprite.descriptor.anim
                    .filter(function findAnimation(anim) {
                    return anim.name === self.anim.name;
                })[0];
                var animationState = Math.floor(self.anim.count /
                    animation.rate);
                if (animationState < 0) {
                    self.anim.count = (animation.count * animation.rate) - 1;
                }
                else if (animationState >= animation.count) {
                    self.anim.count = 0;
                }
            }
            return changes;
        };
        Player.prototype.shoot = function () {
            this.canShoot = this.fireRate;
            var cos = Math.cos(tanks.Angle.degreetoRadian(this.angle.degree));
            var sin = Math.sin(tanks.Angle.degreetoRadian(this.angle.degree));
            tanks.Sound.get('sfxBulletSpawn').play();
            var projectile = new Projectile({
                lifespan: 100,
                owner: this,
                position: new tanks.Coord(this.position.x + cos * 10, this.position.y + sin * 10),
                angle: new tanks.Angle(this.angle.degree),
                momentum: new tanks.Vector(new tanks.Coord(cos * 4, sin * 4), 4, 1)
            });
            this.projectiles.push(projectile);
            return this;
        };
        return Player;
    }(Actor));
    tanks.Player = Player;
})(tanks || (tanks = {}));
