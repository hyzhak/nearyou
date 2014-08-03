define([
    'app/near/localImagesController',
    'app/near/requestUserLocationController',
    'app/main/mainController',
    'app/ui/FooterController'
], function(LocalImagesCtrl, RequestUserLocationCtrl, MainCtrl, FooterController) {
    'use strict';
    return {
        'LocalImagesCtrl': LocalImagesCtrl,
        'RequestUserLocationCtrl': RequestUserLocationCtrl,
        'MainCtrl': MainCtrl,
        'FooterController': FooterController
    };
});