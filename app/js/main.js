requirejs.config({
    baseUrl: '',
    paths: {
        'app': 'js',

        //libs
        'text': 'lib/requirejs-text/text',
        'css': 'lib/require-css/css',
        'angular': 'lib/angular/angular',
        'angular-animate': 'lib/angular-animate/angular-animate',
        'angular-bootstrap': 'lib/angular-bootstrap/ui-bootstrap-tpls',
        'angular-resource': 'lib/angular-resource/angular-resource',
        'angular-sanitize': 'lib/angular-sanitize/angular-sanitize',
        'angular-ui-router': 'lib/angular-ui-router/release/angular-ui-router',
        'angular-ui-select': 'lib/angular-ui-select/dist/select',
        'leaflet': 'lib/leaflet/dist/leaflet-src',
        'leaflet-directive': 'lib/angular-leaflet/dist/angular-leaflet-directive',
        'leaflet-markerclusterer': 'lib/leaflet.markerclusterer/dist/leaflet.markercluster-src',
        'lodash': 'lib/lodash/dist/lodash'
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
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-sanitize': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-ui-select': {
            deps: ['angular']
        },
        'leaflet': {
            exports: 'L'
        },
        'leaflet-directive': {
            deps: ['angular', 'leaflet']
        },
        'leaflet-markerclusterer': {
            deps: ['leaflet']
        }
    }
});

requirejs(['angular', 'app/app'], function (angular) {
    'use strict';

    angular.bootstrap(document, ['myApp']);
});