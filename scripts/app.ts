/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/angularjs/angular.d.ts" />
/// <reference path="definitions/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="game/game.core.ts" />

module tanks {
	export var tankApp;
	tankApp = angular
		.module('tankApp', [
			'ui.router',
		])

		////Front-page
		//Controller
		.controller('homeCtrl', ['$scope', function ($scope) {

		}])
		//Route
		.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
			$urlRouterProvider.otherwise('/');
			$stateProvider
				.state('home', {
					url: '/',
					templateUrl: 'view/frontpage',
					controller: 'homeCtrl'
				})
		}])

		////Options-page
		//Controller
		.controller('optionsCtrl', ['$scope', function ($scope) {
			$scope.Options = tankApp.Options;
			$scope.buttonLabelForward = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex].forward];
			$scope.buttonLabelBackward = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex].backward];
			$scope.buttonLabelLeft = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex].left];
			$scope.buttonLabelRight = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex].right];
			$scope.buttonLabelShoot = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex].shoot];

			$scope.setOption = function($option, $value) {
				if (tankApp.Options.hasOwnProperty($option)) {
					tankApp.Options[$option] = $value;
				}

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.setColor = function($color) {
				var oldColor = tankApp.Options.playerColors[tankApp.Options.playerOptionsIndex];
				var sameColorPlayer = tankApp.Options.playerColors.indexOf($color);

				if (sameColorPlayer !== -1) {
					tankApp.Options.playerColors[sameColorPlayer] = oldColor;
				}

				tankApp.Options.playerColors[tankApp.Options.playerOptionsIndex] = $color;

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.getPlayerSettings = function($playerIndex) {
				if (tankApp.Options.playerKeyBindings.hasOwnProperty($playerIndex)) {
					tankApp.Options.playerOptionsIndex = $playerIndex;

					$scope.buttonLabelForward = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[$playerIndex].forward];
					$scope.buttonLabelBackward = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[$playerIndex].backward];
					$scope.buttonLabelLeft = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[$playerIndex].left];
					$scope.buttonLabelRight = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[$playerIndex].right];
					$scope.buttonLabelShoot = tankApp.keyCodeName[tankApp.Options.playerKeyBindings[$playerIndex].shoot];
				}

				Sound.get('sfxMenuSelect').play(true);
			}

			$scope.listenForKey = function($event, $key) {
				$scope.activeKeyBinding = $key;

				angular.element($event.target).one('keydown', function(e) {
					$scope.setKey($key, e.which)
				});
			}

			$scope.setKey = function($key, $code) {
				if (tankApp.keyCodeName.hasOwnProperty($code)) {
					var label = 'buttonLabel' + $key.charAt(0).toUpperCase() + $key.slice(1);

					tankApp.Options.playerKeyBindings[tankApp.Options.playerOptionsIndex][$key] = $code;

					$scope[label] = tankApp.keyCodeName[$code];

					Sound.get('sfxMenuSelect').play(true);
				} else {
					Sound.get('sfxMenuBack').play(true);
				}

				$scope.activeKeyBinding = null;

				$scope.$apply();
			}
		}])
		//Route
		.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
			$urlRouterProvider.otherwise('/');
			$stateProvider
				.state('options', {
					url: '/options',
					templateUrl: 'view/options',
					controller: 'optionsCtrl'
				});
		}])

		////Game-page
		//Controller
		.controller('gameCtrl', ['$scope', function ($scope) {

			//Generate world paramenters
			var canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("gameCanvas");

			//Create world
			var world = World.create(canvas);

			//Listen for "destroy"
			$scope.$on("$destroy", function (event) {
				//Kill world
				World.kill();
			});
		}])
		//Route
		.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
			$urlRouterProvider.otherwise('/');
			$stateProvider
				.state('game', {
					url: '/game',
					templateUrl: 'view/gamepage',
					controller: 'gameCtrl'
				})
		}]);

	tankApp.run(function($rootScope) {
		$rootScope.menuLink = function() {
			Sound.get('sfxMenuSelect').play(true);
		}

		$rootScope.backLink = function() {
			Sound.get('sfxMenuBack').play(true);
		}
	});

	tankApp.directive('exclusiveSelect', function() {
	    return {
	        link: function(scope, element, attrs) {
	            element.bind('click', function() {
	                element.parent().children().removeClass('active');
	                element.addClass('active');
	            });
	        },
	    }
	});

	tankApp.Options = {
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
}
