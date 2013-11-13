define([
    'app/near/localImagesController',
    'app/near/requestUserLocationController',
    'app/main/mainController'
], function(LocalImagesCtrl, RequestUserLocationCtrl, MainCtrl) {
    'use strict';
    return {
        'LocalImagesCtrl': LocalImagesCtrl,
        'RequestUserLocationCtrl': RequestUserLocationCtrl,
        'MainCtrl': MainCtrl
    };
});