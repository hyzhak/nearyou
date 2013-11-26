define([
    'app/google/analytics',
    'app/gps/getCurrentPositionServer',
    'app/main/locationStateService'
], function(GoogleAnalytics, GetCurrentPositionServer, LocationStateService) {
    'use strict';
    return {
        'GoogleAnalytics': GoogleAnalytics,
        'GetCurrentPositionServer': GetCurrentPositionServer,
        'LocationStateService': LocationStateService
    };
});