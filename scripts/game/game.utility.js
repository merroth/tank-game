//This file contains utility elements for the game engine.
var tanks;
(function (tanks) {
    //Defines the concept of an "angle" and utility functions concerning said points
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
    //Defines a point in space and utility functions concerning said points
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
    //Ressources consists of a graphic file and optionally a descriptor JSON file
    //Ressources are loaded before game launch and referenced by assigned ID
    var Ressource = (function () {
        function Ressource(fileLocation, descriptorLocation, id) {
            if (descriptorLocation === void 0) { descriptorLocation = null; }
            if (id === void 0) { id = "#" + (Ressource.id++); }
            this.fileLocation = fileLocation;
            this.descriptorLocation = descriptorLocation;
            this.id = id;
            this.ressource = null;
            this.descriptor = null;
            this.ready = false;
            var self = this;
            var ready = 2;
            if (descriptorLocation == null) {
                ready--;
            }
            function testReady() {
                ready--;
                if (ready <= 0) {
                    self.ready = true;
                }
            }
            //ressource
            if (fileLocation.match(/\.png$|.jpg$|.bmp$|.gif$/ig) !== null) {
                //Image
                this.ressource = document.createElement("img");
                this.ressource.onload = function loaded() {
                    testReady();
                };
                this.ressource.src = this.fileLocation;
            }
            else if (fileLocation.match(/\.json$/ig) !== null) {
                //JSON
                var req = new XMLHttpRequest();
                req.open('GET', fileLocation);
                req.onreadystatechange = function loaded() {
                    self.ressource = JSON.parse(req.responseText.replace(/\n|\t/ig, " "));
                    testReady();
                };
                req.send();
            }
            else {
                //Unkown filetype
                var req = new XMLHttpRequest();
                req.open('GET', fileLocation);
                req.onreadystatechange = function loaded() {
                    self.ressource = req.responseText;
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
                    req.onreadystatechange = function () {
                        if (req.readyState === 4) {
                            self.descriptor = JSON.parse(req.responseText);
                            testReady();
                        }
                    };
                    req.send();
                }
            }
            Ressource.Ressources.push(this);
        }
        Ressource.get = function (id) {
            var ressource = this.Ressources
                .filter(function (a) {
                return a.id == id;
            });
            if (ressource.length > 0) {
                return ressource[0];
            }
        };
        Ressource.Ressources = [];
        return Ressource;
    }());
    tanks.Ressource = Ressource;
})(tanks || (tanks = {}));
//initialize load
//in the future this should be elsewhere
var tanks;
(function (tanks) {
    new tanks.Ressource("resources/single-tank-red.png", "resources/single-tank-red.json", "tanksprite");
})(tanks || (tanks = {}));
