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
    'use strict';

    // Declare app level module which depends on filters, and services
    var app = angular.module('myApp', [
        'ngResource',
        'ui.router'
    ]);

    app.config([
        '$locationProvider',
        '$stateProvider',
        '$urlRouterProvider',
    function($locationProvider, $stateProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(false).hashPrefix('!');

        $urlRouterProvider.otherwise('at');

        $stateProvider
            .state('at', {
                url: '/at',
                controller: 'RequestUserLocationCtrl',
                template: partialsBestOfInstagram
            })
            .state('at-with-location', {
                url: '/at/:lat/:lng',
                controller: 'LocalImagesCtrl',
                template: partialsBestOfInstagram
            });
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
