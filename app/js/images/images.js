define([
    'angular',
    'app/images/cacheGenerator'
], function(angular, cacheGenerator) {
    'use strict';

    angular.module('NY.ImagesService', [])
        .service('ImagesService', function() {
            var api = this,
                imagesByCache = {},
                imagesByLocation = {};

            api.getImage = function(cache) {
                return imagesByCache[cache];
            };

            api.getImageByCoords = function(lat, lng) {
                return this.getImage(cacheGenerator(lat, lng));
            };

            api.setImage = function(cache, image) {
                imagesByCache[cache] = image;
            };

            api.addImage = function(lat, lng, name, image) {
                var location = name || cacheGenerator(lat, lng);

                imagesByLocation[location] = {
                    lat: lat,
                    lng: lng,
                    name: name,
                    image: image
                };
            };

            api.getImageByLocation = function(location) {
                return imagesByLocation[location];
            };
        });
});