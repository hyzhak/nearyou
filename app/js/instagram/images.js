define([
    'angular',
    'app/images/images'
], function(angular) {
    'use strict';

    angular.module('Instagram', [
            'NY.ImagesService'
        ])
        .constant({
            MAX_INSTAGRAM_RADIUS: 5000
        })
        .service('InstagramImages', ['ImagesService', 'INSTAGRAM_CLIENT_ID', '$http', '$q', function(ImagesService, INSTAGRAM_CLIENT_ID, $http, $q) {
            var self = this;

            /**
             *
             * @param lat
             * @param lng
             * @param distance
             * @param (from)
             * @returns {*}
             */
            self.queryByLocation = function(lat, lng, distance, from) {
                return $http.jsonp(
                    'https://api.instagram.com/v1/media/search', {
                        params: {
                            client_id: INSTAGRAM_CLIENT_ID,
                            callback: 'JSON_CALLBACK',
                            lat: lat,
                            lng: lng,
                            distance: distance || 5000,
                            max_timestamp: from || Math.round(Date.now() / 1000)
                        }
                    }
                )
                    .then(function(result) {
                        var images = result.data.data;
                        angular.forEach(images, function(image) {
                            ImagesService.addImage(
                                image.location.latitude,
                                image.location.longitude,
                                image.location.name,
                                image.images.thumbnail.url,
                                {
                                    instagram: image.id
                                }
                            );
                        });

                        return images;
                    });
            };

            self.getImage = function(id) {
                return $http.jsonp('https://api.instagram.com/v1/media/' + id, {
                    params: {
                        callback: 'JSON_CALLBACK',
                        client_id: INSTAGRAM_CLIENT_ID
                    }})
                    .then(function(result) {
                        return result.data.data;
                    }, function(err) {
                        //TODO: notify about error
                        console.log(err);
                        return $q.reject(err);
                    });
            }
        }]);
});