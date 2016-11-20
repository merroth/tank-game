/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="definitions/angularjs/angular.d.ts" />
/// <reference path="definitions/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="game.ts" />

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
		////Game-page
		//Controller
		.controller('gameCtrl', ['$scope', function ($scope) {
			
			//Generate world paramenters
			var canvas = document.getElementById("gameCanvas");

			//Create world
			var world = World.create(canvas, 1);

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
}