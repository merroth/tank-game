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
    })(tanks.EZindex || (tanks.EZindex = {}));
    var EZindex = tanks.EZindex;
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
    var Basics;
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
                _super.call(this);
                this.origo = origo;
                this.radius = radius;
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
                _super.call(this);
                this.top = top;
                this.right = right;
                this.bottom = bottom;
                this.left = left;
                this.angle = angle;
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
        Resource.Resources = [];
        return Resource;
    }());
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
        Sound._id = 0;
        Sound.Sounds = [];
        return Sound;
    }());
    tanks.Sound = Sound;
})(tanks || (tanks = {}));
//initialize load
//in the future this should be elsewhere
var tanks;
(function (tanks) {
    //Resources
    new tanks.Resource({ fileLocation: "resources/single-tank-red.png", descriptorLocation: "resources/single-tank-red.json", id: "tanksprite" });
    new tanks.Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletsprite" });
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
