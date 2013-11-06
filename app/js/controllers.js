define([
    'app/local/localImagesController',
    'app/local/requestUserLocationController',
    'app/main/mainController'
], function(LocalImagesCtrl, RequestUserLocationCtrl, MainCtrl) {
    'use strict';
    return {
        'LocalImagesCtrl': LocalImagesCtrl,
        'RequestUserLocationCtrl': RequestUserLocationCtrl,
        'MainCtrl': MainCtrl
    };
});