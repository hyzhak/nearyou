requirejs({
    paths: {
        'app': 'js',

        //libs
        'text': 'lib/requirejs-text/text',
        'angular': 'lib/angular/angular',
        'angular-resource': 'lib/angular-resource/angular-resource',
        'angular-ui-router': 'lib/angular-ui-router/release/angular-ui-router'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-hammer': {
            deps: ['angular', 'lib/hammer.min'],
            exports: 'angular-hammer'
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-ui-router': {
            deps: ['angular']
        }
    },
    name: 'lib/almond/almond',
    include: ['js/main']
});