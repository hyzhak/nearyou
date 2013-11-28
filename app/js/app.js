define([
    'angular',
    'angular-resource',
    'angular-animate',
    'angular-ui-router',
    'leaflet-directive',
    'app/controllers',
    'app/directives',
    'app/factories',
    'app/services',
    'text!partials/images-list.html',
    'text!partials/places.html',
], function(angular,
            resource,
            animate,
            router,
            leafletDirective,
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
        'ngAnimate',
        'leaflet-directive',
        'ui.router',
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
                controller: 'PlacesCtrl',
                template: placesTempate
            });
    }]);

    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    app.constant('INSTAGRAM_CLIENT_ID', '39a6f9437c464ef684d543880969764d');
    app.constant('GOOGLE_ANALYTICS_ID', 'UA-38043860-1');
    app.constant('FOUR_SQUARE_CLIENT', {
        currentAPIDate: dateToYMD(new Date()),
        CLIENT_ID: 'XCYPKEY52MVDGHLNRZH2D3BFTIIPG3QCJRC5XFZ1CN5UELGH',
        CLIENT_SECRET: 'UJDAHTDQNW1JHPXWVXD2KZQJHIQTF2XBDSH25ZJTLFUHAY3E'
    });

    app.controller(controllers);
    app.directive(directives);
    app.factory(factories);
    app.service(services);

    app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

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

    function dateToYMD(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }
});
