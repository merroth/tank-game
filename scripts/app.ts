/// <reference path="game/game.core.ts" />

module tanks {

	//Interfaces
	interface ITankAppOptions {
		soundEnabled: boolean,
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
				});
		});

		////Front-page
		//Controller
	tankApp.controller('homeCtrl', ['$scope', function ($scope) {

		}])

		////Options-page
		//Controller
		.controller('optionsCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
			$scope.Options = tankApp.userOptions;
			var p1Ctrl = tankApp.userOptions.playerKeyBindings[tankApp.userOptions.playerOptionsIndex];
			$scope.buttonLabelForward = tankApp.keyCodeName[p1Ctrl.forward] || '------';
			$scope.buttonLabelBackward = tankApp.keyCodeName[p1Ctrl.backward] || '------';
			$scope.buttonLabelLeft = tankApp.keyCodeName[p1Ctrl.left] || '------';
			$scope.buttonLabelRight = tankApp.keyCodeName[p1Ctrl.right] || '------';
			$scope.buttonLabelShoot = tankApp.keyCodeName[p1Ctrl.shoot] || '------';

			$scope.setOption = function(option, value) {
				if (tankApp.userOptions.hasOwnProperty(option)) {

					tankApp.userOptions[option] = value;

					$cookies.putObject('userOptions', tankApp.userOptions);
				}

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.setColor = function(color) {
				var oldColor = tankApp.userOptions.playerColors[tankApp.userOptions.playerOptionsIndex];
				var sameColorPlayer = tankApp.userOptions.playerColors.indexOf(color);

				if (sameColorPlayer !== -1) {
					tankApp.userOptions.playerColors[sameColorPlayer] = oldColor;
				}

				tankApp.userOptions.playerColors[tankApp.userOptions.playerOptionsIndex] = color;

				$cookies.putObject('userOptions', tankApp.userOptions);

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.getPlayerSettings = function(playerIndex) {
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

			$scope.listenForKey = function(event, key) {
				$scope.activeKeyBinding = key;

				angular.element(event.target).one('keydown', function(e) {
					$scope.setKey(key, e.which)
				});

				$scope.$apply();
			}

			$scope.setKey = function(key, code) {
				if (tankApp.keyCodeName.hasOwnProperty(code)) {
					var label = 'buttonLabel' + key.charAt(0).toUpperCase() + key.slice(1);

					tankApp.userOptions.playerKeyBindings.forEach(function(playerBindings, playerIndex) {
						//CLEANUP: This should probably be made into a generalized function
						for (let bindingName in playerBindings) {
							if (playerBindings[bindingName] == code) {
								tankApp.userOptions.playerKeyBindings[playerIndex][bindingName] = null;

								if(playerIndex == tankApp.userOptions.playerOptionsIndex && key != bindingName) {
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
		}]);

	tankApp.run(function($rootScope, $cookies) {
		$rootScope.menuLink = function() {
			Sound.get('sfxMenuSelect').play(true);
		}

		$rootScope.backLink = function () {
			Sound.get('sfxMenuBack').play(true);
		}

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

		tankApp.userOptions = $cookies.getObject('userOptions');

		//TODO: Fill an existing userOptions object from a old cookie with default values from defaultOptions
		//	in case they are undefined
		if (tankApp.userOptions === undefined) {
			tankApp.userOptions = defaultOptions;
		}

		var d = new Date();
		d.setTime(d.getTime()+(24*60*60*1000));

		$cookies.putObject('userOptions', tankApp.userOptions, {'expires': d.toUTCString()});

		tankApp.keyCodeName = {
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
