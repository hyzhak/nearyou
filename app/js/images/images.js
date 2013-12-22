define([
    'app/images/cacheGenerator'
], function(cacheGenerator) {
    'use strict';
    var service = function() {
        var api = this,
            imagesByCache = {};

        api.getImage = function(cache) {
            return imagesByCache[cache];
        };

        api.getImageByCoords = function(lat, lng) {
            return this.getImage(cacheGenerator(lat, lng));
        };

        api.setImage = function(cache, image) {
            imagesByCache[cache] = image;
        };
    };
    service.$inject = [];
    return service;
});