define([
    'text!partials/images-list.html',
    'text!app/places/places.html',

    'angular',
    'angular-ui-router',
    'app/about/aboutDlg',
    'app/near/localImagesController',
    'app/places/placesController'
], function(imagesListTemplate, placesTemplate, angular) {
    'use strict';

    angular.module('NY.routes', [
            'ui.router',

            'NY.AboutDlg',
            'NY.LocalImagesCtrl',
            'NY.PlacesCtrl'
        ])
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
                        url: '/places/?lat&lng&distance&zoom',
                        controller: 'PlacesCtrl',
                        template: placesTemplate
                    });
        }]);
});