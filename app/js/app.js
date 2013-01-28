'use strict';

// Declare app level module which depends on filters, and services
var module = angular.module('myApp', ['myApp.services']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/bestof', {templateUrl: 'partials/bestofinstagram.html', controller: BestOfInstagramCtrl});
        $routeProvider.when('/local', {templateUrl: 'partials/localinstagram.html', controller: LocalInstagramCtrl});
        $routeProvider.otherwise({redirectTo: '/bestof'});
    }]);

module.controller('MainCtrl', ['$scope', function($scope){
    $scope.year = 2013;
}]);