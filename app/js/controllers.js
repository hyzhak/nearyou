define([
    'app/near/localImagesController',
    'app/near/requestUserLocationController',
    'app/places/placesController',
    'app/main/mainController',
    'app/ui/FooterController',
], function(LocalImagesCtrl, RequestUserLocationCtrl, PlacesController, MainCtrl, FooterController) {
    'use strict';
    return {
        'LocalImagesCtrl': LocalImagesCtrl,
        'RequestUserLocationCtrl': RequestUserLocationCtrl,
        'PlacesCtrl': PlacesController,
        'MainCtrl': MainCtrl,
        'FooterController': FooterController,
    };
});