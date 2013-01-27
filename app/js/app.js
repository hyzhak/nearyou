'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.services']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/bestof', {templateUrl: 'partials/bestof.html', controller: BestOfInstagramCtrl});
        $routeProvider.when('/local', {templateUrl: 'partials/bestof.html', controller: LocalInstagramCtrl});
        $routeProvider.otherwise({redirectTo: '/bestof'});
    }]);
