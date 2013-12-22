define([
    'app/google/analytics',
    'app/gps/getCurrentPositionServer',
    'app/main/locationStateService',
    'app/images/images'
], function(GoogleAnalytics, GetCurrentPositionServer, LocationStateService, ImagesService) {
    'use strict';
    return {
        'GoogleAnalytics': GoogleAnalytics,
        'GetCurrentPositionServer': GetCurrentPositionServer,
        'LocationStateService': LocationStateService,
        'ImagesService': ImagesService
    };
});