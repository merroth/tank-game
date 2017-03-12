/// <reference path="game/game.core.ts" />

module tanks {

	//Interfaces
	interface ITankAppOptions {
		soundVolume: number,
		playerOptionsIndex: number,
		playerKeyBindings: {
			forward: number,
			backward: number,
			left: number,
			right: number,
			shoot: number
		}[],
		playerCount: number,
		playerHealth: number,
		playerColors: string[]
	}

	interface ITank extends ng.IModule {
		userOptions?: ITankAppOptions,
		defaultOptions?: ITankAppOptions,
		keyCodeName?: any
	}

	export var tankApp: ITank;

	tankApp = angular.module('tankApp', ['ui.router', 'ngCookies']);

	//Route
	tankApp.config(function ($urlRouterProvider, $stateProvider) {
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
			})
			.state('editor', {
				url: '/editor',
				templateUrl: 'view/worldbuilder',
				controller: 'worldbuilderCtrl'
			});
	});

	////Front-page
	//Controller
	tankApp.controller('homeCtrl', ['$scope', function ($scope) {

	}])

		////Options-page
		//Controller
		.controller('optionsCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
			$scope.userOptions = tankApp.userOptions;
			var pCtrl = tankApp.userOptions.playerKeyBindings[tankApp.userOptions.playerOptionsIndex];
			$scope.buttonLabelForward = tankApp.keyCodeName[pCtrl.forward] || '------';
			$scope.buttonLabelBackward = tankApp.keyCodeName[pCtrl.backward] || '------';
			$scope.buttonLabelLeft = tankApp.keyCodeName[pCtrl.left] || '------';
			$scope.buttonLabelRight = tankApp.keyCodeName[pCtrl.right] || '------';
			$scope.buttonLabelShoot = tankApp.keyCodeName[pCtrl.shoot] || '------';

			$scope.setOption = function (option, value) {
				tankApp.userOptions[option] = value;

				$cookies.putObject('userOptions', tankApp.userOptions);

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.setColor = function (color) {
				let oldColor = tankApp.userOptions.playerColors[tankApp.userOptions.playerOptionsIndex];
				let sameColorPlayer = tankApp.userOptions.playerColors.indexOf(color);

				if (sameColorPlayer !== -1) {
					tankApp.userOptions.playerColors[sameColorPlayer] = oldColor;
				}

				tankApp.userOptions.playerColors[tankApp.userOptions.playerOptionsIndex] = color;

				$cookies.putObject('userOptions', tankApp.userOptions);

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.resetControls = function () {
				let defaultKeyBindings = angular.copy(tankApp.defaultOptions.playerKeyBindings);

				tankApp.userOptions.playerKeyBindings = defaultKeyBindings;

				$cookies.putObject('userOptions', tankApp.userOptions);

				$scope.getPlayerSettings(tankApp.userOptions.playerOptionsIndex);
			}

			$scope.getPlayerSettings = function (playerIndex) {
				if (tankApp.userOptions.playerKeyBindings.hasOwnProperty(playerIndex)) {
					tankApp.userOptions.playerOptionsIndex = playerIndex;

					$scope.buttonLabelForward = tankApp.keyCodeName[tankApp.userOptions.playerKeyBindings[playerIndex].forward] || '------';
					$scope.buttonLabelBackward = tankApp.keyCodeName[tankApp.userOptions.playerKeyBindings[playerIndex].backward] || '------';
					$scope.buttonLabelLeft = tankApp.keyCodeName[tankApp.userOptions.playerKeyBindings[playerIndex].left] || '------';
					$scope.buttonLabelRight = tankApp.keyCodeName[tankApp.userOptions.playerKeyBindings[playerIndex].right] || '------';
					$scope.buttonLabelShoot = tankApp.keyCodeName[tankApp.userOptions.playerKeyBindings[playerIndex].shoot] || '------';

					$scope.activeKeyBinding = null;
				}

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.listenForKey = function (event, key) {
				$scope.activeKeyBinding = key;

				angular.element(event.target).one('keydown', function (e) {
					$scope.setKey(key, e.which)
				});
			}

			$scope.setKey = function (key, code) {
				if (tankApp.keyCodeName.hasOwnProperty(code)) {
					let label = 'buttonLabel' + key.charAt(0).toUpperCase() + key.slice(1);

					tankApp.userOptions.playerKeyBindings.forEach(function (playerBindings, playerIndex) {
						//CLEANUP: This should probably be made into a generalized function
						for (let bindingName in playerBindings) {
							if (playerBindings[bindingName] == code) {
								tankApp.userOptions.playerKeyBindings[playerIndex][bindingName] = null;

								if (playerIndex == tankApp.userOptions.playerOptionsIndex && key != bindingName) {
									$scope['buttonLabel' + bindingName.charAt(0).toUpperCase() + bindingName.slice(1)] = '------';
								}
							}
						}
					});

					tankApp.userOptions.playerKeyBindings[tankApp.userOptions.playerOptionsIndex][key] = code;

					$scope[label] = tankApp.keyCodeName[code];

					$cookies.putObject('userOptions', tankApp.userOptions);

					Sound.get('sfxMenuSelect').play(true);
				} else {
					Sound.get('sfxMenuBack').play(true);
				}

				$scope.activeKeyBinding = null;

				$scope.$apply();
			}
		}])

		////Game-page
		//Controller
		.controller('gameCtrl', ['$scope', function ($scope) {

			//Generate world paramenters
			var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gameCanvas");

			//Create world
			var world = World.create(canvas);

			//Listen for "destroy"
			$scope.$on("$destroy", function (event) {
				//Kill world
				World.kill();
			});
		}])

		////Level-editor-page
		//Controller
		.controller('worldbuilderCtrl', ['$scope', function ($scope) {

			//Generate world paramenters
			var ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>document.getElementById("gameCanvas").getContext("2d");

			$scope.canvas = ctx.canvas;

			var tiles: Tile[] = [TileGrass, TileIce, TileSand, TileWall];
			$scope.tiles = tiles;

			var size: number = Math.abs(parseInt(prompt("Size of map (in tiles)", "64")));
			//var size: number = 64;
			$scope.size = size;

			/*var defaultTile = tiles[Math.abs(parseInt(prompt(
				"Pick a default tiletype:\n\n" +
				tiles.map(function (a, index) {
					return a.name + ": " + index
				}).join("\n"),
				"0"
			)))];*/
			var defaultTile = tiles[2];
			$scope.defaultTile = defaultTile;

			//console.log(defaultTile);

			var currentTile = defaultTile;

			var hash: Hashmap = new Hashmap(size, defaultTile.id);
			hash.set(new Coord(1, 1), tiles[2].id);
			function draw() {
				var defaultPattern = (function () {
					if (defaultTile.ressource.descriptor == null) {
						return "black"
					}
					var anim = defaultTile.ressource.descriptor.anim.find(function (a) {
						return a.name == defaultTile.animation
					})

					var localCanvas = document.createElement("canvas").getContext("2d");
					localCanvas.canvas.width = 16;
					localCanvas.canvas.height = localCanvas.canvas.width;
					localCanvas.drawImage(
						defaultTile.ressource.resource,
						0,
						0 - (anim.top * Tile.tileSize)
					)
					return ctx.createPattern(localCanvas.canvas, "repeat")
				})();

				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.fillStyle = defaultPattern;
				ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

				for (let x = 0; x < ctx.canvas.width / Tile.tileSize; x++) {
					for (let y = 0; y < ctx.canvas.height / Tile.tileSize; y++) {
						let tileID = hash.get(new Coord(x, y));
						if (tileID != defaultTile.id) {
							let tile = tiles.find(function (a) {
								return a.id == tileID;
							});
							if (tile == void 0) {
								continue;
							}

							let anim: IDescriptorAnimation = Tile.ressource.descriptor.anim.find(function (a) {
								return a.name == tile.animation;
							});

							ctx.drawImage(
								defaultTile.ressource.resource,
								0,
								anim.top * Tile.tileSize,
								Tile.tileSize,
								Tile.tileSize,
								x * Tile.tileSize,
								y * Tile.tileSize,
								Tile.tileSize,
								Tile.tileSize,
							)
						}

					}

				}

				ctx.strokeStyle = "rgba(0,0,0,0.1)";
				ctx.lineWidth = 1;

				for (let x = 0; x < ctx.canvas.width; x += Tile.tileSize) {
					ctx.beginPath();
					ctx.moveTo(x, 0);
					ctx.lineTo(x, ctx.canvas.height);
					ctx.closePath();
					ctx.stroke();
				}
				for (let y = 0; y < ctx.canvas.height; y += Tile.tileSize) {
					ctx.beginPath();
					ctx.moveTo(0, y);
					ctx.lineTo(ctx.canvas.width, y);
					ctx.closePath();
					ctx.stroke();
				}
			}
			(function () {
				function initialDraw() {
					if (defaultTile.ressource.descriptor == null) {
						requestAnimationFrame(initialDraw)
					} else {
						draw();
					}
				}
				initialDraw();
			})()

			ctx.canvas.onmousemove = function (e: MouseEvent) {
				//return false;
				//console.log(123, e);
				var scaleOffest = (1 / ctx.canvas.width) * ctx.canvas.clientWidth;
				var x = Math.floor(((e.clientX - e.target.offsetLeft) / scaleOffest) / Tile.tileSize);
				var y = Math.floor(((e.clientY - e.target.offsetTop) / scaleOffest) / Tile.tileSize);
				var value = document.getElementById("tiles").value;
				if (e.ctrlKey) {
					hash.set(new Coord(x, y), value);
					draw();
				} else if (e.shiftKey) {
					hash.remove(new Coord(x, y));
					draw();
				}
			}

		}]);

	tankApp.run(function ($rootScope, $cookies) {
		$rootScope.menuLink = function () {
			Sound.get('sfxMenuSelect').play(true);
		}

		$rootScope.backLink = function () {
			Sound.get('sfxMenuBack').play(true);
		}

		tankApp.defaultOptions = {
			soundVolume: 0.50,
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

		tankApp.userOptions = $cookies.getObject('userOptions');

		//TODO: Fill an existing userOptions object from a old cookie with default values from defaultOptions
		//	in case they are undefined
		if (tankApp.userOptions === undefined) {
			tankApp.userOptions = angular.copy(tankApp.defaultOptions);
		}

		let d = new Date();
		d.setTime(d.getTime() + (24 * 60 * 60 * 1000));

		$cookies.putObject('userOptions', tankApp.userOptions, { 'expires': d.toUTCString() });

		tankApp.keyCodeName = {
			9: "Tab",
			12: "Clear",
			13: "Enter",
			16: "Shift",
			17: "Ctrl",
			18: "Alt",
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
			60: "\x3C",
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
			189: "½",
			190: ".",
			192: "´",
			222: "'"
		};

		new Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
		new Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
		new Sound({ id: "sfxMenuSelect", resource: Resource.get("sfxMenuSelect") });
		new Sound({ id: "sfxMenuBack", resource: Resource.get("sfxMenuBack") });
	});

	tankApp.directive('exclusiveSelect', function () {
		return {
			link: function (scope, element, attrs) {
				element.bind('click', function () {
					element.parent().children().removeClass('active');
					element.addClass('active');
				});
			},
		}
	});
}
