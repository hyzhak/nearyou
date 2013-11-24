/**
 * Get User position by
 * http://get-current-position.appspot.com/
 *
 * source code of service: https://github.com/Hyzhak/get-current-position
 *
 * service
 */
define([], function() {
    'use strict';
    var getCurrentPositionServer = function($http, $resource){

        function receiveData() {
            return $resource('http://get-current-position.appspot.com/').get().$promise.then(function(data) {
                return data;
            });
        }

        /**
         * get user location object {lat, lng}
         *
         * @returns {Promise}
         */
        this.getUserLocation = function() {
            return receiveData().then(function(response) {
                response.coords = {
                    latitude: Number(response.coords.latitude),
                    longitude: Number(response.coords.longitude)
                };
                return response;
            });
        }
    };
    getCurrentPositionServer.$inject = ['$http', '$resource'];
    return getCurrentPositionServer;
});