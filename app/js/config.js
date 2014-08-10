requirejs({
    paths: {
        'app': 'js',

        //libs
        'text': 'lib/requirejs-text/text',
        'css': 'lib/require-css/css',
        'css-builder': 'lib/require-css/css-builder',
        'normalize': 'lib/require-css/normalize',
        'angular': 'lib/angular/angular',
        'angular-animate': 'lib/angular-animate/angular-animate',
        'angular-bootstrap': 'lib/angular-bootstrap/ui-bootstrap-tpls',
        'angular-resource': 'lib/angular-resource/angular-resource',
        'angular-ui-router': 'lib/angular-ui-router/release/angular-ui-router',
        'leaflet': 'lib/leaflet/dist/leaflet-src',
        'leaflet-directive': 'lib/angular-leaflet/dist/angular-leaflet-directive.min',
        'leaflet-markerclusterer': 'lib/leaflet.markerclusterer/dist/leaflet.markercluster-src',
        'lodash': 'lib/lodash/dist/lodash'
    },
    shim: {
        'angular': {
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
        'angular-ui-router': {
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
    },
    name: 'lib/almond/almond',
    include: ['js/main'],
    generateSourceMaps: true,
    preserveLicenseComments: false
});