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

		}])
		//Route
		.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
			$urlRouterProvider.otherwise('/');
			$stateProvider
				.state('options', {
					url: '/options',
					templateUrl: 'view/options',
					controller: 'optionsCtrl'
				})
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
			console.log('clicked a normal link');
			Sound.get('sfxMenuSelect').play(true);
		}

		$rootScope.backLink = function() {
			console.log('clicked a back link');
			Sound.get('sfxMenuBack').play(true);
		}
	});

	new Resource({ fileLocation: "resources/sfx/menu_select.m4a", id: "sfxMenuSelect" });
	new Resource({ fileLocation: "resources/sfx/menu_back.m4a", id: "sfxMenuBack" });
	new Sound({ id: "sfxMenuSelect", resource: Resource.get("sfxMenuSelect") });
	new Sound({ id: "sfxMenuBack", resource: Resource.get("sfxMenuBack") });
}
