define([], function() {
    'use strict';

    /**
     * generate cache for geo-located image
     *
     * @param lat
     * @param lng
     * @returns {string}
     */
    return function(lat, lng) {
        return lat.toFixed(2) + ',' + lng.toFixed(2);
    }
});