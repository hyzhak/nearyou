define([
    'text!partials/images-list.html',
    'text!partials/places.html',

    'angular',
    'angular-ui-router'
], function(imagesListTemplate, placesTemplate, angular) {
    'use strict';

    angular.module('NY.routes', ['ui.router'])
        .config([
            '$locationProvider',
            '$stateProvider',
            '$urlRouterProvider',
            function($locationProvider,
                     $stateProvider,
                     $urlRouterProvider) {
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
                        controller: 'PlacesCtrl',
                        template: placesTemplate
                    });
        }]);
});