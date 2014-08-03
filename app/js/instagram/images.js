define([
    'angular'
], function(angular) {

    'use strict';
    angular.module('Instagram', [])
        .service('InstagramImages', ['INSTAGRAM_CLIENT_ID', '$http', function(INSTAGRAM_CLIENT_ID, $http) {
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
                        return result.data.data;
                    });
            };
        }]);
});