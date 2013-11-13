define([
    'angular',
    'angular-resource',
    'angular-route',
    'angular-ui-router',
    'app/controllers',
    'app/directives',
    'app/factories',
    'app/services',
    'text!partials/bestofinstagram.html'
], function(angular, resource, route, router, controllers, directives, factories, services, partialsBestOfInstagram) {

    // Declare app level module which depends on filters, and services
    var app = angular.module('myApp', ['ngRoute', 'ngResource']).
        config(['$routeProvider', function($routeProvider) {
            'use strict';
            //$routeProvider.when('/bestof', {templateUrl: 'partials/bestofinstagram.html', controller: 'BestOfInstagramCtrl'});
            $routeProvider.when('/local/:lat/:lng', {template: partialsBestOfInstagram, controller: 'LocalImagesCtrl'});
            $routeProvider.when('/local', {template: partialsBestOfInstagram, controller: 'RequestUserLocationCtrl'});
            $routeProvider.otherwise({redirectTo: '/local'});
        }]);

    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    app.constant('instagramClintId', '39a6f9437c464ef684d543880969764d');

    app.controller(controllers);
    app.directive(directives);
    app.factory(factories);
    app.service(services);

    app.service('SearchState', function(){
        'use strict';
        var state = "";
        return {
            getState : function(){
                return state;
            },
            setState: function(value){
                console.log('set State of SearchState');
                state = value;
            }
        }
    });
});
