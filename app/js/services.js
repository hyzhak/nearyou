define([
    'app/google/analytics',
    'app/gps/getCurrentPositionServer'
], function(GoogleAnalytics, GetCurrentPositionServer) {
    'use strict';
    return {
        'GoogleAnalytics': GoogleAnalytics,
        'GetCurrentPositionServer': GetCurrentPositionServer
    };
});