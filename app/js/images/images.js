define([
    'angular',
    'app/images/cacheGenerator',
    'lodash'
], function(angular, cacheGenerator, _) {
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

            api.addImage = function(lat, lng, name, image, metadata) {
                var location = name || cacheGenerator(lat, lng);

                imagesByLocation[location] = {
                    lat: lat,
                    lng: lng,
                    location: location,
                    name: name,
                    src: image,
                    metadata: metadata
                };
            };

            api.getImageByLocation = function(location) {
                return imagesByLocation[location];
            };

            api.getImageInside = function(bounds) {
                return _(imagesByLocation)
                    .values()
                    .filter(function(image) {
                        return bounds.sw.lat < image.lat &&
                            image.lat < bounds.ne.lat &&
                            bounds.sw.lng < image.lng &&
                            image.lng < bounds.ne.lng;
                    })
                    .value();
            };
        });
});