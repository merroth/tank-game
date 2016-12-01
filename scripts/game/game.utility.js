//This file contains utility elements for the game engine.
var tanks;
(function (tanks) {
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
        Coord.distanceBetweenCoords = function (coordA, coordB) {
            return Math.sqrt(Math.pow(coordA.x - coordB.x, 2) + Math.pow(coordA.y - coordB.y, 2));
        };
        Coord.angleBetweenCoords = function (coordA, coordB) {
            var angle = Math.atan2(coordA.y - coordB.y, coordA.x - coordB.x) * 180 / Math.PI;
            if (angle < 0) {
                angle = Math.abs(angle - 180);
            }
            return new Angle(angle);
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
        //Add a force based upon Coord
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
        Vector.prototype.getAngle = function () {
            return Coord.angleBetweenCoords(new Coord(), this.velocity);
        };
        return Vector;
    }());
    tanks.Vector = Vector;
    //Resources consists of a graphic file and optionally a descriptor JSON file
    //Resources are loaded before game launch and referenced by assigned ID
    var Resource = (function () {
        function Resource(fileLocation, descriptorLocation, id) {
            if (descriptorLocation === void 0) { descriptorLocation = null; }
            if (id === void 0) { id = "#" + (Resource.id++); }
            this.fileLocation = fileLocation;
            this.descriptorLocation = descriptorLocation;
            this.id = id;
            this.resource = null;
            this.descriptor = null;
            this.ready = false;
            var self = this;
            var ready = 2;
            if (descriptorLocation == null) {
                testReady();
            }
            function testReady() {
                ready--;
                if (ready <= 0) {
                    self.ready = true;
                }
            }
            //resource
            if (fileLocation.match(/\.png$|\.jpg$|\.bmp$|\.gif$/ig) !== null) {
                //Image
                this.resource = document.createElement("img");
                this.resource.onload = function loaded() {
                    testReady();
                };
                this.resource.src = this.fileLocation;
            }
            else if (fileLocation.match(/\.json$/ig) !== null) {
                //JSON
                var req = new XMLHttpRequest();
                req.open('GET', fileLocation);
                req.overrideMimeType("application/json");
                req.onreadystatechange = function loaded() {
                    self.resource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
                    testReady();
                };
                req.send();
            }
            else if (fileLocation.match(/\.m4a$|\.mp3$|\.ogg/ig) !== null) {
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
                req.open('GET', fileLocation);
                req.onreadystatechange = function loaded() {
                    self.resource = req.responseText;
                    testReady();
                };
                req.send();
            }
            //descriptor
            if (descriptorLocation != null) {
                if (descriptorLocation.match(/\.json$/ig) !== null) {
                    //JSON
                    var req = new XMLHttpRequest();
                    req.open('GET', descriptorLocation);
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
})(tanks || (tanks = {}));
//initialize load
//in the future this should be elsewhere
var tanks;
(function (tanks) {
    new tanks.Resource("resources/single-tank-red.png", "resources/single-tank-red.json", "tanksprite");
    new tanks.Resource("resources/bullet_normal.png", "resources/bullet_normal.json", "bulletsprite");
    new tanks.Resource("resources/sfx/menu_back.m4a", null, "menuback");
    new tanks.Resource("resources/sfx/menu_select.m4a", null, "menuselect");
    new tanks.Resource("resources/sfx/bullet_bounce.m4a", null, "bulletbounce");
    new tanks.Resource("resources/sfx/bullet_spawn.m4a", null, "bulletspawn");
    new tanks.Resource("resources/sfx/tank_hit.m4a", null, "tankhit");
    new tanks.Resource("resources/sfx/tank_die.m4a", null, "tankdie");
})(tanks || (tanks = {}));
