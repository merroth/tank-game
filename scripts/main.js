var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//This file contains utility elements for the game engine.
var tanks;
(function (tanks) {
    /* utility interfaces & enums */
    //Enum for rendering order
    var EZindex;
    (function (EZindex) {
        //Dont assign values, simply move lines up or down to change rendering order
        EZindex[EZindex["background"] = 0] = "background";
        EZindex[EZindex["terrain"] = 1] = "terrain";
        EZindex[EZindex["sub-sfx"] = 2] = "sub-sfx";
        EZindex[EZindex["actor"] = 3] = "actor";
        EZindex[EZindex["actor-sfx"] = 4] = "actor-sfx";
        EZindex[EZindex["projectile"] = 5] = "projectile";
        EZindex[EZindex["top-sfx"] = 6] = "top-sfx";
        EZindex[EZindex["ui"] = 7] = "ui";
    })(EZindex = tanks.EZindex || (tanks.EZindex = {}));
    //Container for basic elements like funtions or shapes
    var Basics;
    (function (Basics) {
        //Distance betweem two coordinates
        function distance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
        Basics.distance = distance;
        //Angle betweem two coordinates
        function angleBetweenPoints(x1, y1, x2, y2) {
            var angle = (Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI) % 360;
            if (angle < 0) {
                angle = Math.abs(angle - 180);
            }
            return angle;
        }
        Basics.angleBetweenPoints = angleBetweenPoints;
    })(Basics = tanks.Basics || (tanks.Basics = {}));
    //Defines the concept of an "angle" and utility functions
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
    tanks.Angle = Angle;
    //Defines a point in space and utility functions
    var Coord = (function () {
        function Coord(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        //Distance between points wrapped for Coords
        Coord.distanceBetweenCoords = function (coordA, coordB) {
            return Basics.distance(coordA.x, coordA.y, coordB.x, coordB.y);
        };
        //Angle between points formular wrapped for Coords
        Coord.angleBetweenCoords = function (coordA, coordB) {
            return new Angle(Basics.angleBetweenPoints(coordA.x, coordA.y, coordB.x, coordB.y));
        };
        return Coord;
    }());
    tanks.Coord = Coord;
    //Defines a force in space, based upon Coord
    var Vector = (function () {
        function Vector(velocity, max, degradeForce) {
            if (velocity === void 0) { velocity = new Coord(); }
            if (max === void 0) { max = Infinity; }
            if (degradeForce === void 0) { degradeForce = 0.95; }
            this.velocity = velocity;
            this.max = max;
            this.degradeForce = degradeForce;
        }
        //Degrade the current momentum by an overridable factor
        Vector.prototype.degrade = function (degradeForce) {
            if (degradeForce === void 0) { degradeForce = this.degradeForce; }
            this.velocity.x *= this.degradeForce;
            this.velocity.y *= this.degradeForce;
            return this;
        };
        //Reverse the Vector to point in the opposite direction
        Vector.prototype.reverse = function () {
            this.velocity.x = -1 * this.velocity.x;
            this.velocity.y = -1 * this.velocity.y;
            return this;
        };
        //Add a Coord force to the Vector
        Vector.prototype.addForce = function (force) {
            if (force === void 0) { force = new Coord(); }
            this.velocity.x += force.x;
            if (Math.abs(this.velocity.x) > this.max) {
                this.velocity.x = (this.velocity.x > 0 ? this.max : 0 - this.max);
            }
            this.velocity.y += force.y;
            if (Math.abs(this.velocity.y) > this.max) {
                this.velocity.y = (this.velocity.y > 0 ? this.max : 0 - this.max);
            }
            return this;
        };
        Vector.prototype.get = function () {
            return this.velocity;
        };
        Vector.prototype.set = function (force) {
            if (force === void 0) { force = this.velocity; }
            this.velocity = force;
            return this;
        };
        //Get angle of force
        Vector.prototype.getAngle = function () {
            return Coord.angleBetweenCoords(new Coord(), this.velocity);
        };
        return Vector;
    }());
    tanks.Vector = Vector;
    //More Basics
    (function (Basics) {
        //Shape is a base class for other Shapes
        //This class isn't exported because it shouldn't be used raw
        var Shape = (function () {
            function Shape() {
            }
            return Shape;
        }());
        //Circle contains mathematical formulars and data for a circle
        //This can easily be used for range factors and collisions
        var Circle = (function (_super) {
            __extends(Circle, _super);
            function Circle(origo, radius) {
                if (origo === void 0) { origo = new Coord(); }
                if (radius === void 0) { radius = 0; }
                var _this = _super.call(this) || this;
                _this.origo = origo;
                _this.radius = radius;
                return _this;
            }
            Circle.areaToRadius = function (area) {
                return area / Math.PI;
            };
            //omkreds
            Circle.prototype.circumference = function () {
                return 2 * this.radius * Math.PI;
            };
            //areal
            Circle.prototype.area = function () {
                return Math.PI * (this.radius * this.radius);
            };
            //korde
            Circle.prototype.chord = function (v) {
                if (v === void 0) { v = 1; }
                return 2 * this.radius * Math.sin(Angle.degreetoRadian(v) / 2);
            };
            return Circle;
        }(Shape));
        Basics.Circle = Circle;
        //Rect contains mathematical formulars and data for a rectangle
        var Rect = (function (_super) {
            __extends(Rect, _super);
            function Rect(top, right, bottom, left, angle) {
                if (angle === void 0) { angle = new Angle(); }
                var _this = _super.call(this) || this;
                _this.top = top;
                _this.right = right;
                _this.bottom = bottom;
                _this.left = left;
                _this.angle = angle;
                return _this;
            }
            //omkreds
            Rect.prototype.circumference = function () {
                return 2 * (Basics.distance(this.left, this.top, this.left, this.bottom) +
                    Basics.distance(this.left, this.top, this.right, this.top));
            };
            //areal
            Rect.prototype.area = function () {
                return Basics.distance(this.left, this.top, this.left, this.bottom) *
                    Basics.distance(this.left, this.top, this.right, this.top);
            };
            //Diagonal length of box
            Rect.prototype.diagonal = function () {
                return Basics.distance(this.left, this.top, this.right, this.bottom);
            };
            return Rect;
        }(Shape));
        Basics.Rect = Rect;
        //Shortest length between any point on a line and and a circle
        function shortestDistanceBetweenLineAndCircle(circleOrigo, startPoint, endPoint) {
            var A = circleOrigo.x - startPoint.x;
            var B = circleOrigo.y - startPoint.y;
            var C = endPoint.x - startPoint.x;
            var D = endPoint.y - startPoint.y;
            var dot = A * C + B * D;
            var len_sq = C * C + D * D;
            var param = -1;
            if (len_sq != 0) {
                param = dot / len_sq;
            }
            var xx, yy;
            if (param < 0) {
                xx = startPoint.x;
                yy = startPoint.y;
            }
            else if (param > 1) {
                xx = endPoint.x;
                yy = endPoint.y;
            }
            else {
                xx = startPoint.x + param * C;
                yy = startPoint.y + param * D;
            }
            var dx = circleOrigo.x - xx;
            var dy = circleOrigo.y - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
        Basics.shortestDistanceBetweenLineAndCircle = shortestDistanceBetweenLineAndCircle;
        //Calculate if a Circle overlaps a Rect
        function overlapCircleRect(c, r) {
            //If topleft of Rect is more than Circle radius + Rect diagonal away, then there is no way they overlap
            if (c.radius + r.diagonal() > Coord.distanceBetweenCoords(c.origo, new Coord(r.left, r.top))) {
                return false;
            }
            //if Circle origo is inside rect, return true
            if (r.left <= c.origo.x && c.origo.x <= r.right && c.origo.y >= r.top && c.origo.y <= r.bottom) {
                return true;
            }
            //if any wall intersects the circle
            if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.top), new Coord(r.right, r.top)) < c.radius) {
                return true;
            }
            else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.top), new Coord(r.left, r.bottom)) < c.radius) {
                return true;
            }
            else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.left, r.bottom), new Coord(r.right, r.bottom)) < c.radius) {
                return true;
            }
            else if (shortestDistanceBetweenLineAndCircle(c.origo, new Coord(r.right, r.top), new Coord(r.right, r.bottom)) < c.radius) {
                return true;
            }
            //Return false if no overlap found
            return false;
        }
        Basics.overlapCircleRect = overlapCircleRect;
        //Shape overlap
        //Used for collisions
        function shapeOverlap(objA, objB) {
            if (objA instanceof Rect && objB instanceof Rect) {
                return objA.right >= objB.left && objA.bottom >= objB.top
                    && objB.right >= objA.left && objB.bottom >= objA.top;
            }
            else if (objA instanceof Circle && objB instanceof Circle) {
                return Coord.distanceBetweenCoords(objA.origo, objB.origo) <= objA.radius + objB.radius;
            }
            else if (objA instanceof Rect && objB instanceof Circle) {
                return overlapCircleRect(objB, objA);
            }
            else if (objA instanceof Circle && objB instanceof Rect) {
                return overlapCircleRect(objA, objB);
            }
            return false;
        }
        Basics.shapeOverlap = shapeOverlap;
    })(Basics = tanks.Basics || (tanks.Basics = {}));
    //Resources consists of a graphic file and optionally a descriptor JSON file
    //Resources are loaded before game launch and referenced by assigned ID
    var Resource = (function () {
        function Resource(parameters) {
            if (parameters === void 0) { parameters = { fileLocation: "" }; }
            this.resource = null;
            this.descriptor = null;
            this.ready = false;
            this.fileLocation = "";
            this.descriptorLocation = null;
            this.id = "#" + (Resource.id++);
            var self = this;
            var ready = 2;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
            if (this.descriptorLocation == null) {
                testReady();
            }
            function testReady() {
                ready--;
                if (ready <= 0) {
                    self.ready = true;
                }
            }
            //resource
            if (this.fileLocation.match(/\.png$|\.jpg$|\.bmp$|\.gif$/ig) !== null) {
                //Image
                this.resource = document.createElement("img");
                this.resource.onload = function loaded() {
                    testReady();
                };
                this.resource.src = this.fileLocation;
            }
            else if (this.fileLocation.match(/\.json$/ig) !== null) {
                //JSON
                var req = new XMLHttpRequest();
                req.open('GET', this.fileLocation);
                req.overrideMimeType("application/json");
                req.onreadystatechange = function loaded() {
                    self.resource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
                    testReady();
                };
                req.send();
            }
            else if (this.fileLocation.match(/\.m4a$|\.mp3$|\.ogg/ig) !== null) {
                //Sound
                this.resource = document.createElement("audio");
                this.resource.onload = function loaded() {
                    testReady();
                };
                this.resource.src = this.fileLocation;
            }
            else {
                //Unkown filetype
                var req = new XMLHttpRequest();
                req.open('GET', this.fileLocation);
                req.onreadystatechange = function loaded() {
                    self.resource = req.responseText;
                    testReady();
                };
                req.send();
            }
            //descriptor
            if (this.descriptorLocation != null) {
                if (this.descriptorLocation.match(/\.json$/ig) !== null) {
                    //JSON
                    var req = new XMLHttpRequest();
                    req.open('GET', this.descriptorLocation);
                    req.overrideMimeType("application/json");
                    req.onreadystatechange = function () {
                        if (req.readyState === 4) {
                            self.descriptor = JSON.parse(req.responseText);
                            testReady();
                        }
                    };
                    req.send();
                }
            }
            Resource.Resources.push(this);
        }
        Resource.get = function (id) {
            var resource = this.Resources
                .filter(function (a) {
                return a.id == id;
            });
            if (resource.length > 0) {
                return resource[0];
            }
        };
        return Resource;
    }());
    Resource.Resources = [];
    tanks.Resource = Resource;
    //A class to hold sound specific attributes
    var Sound = (function () {
        function Sound(parameters) {
            if (parameters === void 0) { parameters = { id: "#" + (Sound._id++).toString() }; }
            this.soundBankCount = 1;
            this.soundBanks = [];
            this.resource = null;
            this.id = null;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = parameters[key];
                }
            }
            this.soundBanks.push(this.resource.resource);
            while (this.soundBanks.length < this.soundBankCount) {
                this.soundBanks.push(this.resource.resource.cloneNode());
            }
            Sound.Sounds.push(this);
        }
        Sound.get = function (id) {
            var sound = this.Sounds
                .filter(function (a) {
                return a.id == id;
            });
            if (sound.length > 0) {
                return sound[0];
            }
        };
        Sound.prototype.play = function (force) {
            if (force === void 0) { force = false; }
            for (var soundBankIndex = 0; soundBankIndex < this.soundBanks.length; soundBankIndex++) {
                var soundBank = this.soundBanks[soundBankIndex];
                if (soundBank.paused) {
                    soundBank.play();
                    return this;
                }
            }
            if (force) {
                var sfx = this.soundBanks[0];
                sfx.currentTime = 0;
                sfx.play();
            }
            return this;
        };
        Sound.prototype.pause = function (rewind) {
            if (rewind === void 0) { rewind = false; }
            for (var soundBankIndex = 0; soundBankIndex < this.soundBanks.length; soundBankIndex++) {
                this.soundBanks[soundBankIndex].pause();
                if (rewind) {
                    this.soundBanks[soundBankIndex].currentTime = 0;
                }
            }
            return this;
        };
        return Sound;
    }());
    Sound._id = 0;
    Sound.Sounds = [];
    tanks.Sound = Sound;
})(tanks || (tanks = {}));
//initialize load
//in the future this should be elsewhere
(function (tanks) {
    //Resources
    new tanks.Resource({ fileLocation: "resources/single-tank-red.png", descriptorLocation: "resources/single-tank-red.json", id: "tanksprite" });
    new tanks.Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletsprite" });
    new tanks.Resource({ fileLocation: "resources/bullet_burning.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletburningsprite" });
    new tanks.Resource({ fileLocation: "resources/wall.png", id: "wall" });
    new tanks.Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
    new tanks.Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_bounce.m4a", id: "sfxBulletBounce" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_spawn.m4a", id: "sfxBulletSpawn" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_hit.m4a", id: "sfxBulletHit" });
    new tanks.Resource({ fileLocation: "resources/sfx/tank_die.m4a", id: "sfxTankDie" });
    //Sound
    new tanks.Sound({ id: "sfxMenuBack", resource: tanks.Resource.get("sfxMenuBack") });
    new tanks.Sound({ id: "sfxMenuSelect", resource: tanks.Resource.get("sfxMenuSelect") });
    new tanks.Sound({ id: "sfxBulletBounce", resource: tanks.Resource.get("sfxBulletBounce") });
    new tanks.Sound({ id: "sfxBulletSpawn", resource: tanks.Resource.get("sfxBulletSpawn"), soundBankCount: 10 });
    new tanks.Sound({ id: "sfxBulletHit", resource: tanks.Resource.get("sfxBulletHit"), soundBankCount: 4 });
    new tanks.Sound({ id: "sfxTankDie", resource: tanks.Resource.get("sfxTankDie"), soundBankCount: 4 });
})(tanks || (tanks = {}));
/// <reference path="game.utility.ts" />
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
            if (changes === void 0) { changes = World.frame % 15 === 0; }
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
            var _loop_1 = function (actorIndex) {
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
                        if (actor instanceof tanks.Projectile && collisionSuspect instanceof tanks.Player && collisionSuspect != actor.owner.owner) {
                            collisionSuspect.hitPoints -= actor.damage;
                            actor.lifespan = 0;
                            actor.hit = true;
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
        return World;
    }());
    World.worldActive = false;
    World.settings = {};
    World.canvas = null;
    World.players = [];
    World.frame = 0;
    tanks.World = World;
})(tanks || (tanks = {}));
/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/angularjs/angular.d.ts" />
/// <reference path="definitions/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="game/game.core.ts" />
var tanks;
(function (tanks) {
    tanks.tankApp = angular
        .module('tankApp', [
        'ui.router',
    ])
        .controller('homeCtrl', ['$scope', function ($scope) {
        }])
        .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('home', {
                url: '/',
                templateUrl: 'view/frontpage',
                controller: 'homeCtrl'
            });
        }])
        .controller('optionsCtrl', ['$scope', function ($scope) {
        }])
        .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('options', {
                url: '/options',
                templateUrl: 'view/options',
                controller: 'optionsCtrl'
            });
        }])
        .controller('gameCtrl', ['$scope', function ($scope) {
            //Generate world paramenters
            var canvas = document.getElementById("gameCanvas");
            //Create world
            var world = tanks.World.create(canvas);
            //Listen for "destroy"
            $scope.$on("$destroy", function (event) {
                //Kill world
                tanks.World.kill();
            });
        }])
        .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('game', {
                url: '/game',
                templateUrl: 'view/gamepage',
                controller: 'gameCtrl'
            });
        }]);
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains the base gameo bject class for the game engine.
//This "Actor" class holds information relevant to every kind of object in the game world
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
        return Actor;
    }());
    Actor._actors = [];
    tanks.Actor = Actor;
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//Projectiles contains classes for each kind of projectile in the game
//A projectile is a self propelling game object without direct user control, usually intended for dealing damage
var tanks;
(function (tanks) {
    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(parameters) {
            if (parameters === void 0) { parameters = { from: null, to: null }; }
            var _this = _super.call(this, parameters) || this;
            _this.size = 32;
            _this.sprite = tanks.Resource.get("bulletsprite");
            _this.from = null;
            _this.to = null;
            _this.render = false;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            _this.angle = tanks.Coord.angleBetweenCoords(_this.from, _this.to);
            return _this;
            //this.collision = new Basics.Circle(this.position, this.size / 2);
        }
        Wall.prototype.update = function () {
            var self = this;
            return true;
        };
        Wall.prototype.die = function () {
        };
        return Wall;
    }(tanks.Actor));
    tanks.Wall = Wall;
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//Projectiles contains classes for each kind of projectile in the game
//A projectile is a self propelling game object without direct user control, usually intended for dealing damage
var tanks;
(function (tanks) {
    var Projectile = (function (_super) {
        __extends(Projectile, _super);
        function Projectile(parameters) {
            if (parameters === void 0) { parameters = { owner: null }; }
            var _this = _super.call(this, parameters) || this;
            _this.lifespan = 1;
            _this.owner = null;
            _this.damage = 34;
            _this.size = 8;
            _this.hit = false;
            _this.sprite = tanks.Resource.get("bulletsprite");
            _this.anim = { name: "idle", count: 0 };
            _this.zIndex = tanks.EZindex.projectile;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            _this.collision = new tanks.Basics.Circle(_this.position, _this.size / 2);
            return _this;
        }
        Projectile.prototype.update = function () {
            var self = this;
            self.lifespan--;
            self.anim.count += 1;
            if (self.lifespan < 1) {
                if (self.hit) {
                    tanks.Sound.get('sfxBulletHit').play();
                }
                else {
                    tanks.Sound.get('sfxBulletBounce').play();
                }
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
            self.owner.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
            self.owner.projectiles.splice(self.owner.projectiles.indexOf(self), 1);
            //die
            self._die();
        };
        return Projectile;
    }(tanks.Actor));
    Projectile.repeatFire = false;
    tanks.Projectile = Projectile;
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains weapon sets for the player objects
//A weapon is a "hardpoint" for players that can manage meta information for projectiles such as fireRate or fireArc
//or their position/angle relative to their respective player objects
var tanks;
(function (tanks) {
    var Weapon = (function (_super) {
        __extends(Weapon, _super);
        function Weapon(parameters) {
            if (parameters === void 0) { parameters = { owner: null }; }
            var _this = _super.call(this, parameters) || this;
            //Lifespan of projectiles
            _this.lifespan = 100;
            //Type of projectile fired (This contains projectile relevant data like damage)
            _this.projectileType = tanks.Projectile;
            //List of fired projectiles
            _this.projectiles = [];
            //Bullet spread by angle
            _this.fireArc = new tanks.Angle();
            //Weapon angle (as offset to parent angle)
            _this.angle = new tanks.Angle();
            //Position on parent (as offset by angle, numbers should be 2 equal numbers)
            _this.position = new tanks.Coord();
            //A reference to parent
            _this.owner = null;
            //If this weapon can be destroyed
            _this.hitpoint = Infinity;
            //Time between shots
            _this.fireRateMax = 20;
            //Countdown between shots
            _this.fireRate = 0;
            //Maximum allowed projectiles from this weapon at any given moment
            _this.maxProjectiles = Infinity;
            //Does this weapon have a renderable part?
            _this.render = false;
            //Speed of projectiles fired by this weapon
            _this.speed = 4;
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            return _this;
        }
        Weapon.prototype.update = function () {
            var self = this;
            self.cool();
            return false;
        };
        Weapon.prototype.cool = function (amount) {
            if (amount === void 0) { amount = 1; }
            if (this.fireRate > 0) {
                this.fireRate -= amount;
            }
            return this;
        };
        Weapon.prototype.shoot = function () {
            var self = this;
            if (self.fireRate < 1 && self.projectiles.length < self.maxProjectiles) {
                self.fireRate = self.fireRateMax * 1;
                var arcDegree = (Math.random() * self.fireArc.degree) - (self.fireArc.degree / 2);
                var degrees = self.owner.angle.degree + self.angle.degree + arcDegree;
                var cos = Math.cos(tanks.Angle.degreetoRadian(degrees));
                var sin = Math.sin(tanks.Angle.degreetoRadian(degrees));
                tanks.Sound.get('sfxBulletSpawn').play();
                var projectile = new self.projectileType({
                    lifespan: self.lifespan,
                    owner: self,
                    position: new tanks.Coord(self.owner.position.x + cos * self.position.x, self.owner.position.y + sin * self.position.y),
                    angle: new tanks.Angle(degrees),
                    momentum: new tanks.Vector(new tanks.Coord(cos * self.speed, sin * self.speed), self.speed, 1)
                });
                self.owner.projectiles.push(projectile);
                self.projectiles.push(projectile);
            }
            return this;
        };
        return Weapon;
    }(tanks.Actor));
    tanks.Weapon = Weapon;
    var WeaponTankFlameThrower = (function (_super) {
        __extends(WeaponTankFlameThrower, _super);
        function WeaponTankFlameThrower(parameters) {
            if (parameters === void 0) { parameters = { owner: null }; }
            var _this = _super.call(this, parameters) || this;
            _this.lifespan = 20;
            _this.fireRateMax = 20;
            _this.speed = 1.3;
            _this.fireArc = new tanks.Angle(45);
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            return _this;
        }
        return WeaponTankFlameThrower;
    }(Weapon));
    tanks.WeaponTankFlameThrower = WeaponTankFlameThrower;
    var WeaponTankMainGun = (function (_super) {
        __extends(WeaponTankMainGun, _super);
        function WeaponTankMainGun(parameters) {
            if (parameters === void 0) { parameters = { owner: null }; }
            var _this = _super.call(this, parameters) || this;
            _this.lifespan = 100;
            _this.fireRateMax = 200;
            _this.speed = 4;
            _this.fireArc = new tanks.Angle(10);
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            return _this;
        }
        return WeaponTankMainGun;
    }(Weapon));
    tanks.WeaponTankMainGun = WeaponTankMainGun;
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains the player class
//The player class describes a players "Actor", deals in control schemes and holds important information like hitPoints
//Notice that player classes should never produce a "Projectile" on its own, but rather use "weaponBanks" as an in-between
var tanks;
(function (tanks) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(parameters) {
            if (parameters === void 0) { parameters = {}; }
            var _this = _super.call(this, parameters) || this;
            _this.weaponBanks = [];
            _this.projectiles = [];
            _this.sprite = tanks.Resource.get("tanksprite");
            _this.anim = { name: "idle", count: 0 };
            _this.momentum = new tanks.Vector(new tanks.Coord(), 2, 0.92);
            _this.acceleration = 0.05;
            _this.size = 32;
            _this.turnrate = 1;
            _this.hitPoints = 100;
            _this.controls = {
                forward: false,
                backward: false,
                left: false,
                right: false,
                shoot: false
            };
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key) && _this.hasOwnProperty(key)) {
                    _this[key] = parameters[key];
                }
            }
            _this.collision = new tanks.Basics.Circle(_this.position, _this.size / 2.2);
            //These are "Proof of concept" for gunplacement and gun modification.
            //Real implementations should have a derived subclass to reference directly
            //instead of modifying the existing one directly
            _this.weaponBanks.push(
            //Flamethrower
            new tanks.WeaponTankFlameThrower({
                position: new tanks.Coord(10, 10),
                owner: _this,
                angle: new tanks.Angle(180)
            }), 
            //Main gun
            new tanks.WeaponTankMainGun({
                owner: _this,
                position: new tanks.Coord(10, 10)
            }));
            return _this;
        }
        Player.prototype.update = function () {
            var self = this;
            var changes = false;
            if (self.hitPoints < 1) {
                tanks.Sound.get('sfxTankDie').play();
                self.die();
                console.log("PLAYER " + (tanks.World.players.indexOf(self) * 1 + 1) + " IS DEAD!");
            }
            //cooldowns
            for (var b = 0; b < self.weaponBanks.length; b++) {
                var bank = self.weaponBanks[b];
                bank.cool();
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
            if (self.controls.shoot) {
                for (var w = 0; w < self.weaponBanks.length; w++) {
                    var bank = self.weaponBanks[w];
                    bank.shoot();
                }
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
        return Player;
    }(tanks.Actor));
    tanks.Player = Player;
})(tanks || (tanks = {}));
