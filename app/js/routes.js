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

                $urlRouterProvider.otherwise('local');

                $stateProvider
                    .state('at', {
                        url: '/local',
                        controller: 'RequestUserLocationCtrl',
                        template: imagesListTemplate
                    })
                    .state('at-with-location', {
                        url: '/at?lat&lng&distance&zoom',
                        controller: 'LocalImagesCtrl',
                        template: imagesListTemplate
                    }).
                    state('at-with-venue', {
                        url: '/at/{place}?lat&lng&distance',
                        controller: 'LocalImagesCtrl',
                        template: imagesListTemplate
                    }).
                    state('places', {
                        url: '/places?lat&lng&distance&zoom',
                        controller: 'PlacesCtrl',
                        template: placesTemplate
                    })
                    .state('places.instagram', {
                        parent: 'places',
                        url: '/in/{imageId}',
                        onEnter: ['ImageDlgService', '$state', '$stateParams', function(ImageDlgService, $state, $stateParams) {
                            ImageDlgService.open($stateParams.imageId)
                                .finally(function() {
                                    $state.go('^', null, {
                                        notify: false
                                    });
                                });
                        }]
                    });
        }])
        .run(['$rootScope', function($rootScope){
                $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams){
                        if (fromState === toState === 'places') {
                            event.preventDefault();
                        }
                    })
        }]);
});