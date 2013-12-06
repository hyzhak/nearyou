/**
 * Service for Geocoding
 *
 * https://developers.google.com/maps/documentation/geocoding/
 *
 */
define([], function() {
    'use strict';

    var service = function($resource) {
        return $resource('http://maps.googleapis.com/maps/api/geocode/json?' +
            'address=:address&' +
            'sensor=:sensor', {
                'sensor': false
            });
    };

    service.$inject = ['$resource'];

    return service;
});