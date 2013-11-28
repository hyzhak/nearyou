requirejs.config({
    baseUrl: '',
    paths: {
        'app': 'js',

        //libs
        'text': 'lib/requirejs-text/text',
        'css': 'lib/require-css/css',
        'angular': 'lib/angular/angular',
        'angular-animate': 'lib/angular-animate/angular-animate',
        'angular-resource': 'lib/angular-resource/angular-resource',
        'angular-ui-router': 'lib/angular-ui-router/release/angular-ui-router',
        'leaflet': 'lib/leaflet-dist/leaflet',
        'leaflet-directive': 'lib/angular-leaflet/src/angular-leaflet-directive'
    },
    shim: {
        'angular': {
            deps: ['text'],
            exports: 'angular'
        },
        'angular-hammer': {
            deps: ['angular', 'lib/hammer.min'],
            exports: 'angular-hammer'
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'leaflet': {
            exports: 'L'
        },
        'leaflet-directive': {
            deps: ['angular', 'leaflet']
        }
    }
});

requirejs(['angular', 'app/app'], function (angular) {
    'use strict';

    angular.bootstrap(document, ['myApp']);
});