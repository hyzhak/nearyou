define([
    'angular',
    'angular-resource',
    'angular-ui-router',
    'app/controllers',
    'app/directives',
    'app/factories',
    'app/services',
    'text!partials/images-list.html',
    'text!partials/places.html',
], function(angular,
            resource,
            router,
            controllers,
            directives,
            factories,
            services,
            imagesListTemplate,
            placesTempate) {
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
                template: imagesListTemplate
            })
            .state('at-with-location', {
                url: '/at/?lat&lng&distance',
                controller: 'LocalImagesCtrl',
                template: imagesListTemplate
            }).
            state('at-with-venue', {
                url: '/at/{place}/?lat&lng&distance',
                controller: 'LocalImagesCtrl',
                template: imagesListTemplate
            }).
            state('places', {
                url: '/places/?lat&lng&distance',
                template: placesTempate
            });
    }]);

    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    app.constant('instagramClintId', '39a6f9437c464ef684d543880969764d');
    app.constant('GOOGLE_ANALYTICS_ID', 'UA-38043860-1');

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
