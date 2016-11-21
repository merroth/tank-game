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
