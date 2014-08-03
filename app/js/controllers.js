define([
    'app/near/requestUserLocationController',
    'app/main/mainController',
    'app/ui/FooterController'
], function(RequestUserLocationCtrl, MainCtrl, FooterController) {
    'use strict';
    return {
        'RequestUserLocationCtrl': RequestUserLocationCtrl,
        'MainCtrl': MainCtrl,
        'FooterController': FooterController
    };
});