define([
    'app/google/analytics',
    'app/gps/getCurrentPositionServer',
    'app/main/locationStateService',
    'app/images/images',
    'app/places/deletedPlacesService'
], function(GoogleAnalytics, GetCurrentPositionServer, LocationStateService, ImagesService, DeletedPlacesService) {
    'use strict';
    return {
        'GoogleAnalytics': GoogleAnalytics,
        'GetCurrentPositionServer': GetCurrentPositionServer,
        'LocationStateService': LocationStateService,
        'ImagesService': ImagesService,
        'DeletedPlaceService': DeletedPlacesService
    };
});