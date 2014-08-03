define([
    'angular'
], function (angular) {

    'use strict';

    angular.module('NY.DeletedPlacesService', [])
        .service('DeletedPlacesService', function () {
            var api = this;
            api.deletedMarkers = [];

            /**
             * @private
             * get venues from deleted and add them back to visible
             */
            api.fetchVenuesFromDeleted = function (sw, ne, callback) {
                for (var i = api.deletedMarkers.length - 1; i >= 0; i--) {
                    var marker = api.deletedMarkers[i];
                    if (isMarkerInBounds(marker, sw, ne)) {
                        api.deletedMarkers.splice(i, 1);
                        callback(marker);
                    }
                }
            };

            api.addToDeleted = function (marker) {
                api.deletedMarkers.push(marker);
            };

            function isMarkerInBounds(marker, sw, ne) {
                return sw.lat <= marker.lat && marker.lat <= ne.lat &&
                    sw.lng <= marker.lng && marker.lng <= ne.lng;
            }
        });
});