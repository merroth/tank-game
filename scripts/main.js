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
    //Testing
    tanks.runTests = true;
    function assert(label, statement, exptected) {
        if (label === void 0) { label = "Unlabeled"; }
        if (exptected === void 0) { exptected = true; }
        var str = label + " exptected " + exptected + " found " + statement;
        if (statement != exptected) {
            console.warn(label, "exptected", exptected, "found", statement);
        }
    }
    tanks.assert = assert;
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
        //Would two lines intersect
        //http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function#24392281
        function intersects(l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2) {
            var det, gamma, lamb;
            det = (l1x2 - l1x1) * (l2y2 - l2y1) - (l2x2 - l2x1) * (l1y2 - l1y1);
            if (det === 0) {
                return false;
            }
            else {
                //lamb is progess over x axis
                lamb = ((l2y2 - l2y1) * (l2x2 - l1x1) + (l2x1 - l2x2) * (l2y2 - l1y1)) / det;
                //gamma is progess over y axis
                gamma = ((l1y1 - l1y2) * (l2x2 - l1x1) + (l1x2 - l1x1) * (l2y2 - l1y1)) / det;
                if ((0 < lamb && lamb < 1) && (0 < gamma && gamma < 1)) {
                    return {
                        lamb: lamb, gamma: gamma
                    };
                }
                else {
                    return false;
                }
            }
        }
        Basics.intersects = intersects;
        ;
    })(Basics = tanks.Basics || (tanks.Basics = {}));
    //Defines the concept of an "angle" and utility functions
    var Angle = (function () {
        function Angle(degree) {
            if (degree === void 0) { degree = 0; }
            this.degree = degree;
            this.degree = this.degree % 360;
        }
        Angle.prototype.set = function (degree) {
            this.degree = degree % 360;
            return this;
        };
        Angle.prototype.add = function (degree) {
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
        var Line = (function () {
            function Line(start, end) {
                this.start = start;
                this.end = end;
            }
            Line.intersects = function (a, b) {
                return Basics.intersects(a.start.x, a.start.y, a.end.x, a.end.y, b.start.x, b.start.y, b.end.x, b.end.y) !== false;
            };
            return Line;
        }());
        Basics.Line = Line;
        //Polygons are always closed shapes
        var Polygon = (function (_super) {
            __extends(Polygon, _super);
            function Polygon(origo, points, angle) {
                if (origo === void 0) { origo = new Coord(); }
                if (points === void 0) { points = []; }
                if (angle === void 0) { angle = new Angle(); }
                var _this = _super.call(this) || this;
                _this.origo = origo;
                _this.points = points;
                _this.angle = angle;
                _this.edges = [];
                _this.buildEdges();
                return _this;
            }
            Polygon.intersects = function (p1, p2) {
                for (var p1EdgeIndex = 0; p1EdgeIndex < p1.edges.length; p1EdgeIndex++) {
                    var p1Edge = p1.edges[p1EdgeIndex];
                    for (var p2EdgeIndex = 0; p2EdgeIndex < p2.edges.length; p2EdgeIndex++) {
                        var p2Edge = p2.edges[p2EdgeIndex];
                        var intersection = Line.intersects(p1Edge, p2Edge);
                        if (intersection !== false) {
                            return true;
                        }
                    }
                }
                return false;
            };
            Polygon.containsPoint = function (pol, point) {
                var e = pol.buildEdges().getExtremes(true);
                var count = 0;
                var lineA = new Line(new Coord(e.left - pol.origo.x, point.y - pol.origo.y), new Coord(point.x - pol.origo.x, point.y - pol.origo.y));
                var lineB = new Line(new Coord(point.x - pol.origo.x, e.top - pol.origo.y), new Coord(point.x - pol.origo.x, point.y - pol.origo.y));
                for (var edgeIndex = 0; edgeIndex < pol.edges.length; edgeIndex++) {
                    if (Line.intersects(lineA, pol.edges[edgeIndex]) === true) {
                        count++;
                    }
                }
                if (count > 0 && count % 2 === 1) {
                    return count % 2 === 1;
                }
                count = 0;
                for (var edgeIndex = 0; edgeIndex < pol.edges.length; edgeIndex++) {
                    if (Line.intersects(lineB, pol.edges[edgeIndex]) === true) {
                        count++;
                    }
                }
                if (count > 0 && count % 2 === 1) {
                    return count % 2 === 1;
                }
                return false;
            };
            Polygon.prototype.buildEdges = function () {
                var theta = Angle.degreetoRadian(this.angle.get());
                this.edges = [];
                for (var indexa = 0; indexa < this.points.length; indexa++) {
                    var a = this.points[indexa];
                    var b = this.points[(indexa + 1) % this.points.length];
                    this.edges.push(new Line(new Coord(a.x * Math.cos(theta) - a.y * Math.sin(theta), a.x * Math.sin(theta) + a.y * Math.cos(theta)), new Coord(b.x * Math.cos(theta) - b.y * Math.sin(theta), b.x * Math.sin(theta) + b.y * Math.cos(theta))));
                }
                return this;
            };
            Polygon.prototype.getExtremes = function (applyOrigo) {
                if (applyOrigo === void 0) { applyOrigo = true; }
                this.buildEdges();
                var returner = {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                };
                for (var index = 0; index < this.edges.length; index++) {
                    var edge = this.edges[index];
                    if (Math.min(edge.start.x, edge.end.x) < returner.left) {
                        returner.left = Math.min(edge.start.x, edge.end.x);
                    }
                    if (Math.max(edge.start.x, edge.end.x) > returner.right) {
                        returner.right = Math.max(edge.start.x, edge.end.x);
                    }
                    if (Math.min(edge.start.y, edge.end.y) < returner.top) {
                        returner.top = Math.min(edge.start.y, edge.end.y);
                    }
                    if (Math.max(edge.start.y, edge.end.y) > returner.bottom) {
                        returner.bottom = Math.max(edge.start.y, edge.end.y);
                    }
                }
                if (applyOrigo === true) {
                    returner.top += this.origo.y;
                    returner.bottom += this.origo.y;
                    returner.left += this.origo.x;
                    returner.right += this.origo.x;
                }
                return returner;
            };
            return Polygon;
        }(Shape));
        Basics.Polygon = Polygon;
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            var p1 = new Polygon(new Coord(100, 100), [
                new Coord(-10, -10),
                new Coord(0, 10),
                new Coord(10, -10)
            ], new Angle(45));
            var p2 = new Polygon(new Coord(100, 100), [
                new Coord(-50, -5),
                new Coord(50, -5),
            ], new Angle(45));
            var p3 = new Polygon(new Coord(100, 100), [
                new Coord(-50, -50),
                new Coord(50, -50),
            ], new Angle(45));
            assert("Polygons intersect", Polygon.intersects(p1, p2), true);
            assert("Polygons does not intersect", Polygon.intersects(p1, p3), false);
            assert("Polygon contain point", Polygon.containsPoint(p1, p1.origo), true);
            assert("Polygon does not contain point", Polygon.containsPoint(p1, new Coord(p1.origo.x + 1000, p1.origo.y)), false);
        })();
        var Rect = (function (_super) {
            __extends(Rect, _super);
            function Rect(origo, width, height, angle) {
                if (origo === void 0) { origo = new Coord(); }
                if (width === void 0) { width = 0; }
                if (height === void 0) { height = 0; }
                if (angle === void 0) { angle = new Angle(); }
                var _this = _super.call(this, origo) || this;
                _this.origo = origo;
                _this.width = width;
                _this.height = height;
                _this.angle = angle;
                _this.distributePoints();
                return _this;
            }
            Rect.prototype.setWidth = function (value) {
                if (value === void 0) { value = this.width; }
                this.width = Math.abs(value);
                this.buildEdges();
                return this;
            };
            Rect.prototype.setHeight = function (value) {
                if (value === void 0) { value = this.height; }
                this.height = Math.abs(value);
                this.buildEdges();
                return this;
            };
            Rect.prototype.setAngle = function (value) {
                if (value === void 0) { value = this.angle; }
                if (value instanceof Angle) {
                    this.angle.set(value.degree);
                }
                else {
                    this.angle.set(value);
                }
                this.buildEdges();
                return this;
            };
            Rect.prototype.distributePoints = function () {
                this.points = [
                    //Top Left
                    new Coord(-0.5 * this.width, -0.5 * this.height),
                    //Top Right
                    new Coord(0.5 * this.width, -0.5 * this.height),
                    //Bottom Right
                    new Coord(0.5 * this.width, 0.5 * this.height),
                    //Bottom Left
                    new Coord(-0.5 * this.width, 0.5 * this.height),
                ];
                this.buildEdges();
            };
            Rect.prototype.circumference = function () {
                return 2 * (Basics.distance(0, 0, 0, this.height) +
                    Basics.distance(0, 0, this.width, 0));
            };
            Rect.prototype.area = function () {
                return Basics.distance(0, 0, 0, this.height) *
                    Basics.distance(0, 0, this.width, 0);
            };
            //Diagonal length of box
            Rect.prototype.diagonal = function () {
                return Basics.distance(0, 0, this.width, this.height);
            };
            return Rect;
        }(Polygon));
        Basics.Rect = Rect;
        /* */ // Unit Tests
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            var c = new Rect(new Coord(10, 20), 10, 10);
            assert("Area of rect is 100", Math.floor(c.area()), 100);
            assert("Circumference of rect is 40", Math.floor(c.circumference()), 40);
            assert("Diagonal of rect is 14", Math.floor(c.diagonal()), 14);
        })();
        /* */
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
            Circle.prototype.chord = function (vinkel) {
                if (vinkel === void 0) { vinkel = 1; }
                //https://www.regneregler.dk/cirkel-korde
                return 2 * this.radius * Math.sin(Angle.degreetoRadian(vinkel) / 2);
            };
            return Circle;
        }(Shape));
        Basics.Circle = Circle;
        /* // Unit Tests */
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            var c = new Circle(new Coord(100, 100), 10);
            assert("Area of circle is 314", Math.floor(c.area()), 314);
            assert("Circumference of circle is 62", Math.floor(c.circumference()), 62);
            assert("Chord of circle is radius * 2 (10 * 2)", Math.floor(c.chord(180)), 20);
        })();
        /* */
        //Enum settings for bounce
        var EBounce;
        (function (EBounce) {
            //Moving in negative direction
            EBounce[EBounce["substractive"] = 0] = "substractive";
            //Moving in positive direction
            EBounce[EBounce["additive"] = 1] = "additive";
        })(EBounce || (EBounce = {}));
        //Determine angle of bounceof
        function bounce(incomingAngle, angleOfCollisionTarget, solution) {
            if (solution === void 0) { solution = EBounce.additive; }
            //The Normal is tangent to the angleOfCollisionTarget
            var normal = (solution == EBounce.additive ? angleOfCollisionTarget - 90 : angleOfCollisionTarget + 90);
            //Force between 0 and 360
            if (normal <= 0) {
                normal += 360;
            }
            if (incomingAngle <= 0) {
                incomingAngle += 360;
            }
            //
            var result = 90 * (1 + (angleOfCollisionTarget % 180 / 90)) - incomingAngle + normal;
            //Force result to be a positive degree
            while (result < 0) {
                result += 360;
            }
            return result % 360;
        }
        Basics.bounce = bounce;
        /* // Unit Tests */
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            assert("45 on 0 is 315", bounce(45, 0), 315);
            assert("135 on 0 is 225", bounce(135, 0), 225);
            assert("225 on 0 is 135", bounce(225, 0), 135);
            assert("315 on 0 is 45", bounce(315, 0), 45);
            assert("45 on 90 is 135", bounce(45, 90), 135);
            assert("135 on 90 is 45", bounce(135, 90), 45);
            assert("225 on 90 is 315", bounce(225, 90), 315);
            assert("315 on 90 is 225", bounce(315, 90), 225);
        })();
        /* */
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
        /* */
        //Calculate if a Circle overlaps a Rect
        function overlapCircleRect(c, r) {
            //If distance between origo is more than Circle radius + (0.5 * Rect diagonal) away, then there is no way they overlap
            if (c.radius + (r.diagonal() / 2) < Coord.distanceBetweenCoords(c.origo, r.origo)) {
                return false;
            }
            //if Circle origo is inside Rect or Rect origo inside Circle, return true
            //if (er.left <= c.origo.x && c.origo.x <= er.right && c.origo.y >= er.top && c.origo.y <= er.bottom) {
            if (Polygon.containsPoint(r, c.origo) || Coord.distanceBetweenCoords(c.origo, r.origo) < c.radius) {
                return true;
            }
            //Check collisions on all edges
            for (var edgeIndex = 0; edgeIndex < r.edges.length; edgeIndex++) {
                var edge = r.edges[edgeIndex];
                if (shortestDistanceBetweenLineAndCircle(c.origo, edge.start, edge.end) < c.radius) {
                    return true;
                }
            }
            //Return false if no overlap found
            return false;
        }
        Basics.overlapCircleRect = overlapCircleRect;
        /* // Unit Tests */
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            var c = new Circle(new Coord(6, 6), 10);
            var r = new Rect(new Coord(5, 15), 15, 15);
            assert("Circle and Rect overlap", overlapCircleRect(c, r));
            r.origo.x = 100;
            r.buildEdges();
            assert("Circle and Rect dont overlap", overlapCircleRect(c, r), false);
        })();
        /* */
        //Shape overlap
        //Used for collisions
        /* */
        function shapeOverlap(objA, objB) {
            if (objA instanceof Rect && objB instanceof Rect) {
                return Polygon.intersects(objA, objB) || Polygon.containsPoint(objA, objB.origo) || Polygon.containsPoint(objB, objA.origo);
            }
            else if (objA instanceof Circle && objB instanceof Circle) {
                return Coord.distanceBetweenCoords(objA.origo, objB.origo) <= objA.radius + objB.radius;
            }
            else if (objA instanceof Rect && objB instanceof Circle) {
                return overlapCircleRect(objB, objA) || Polygon.containsPoint(objA, objB.origo);
            }
            else if (objA instanceof Circle && objB instanceof Rect) {
                return overlapCircleRect(objA, objB) || Polygon.containsPoint(objB, objA.origo);
            }
            return false;
        }
        Basics.shapeOverlap = shapeOverlap;
        /* // Unit Tests */
        (function unitTest() {
            if (!tanks.runTests) {
                return false;
            }
            var c1 = new Circle(new Coord(10, 10), 10);
            var c2 = new Circle(new Coord(10, 10), 10);
            var r1 = new Rect(new Coord(15, 15), 15, 15, new Angle(0.05));
            var r2 = new Rect(new Coord(14, 14), 15, 15);
            assert("Shape overlap 1", shapeOverlap(c1, c2));
            assert("Shape overlap 2", shapeOverlap(r1, r2));
            assert("Shape overlap 2.5", shapeOverlap(r1, r2));
            assert("Shape overlap 3", shapeOverlap(c1, r1));
            assert("Shape overlap 4", shapeOverlap(c1, r2));
            assert("Shape overlap 5", shapeOverlap(c2, r1));
            assert("Shape overlap 6", shapeOverlap(c2, r2));
        })();
        /* */
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
            if (tanks.tankApp.userOptions.soundEnabled) {
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
    new tanks.Resource({ fileLocation: "resources/single-tank-red.png", descriptorLocation: "resources/single-tank-red.json", id: "tankRedSprite" });
    new tanks.Resource({ fileLocation: "resources/single-tank-blue.png", descriptorLocation: "resources/single-tank-red.json", id: "tankBlueSprite" });
    new tanks.Resource({ fileLocation: "resources/single-tank-green.png", descriptorLocation: "resources/single-tank-red.json", id: "tankGreenSprite" });
    new tanks.Resource({ fileLocation: "resources/bullet_normal.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletSprite" });
    new tanks.Resource({ fileLocation: "resources/bullet_burning.png", descriptorLocation: "resources/bullet_normal.json", id: "bulletBurningSprite" });
    new tanks.Resource({ fileLocation: "resources/wall.png", id: "wallSprite" });
    new tanks.Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
    new tanks.Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_bounce.m4a", id: "sfxBulletBounce" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_spawn.m4a", id: "sfxBulletSpawn" });
    new tanks.Resource({ fileLocation: "resources/sfx/flamethrower_spawn.m4a", id: "sfxFlamethrowerSpawn" });
    new tanks.Resource({ fileLocation: "resources/sfx/bullet_hit.m4a", id: "sfxBulletHit" });
    new tanks.Resource({ fileLocation: "resources/sfx/tank_die.m4a", id: "sfxTankDie" });
    //Sound
    new tanks.Sound({ id: "sfxMenuBack", resource: tanks.Resource.get("sfxMenuBack") });
    new tanks.Sound({ id: "sfxMenuSelect", resource: tanks.Resource.get("sfxMenuSelect") });
    new tanks.Sound({ id: "sfxBulletBounce", resource: tanks.Resource.get("sfxBulletBounce") });
    new tanks.Sound({ id: "sfxBulletSpawn", resource: tanks.Resource.get("sfxBulletSpawn"), soundBankCount: 10 });
    new tanks.Sound({ id: "sfxFlamethrowerSpawn", resource: tanks.Resource.get("sfxFlamethrowerSpawn"), soundBankCount: 10 });
    new tanks.Sound({ id: "sfxBulletHit", resource: tanks.Resource.get("sfxBulletHit"), soundBankCount: 4 });
    new tanks.Sound({ id: "sfxTankDie", resource: tanks.Resource.get("sfxTankDie"), soundBankCount: 4 });
})(tanks || (tanks = {}));
/// <reference path="game.utility.ts" />
//This file contains core classes for the game engine.
//This file is dependent upon "game.utility.ts", which describes utility elements like "Angle"
var tanks;
(function (tanks) {
    var World = (function () {
        function World() {
        }
        World.create = function (canvas, settings) {
            if (canvas === void 0) { canvas = null; }
            if (settings === void 0) { settings = this.settings; }
            World.settings = settings;
            World.spawnPoints.push({ angle: new tanks.Angle(0), position: new tanks.Coord(40, 40) }, { angle: new tanks.Angle(180), position: new tanks.Coord(parseInt(canvas.getAttribute("width")) - 40, parseInt(canvas.getAttribute("height")) - 40) }, { angle: new tanks.Angle(270), position: new tanks.Coord(40, parseInt(canvas.getAttribute("height")) - 40) }, { angle: new tanks.Angle(90), position: new tanks.Coord(parseInt(canvas.getAttribute("width")) - 40, 40) });
            World.canvas = canvas;
            //Generate players
            for (var i = 0; i < tanks.tankApp.userOptions.playerCount; i++) {
                //TODO: Possibly assign players randomly to spawnPoints, using something like this:
                //World.spawnPoints.splice(Math.floor(Math.random() * World.spawnPoints.length), 1)
                //CLEANUP: capitalizeFirstLetter function might be an idea at this point...
                var color = tanks.tankApp.userOptions.playerColors[i].charAt(0).toUpperCase() + tanks.tankApp.userOptions.playerColors[i].slice(1);
                World.players.push(new tanks.Player({
                    position: World.spawnPoints[i].position,
                    angle: World.spawnPoints[i].angle,
                    sprite: tanks.Resource.get("tank" + color + "Sprite")
                }));
            }
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
            var keyBindings = tanks.tankApp.userOptions.playerKeyBindings;
            switch (evt.keyCode) {
                //Player 1
                case keyBindings[0].forward:
                    World.players[0].controls.forward = value;
                    break;
                case keyBindings[0].backward:
                    World.players[0].controls.backward = value;
                    break;
                case keyBindings[0].left:
                    World.players[0].controls.left = value;
                    break;
                case keyBindings[0].right:
                    World.players[0].controls.right = value;
                    break;
                case keyBindings[0].shoot:
                    World.players[0].controls.shoot = value;
                    break;
                //Player 2
                case keyBindings[1].forward:
                    World.players[1].controls.forward = value;
                    break;
                case keyBindings[1].backward:
                    World.players[1].controls.backward = value;
                    break;
                case keyBindings[1].left:
                    World.players[1].controls.left = value;
                    break;
                case keyBindings[1].right:
                    World.players[1].controls.right = value;
                    break;
                case keyBindings[1].shoot:
                    World.players[1].controls.shoot = value;
                    break;
                //Player 3
                case keyBindings[2].forward:
                    World.players[2].controls.forward = value;
                    break;
                case keyBindings[2].backward:
                    World.players[2].controls.backward = value;
                    break;
                case keyBindings[2].left:
                    World.players[2].controls.left = value;
                    break;
                case keyBindings[2].right:
                    World.players[2].controls.right = value;
                    break;
                case keyBindings[2].shoot:
                    World.players[2].controls.shoot = value;
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
            for (var actorIndex = 0; actorIndex < collisionSuspects.length; actorIndex++) {
                var actor = collisionSuspects[actorIndex];
                if (actor.collision instanceof tanks.Basics.Polygon) {
                    actor.collision.distributePoints();
                }
            }
            var _loop_1 = function (actorIndex) {
                var actor = actors[actorIndex];
                //Remove current actor from collision suspects
                //This way we greatly reduces the amount of checks from n^n to n^log(n)
                splices = collisionSuspects.splice(collisionSuspects.indexOf(actor), 1);
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
                    /* */
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
                            //Half the force if is to be distributed between two objects
                            //Each object will get half of the force. Future implementations could consider mass.
                            if (actor.moveable && collisionSuspect.moveable) {
                                force.y *= 0.5;
                                force.x *= 0.5;
                            }
                            //Add the force to the colliding actor
                            if (actor.moveable) {
                                actor.momentum.addForce(force);
                            }
                            //Add an equal and opposite force to the collisionSuspect
                            if (collisionSuspect.moveable) {
                                collisionSuspect.momentum.addForce(new tanks.Coord(force.x * -1, force.y * -1));
                            }
                        }
                    }
                }
                //Run update and listen for changes
                changes = (actor.update() ? true : changes);
            };
            var splices;
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
                if (this.settings.drawCollisionShapes === true) {
                    if (actor.collision instanceof tanks.Basics.Polygon) {
                        actor.collision.setAngle(actor.angle);
                        actor.collision.buildEdges();
                        ctx.beginPath();
                        ctx.moveTo(actor.collision.edges[0].start.x + actor.position.x, actor.collision.edges[0].start.y + actor.position.y);
                        for (var edgieIndex = 0; edgieIndex < actor.collision.edges.length; edgieIndex++) {
                            var edge = actor.collision.edges[edgieIndex];
                            ctx.moveTo(edge.start.x + actor.position.x, edge.start.y + actor.position.y);
                            ctx.lineTo(edge.end.x + actor.position.x, edge.end.y + actor.position.y);
                        }
                        ctx.moveTo(actor.collision.edges[0].start.x + actor.position.x, actor.collision.edges[0].start.y + actor.position.y);
                        ctx.lineTo(actor.collision.edges[0].end.x + actor.position.x, actor.collision.edges[0].end.y + actor.position.y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    else {
                    }
                }
                //If actor has an abstract drawing method
                if (actor.draw != void 0) {
                    actor.draw(ctx);
                    continue;
                }
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
            World.spawnPoints = [];
            World.players = [];
            World.frame = 0;
            tanks.Actor._actors = [];
            window.removeEventListener("keydown", World.listener, false);
            window.removeEventListener("keyup", World.listener, false);
        };
        return World;
    }());
    World.worldActive = false;
    World.settings = {
        drawCollisionShapes: true
    };
    World.canvas = null;
    World.players = [];
    World.frame = 0;
    //CLEANUP: spawnPoints should probably be defined in a Level class or something once we make one.
    World.spawnPoints = [];
    tanks.World = World;
})(tanks || (tanks = {}));
/// <reference path="game/game.core.ts" />
var tanks;
(function (tanks) {
    tanks.tankApp = angular.module('tankApp', ['ui.router', 'ngCookies']);
    //Route
    tanks.tankApp.config(function ($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
            url: '/',
            templateUrl: 'view/home',
            controller: 'homeCtrl'
        })
            .state('options', {
            url: '/options',
            templateUrl: 'view/options',
            controller: 'optionsCtrl'
        })
            .state('game', {
            url: '/game',
            templateUrl: 'view/gamepage',
            controller: 'gameCtrl'
        });
    });
    ////Front-page
    //Controller
    tanks.tankApp.controller('homeCtrl', ['$scope', function ($scope) {
        }])
        .controller('optionsCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
            $scope.userOptions = tanks.tankApp.userOptions;
            var pCtrl = tanks.tankApp.userOptions.playerKeyBindings[tanks.tankApp.userOptions.playerOptionsIndex];
            $scope.buttonLabelForward = tanks.tankApp.keyCodeName[pCtrl.forward] || '------';
            $scope.buttonLabelBackward = tanks.tankApp.keyCodeName[pCtrl.backward] || '------';
            $scope.buttonLabelLeft = tanks.tankApp.keyCodeName[pCtrl.left] || '------';
            $scope.buttonLabelRight = tanks.tankApp.keyCodeName[pCtrl.right] || '------';
            $scope.buttonLabelShoot = tanks.tankApp.keyCodeName[pCtrl.shoot] || '------';
            $scope.setOption = function (option, value) {
                if (tanks.tankApp.userOptions.hasOwnProperty(option)) {
                    tanks.tankApp.userOptions[option] = value;
                    $cookies.putObject('userOptions', tanks.tankApp.userOptions);
                }
                tanks.Sound.get('sfxMenuSelect').play(true);
            };
            $scope.setColor = function (color) {
                var oldColor = tanks.tankApp.userOptions.playerColors[tanks.tankApp.userOptions.playerOptionsIndex];
                var sameColorPlayer = tanks.tankApp.userOptions.playerColors.indexOf(color);
                if (sameColorPlayer !== -1) {
                    tanks.tankApp.userOptions.playerColors[sameColorPlayer] = oldColor;
                }
                tanks.tankApp.userOptions.playerColors[tanks.tankApp.userOptions.playerOptionsIndex] = color;
                $cookies.putObject('userOptions', tanks.tankApp.userOptions);
                tanks.Sound.get('sfxMenuSelect').play(true);
            };
            $scope.getPlayerSettings = function (playerIndex) {
                if (tanks.tankApp.userOptions.playerKeyBindings.hasOwnProperty(playerIndex)) {
                    tanks.tankApp.userOptions.playerOptionsIndex = playerIndex;
                    $scope.buttonLabelForward = tanks.tankApp.keyCodeName[tanks.tankApp.userOptions.playerKeyBindings[playerIndex].forward] || '------';
                    $scope.buttonLabelBackward = tanks.tankApp.keyCodeName[tanks.tankApp.userOptions.playerKeyBindings[playerIndex].backward] || '------';
                    $scope.buttonLabelLeft = tanks.tankApp.keyCodeName[tanks.tankApp.userOptions.playerKeyBindings[playerIndex].left] || '------';
                    $scope.buttonLabelRight = tanks.tankApp.keyCodeName[tanks.tankApp.userOptions.playerKeyBindings[playerIndex].right] || '------';
                    $scope.buttonLabelShoot = tanks.tankApp.keyCodeName[tanks.tankApp.userOptions.playerKeyBindings[playerIndex].shoot] || '------';
                    $scope.activeKeyBinding = null;
                }
                tanks.Sound.get('sfxMenuSelect').play(true);
            };
            $scope.listenForKey = function (event, key) {
                $scope.activeKeyBinding = key;
                angular.element(event.target).one('keydown', function (e) {
                    $scope.setKey(key, e.which);
                });
            };
            $scope.setKey = function (key, code) {
                if (tanks.tankApp.keyCodeName.hasOwnProperty(code)) {
                    var label = 'buttonLabel' + key.charAt(0).toUpperCase() + key.slice(1);
                    tanks.tankApp.userOptions.playerKeyBindings.forEach(function (playerBindings, playerIndex) {
                        //CLEANUP: This should probably be made into a generalized function
                        for (var bindingName in playerBindings) {
                            if (playerBindings[bindingName] == code) {
                                tanks.tankApp.userOptions.playerKeyBindings[playerIndex][bindingName] = null;
                                if (playerIndex == tanks.tankApp.userOptions.playerOptionsIndex && key != bindingName) {
                                    $scope['buttonLabel' + bindingName.charAt(0).toUpperCase() + bindingName.slice(1)] = '------';
                                }
                            }
                        }
                    });
                    tanks.tankApp.userOptions.playerKeyBindings[tanks.tankApp.userOptions.playerOptionsIndex][key] = code;
                    $scope[label] = tanks.tankApp.keyCodeName[code];
                    $cookies.putObject('userOptions', tanks.tankApp.userOptions);
                    tanks.Sound.get('sfxMenuSelect').play(true);
                }
                else {
                    tanks.Sound.get('sfxMenuBack').play(true);
                }
                $scope.activeKeyBinding = null;
                $scope.$apply();
            };
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
        }]);
    tanks.tankApp.run(function ($rootScope, $cookies) {
        $rootScope.menuLink = function () {
            tanks.Sound.get('sfxMenuSelect').play(true);
        };
        $rootScope.backLink = function () {
            tanks.Sound.get('sfxMenuBack').play(true);
        };
        var defaultOptions = {
            soundEnabled: true,
            playerOptionsIndex: 0,
            playerKeyBindings: [
                {
                    forward: 38,
                    backward: 40,
                    left: 37,
                    right: 39,
                    shoot: 16
                }, {
                    forward: 87,
                    backward: 83,
                    left: 65,
                    right: 68,
                    shoot: 32
                }, {
                    forward: 73,
                    backward: 75,
                    left: 74,
                    right: 76,
                    shoot: 13
                }
            ],
            playerCount: 2,
            playerHealth: 100,
            playerColors: [
                'red',
                'blue',
                'green'
            ]
        };
        tanks.tankApp.userOptions = $cookies.getObject('userOptions');
        //TODO: Fill an existing userOptions object from a old cookie with default values from defaultOptions
        //	in case they are undefined
        if (tanks.tankApp.userOptions === undefined) {
            tanks.tankApp.userOptions = defaultOptions;
        }
        var d = new Date();
        d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
        $cookies.putObject('userOptions', tanks.tankApp.userOptions, { 'expires': d.toUTCString() });
        tanks.tankApp.keyCodeName = {
            9: "Tab",
            13: "Enter",
            16: "Shift",
            17: "Ctrl",
            18: "Alt",
            27: "Esc",
            32: "Space",
            33: "PgUp",
            34: "PgDwn",
            35: "End",
            36: "Home",
            37: "Left",
            38: "Up",
            39: "Right",
            40: "Down",
            45: "Insert",
            46: "Delete",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            60: "<",
            65: "A",
            66: "B",
            67: "C",
            68: "D",
            69: "E",
            70: "F",
            71: "G",
            72: "H",
            73: "I",
            74: "J",
            75: "K",
            76: "L",
            77: "M",
            78: "N",
            79: "O",
            80: "P",
            81: "Q",
            82: "R",
            83: "S",
            84: "T",
            85: "U",
            86: "V",
            87: "W",
            88: "X",
            89: "Y",
            90: "Z",
            96: "Num0",
            97: "Num1",
            98: "Num2",
            99: "Num3",
            100: "Num4",
            101: "Num5",
            102: "Num6",
            103: "Num7",
            104: "Num8",
            105: "Num9",
            106: "Num*",
            107: "Num+",
            109: "Num-",
            110: "Num.",
            111: "Num/",
            160: "¨",
            171: "+",
            173: "-",
            188: ",",
            190: ".",
            192: "´",
            222: "'"
        };
        new tanks.Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
        new tanks.Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
        new tanks.Sound({ id: "sfxMenuSelect", resource: tanks.Resource.get("sfxMenuSelect") });
        new tanks.Sound({ id: "sfxMenuBack", resource: tanks.Resource.get("sfxMenuBack") });
    });
    tanks.tankApp.directive('exclusiveSelect', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    element.parent().children().removeClass('active');
                    element.addClass('active');
                });
            }
        };
    });
})(tanks || (tanks = {}));
/// <reference path="../game.utility.ts" />
/// <reference path="../game.core.ts" />
//This file contains the base game object class for the game engine.
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
            this.moveable = true;
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
            _this.sprite = tanks.Resource.get("bulletSprite");
            _this.anim = { name: "idle", count: 0 };
            _this.zIndex = tanks.EZindex.projectile;
            //Sound effects associated with the projectile, can be set to 'null' to make no sound.
            //Perhaps the check for null should be moved to the Sound class as a more general solution
            //instead of just checking wherever when we're just about to use it.
            _this.sfx = { spawn: tanks.Sound.get("sfxBulletSpawn"), hit: tanks.Sound.get("sfxBulletHit"), bounce: tanks.Sound.get("sfxBulletBounce") };
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
                if (self.hit && self.sfx.hit != null) {
                    self.sfx.hit.play();
                }
                else if (self.sfx.bounce != null) {
                    self.sfx.bounce.play();
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
    var FlameThrowerProjectile = (function (_super) {
        __extends(FlameThrowerProjectile, _super);
        function FlameThrowerProjectile() {
            var _this = _super.apply(this, arguments) || this;
            _this.damage = 10;
            _this.sprite = tanks.Resource.get("bulletBurningSprite");
            _this.sfx = { spawn: tanks.Sound.get("sfxFlamethrowerSpawn"), hit: tanks.Sound.get("sfxBulletHit"), bounce: null };
            return _this;
        }
        return FlameThrowerProjectile;
    }(Projectile));
    tanks.FlameThrowerProjectile = FlameThrowerProjectile;
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
                var projectile = new self.projectileType({
                    lifespan: self.lifespan,
                    owner: self,
                    position: new tanks.Coord(self.owner.position.x + cos * self.position.x, self.owner.position.y + sin * self.position.y),
                    angle: new tanks.Angle(degrees),
                    momentum: new tanks.Vector(new tanks.Coord(cos * self.speed, sin * self.speed), self.speed, 1)
                });
                self.owner.projectiles.push(projectile);
                self.projectiles.push(projectile);
                if (projectile.sfx.spawn != null) {
                    projectile.sfx.spawn.play();
                }
            }
            return this;
        };
        return Weapon;
    }(tanks.Actor));
    tanks.Weapon = Weapon;
    var WeaponTankFlameThrower = (function (_super) {
        __extends(WeaponTankFlameThrower, _super);
        function WeaponTankFlameThrower() {
            var _this = _super.apply(this, arguments) || this;
            _this.lifespan = 20;
            _this.fireRateMax = 20;
            _this.speed = 1.3;
            _this.fireArc = new tanks.Angle(45);
            _this.projectileType = tanks.FlameThrowerProjectile;
            return _this;
        }
        return WeaponTankFlameThrower;
    }(Weapon));
    tanks.WeaponTankFlameThrower = WeaponTankFlameThrower;
    var WeaponTankMainGun = (function (_super) {
        __extends(WeaponTankMainGun, _super);
        function WeaponTankMainGun() {
            var _this = _super.apply(this, arguments) || this;
            _this.lifespan = 100;
            _this.fireRateMax = 200;
            _this.speed = 4;
            _this.fireArc = new tanks.Angle(10);
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
            _this.sprite = tanks.Resource.get("tankRedSprite");
            _this.anim = { name: "idle", count: 0 };
            _this.momentum = new tanks.Vector(new tanks.Coord(), 2, 0.92);
            _this.acceleration = 0.05;
            _this.size = 32;
            _this.turnrate = 1;
            _this.hitPoints = tanks.tankApp.userOptions.playerHealth;
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
            _this.collision = new tanks.Basics.Rect(_this.position, _this.size * 0.9, _this.size * 0.7, _this.angle);
            //These are "Proof of concept" for gun placement and gun modification.
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
            _this.collision.distributePoints();
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
                self.angle.add(self.turnrate * turn);
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
