requirejs({
    paths: {
        'app': 'js',

        //libs
        'text': 'lib/requirejs-text/text',
        'angular': 'lib/angular/angular',
        'angular-resource': 'lib/angular-resource/angular-resource',
        'angular-route': 'lib/angular-route/angular-route',
        'angular-ui-router': 'lib/angular-ui-router/release/angular-ui-router',
        'jquery': 'lib/jquery/jquery',
        /*'jquery': [
         'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
         'lib/jquery/jquery'
         ],*/
        'bootstrap': 'lib/bootstrap/dist/js/bootstrap'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-hammer': {
            deps: ['angular', 'lib/hammer.min'],
            exports: 'angular-hammer'
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'jquery':{
            exports: '$'
        },
        'bootstrap': {
            deps: ['jquery']
        }
    },
    name: 'js/main'
});