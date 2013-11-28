define([
    'css!lib/leaflet-dist/leaflet.css'
], function() {
    'use strict';

    var ctrl = function(FOUR_SQUARE_CLIENT, FourSquareVenues, INSTAGRAM_CLIENT_ID, GoogleAnalytics, LocationStateService, Locations, $scope, $timeout) {
        LocationStateService.bounds = {};

        $scope.center = {
            lat: LocationStateService.lat,
            lng: LocationStateService.lng,
            zoom: 14
        };

        $scope.markers = {};

        fetchVenuesFromInstagram();
        trackCenterToGoogleAnalytics();

        /**
         * @private
         */
        function trackCenterToGoogleAnalytics() {
            GoogleAnalytics.trackPage('places [' + $scope.center.lat + ', ' + $scope.center.lng + '],' +
                'zoom : ' + $scope.center.zoom);
        }

        /**
         * fetch venues from 4sq
         * @private
         */
        function fetchVenuesFromFourSquare() {
            var bounds = LocationStateService.bounds;
            FourSquareVenues.get({
                sw: bounds.sw.lat + ', ' + bounds.sw.lng,
                ne: bounds.ne.lat + ', ' + bounds.ne.lng,
                //categories: catetories.join(','),
                apiVersion: FOUR_SQUARE_CLIENT.currentAPIDate,
                clientId: FOUR_SQUARE_CLIENT.CLIENT_ID,
                clientSecret: FOUR_SQUARE_CLIENT.CLIENT_SECRET
            }).$promise.then(function(data) {
                if (data.response.venues) {
                    data.response.venues.forEach(function(venue) {
                        var iconResource = venue.categories[0].icon,
                            size = 64,
                            icon = L.icon({
                                iconUrl: iconResource.prefix + size + iconResource.suffix,
                                iconSize: [size, size]
                            });
                        $scope.markers[venue.id] = {
                            //icon: icon,
                            lat: venue.location.lat,
                            lng: venue.location.lng,
                            message: venue.name,
                            title: venue.name
                        };
                    });
                }
            });
        }

        /**
         * fetch venues from Instagram
         * @private
         */
        function fetchVenuesFromInstagram() {
            Locations.query({
                clientId: INSTAGRAM_CLIENT_ID,
                lat: LocationStateService.lat,
                lng: LocationStateService.lng
            }).$promise.then(function(data) {
                if (data.data) {
                    data.data.forEach(function(venue) {
                        $scope.markers[venue.id] = {
                            lat: venue.latitude,
                            lng: venue.longitude,
                            message: venue.name,
                            title: venue.name
                        };
                    });
                }
            });
        }

        /**
         * @private
         */
        function hideInvisibleMarkers() {
            var markers = $scope.markers,
                ids = Object.keys(markers);

            ids.forEach(function(id) {
                var venue = markers[id];
                if (isVenueInvisible(venue)) {
                    delete markers[id];
                }
            });
        }

        /**
         * @private
         * @param venue
         * @returns {*}
         */
        function isVenueInvisible(venue) {
            if (!venue) {
                return false;
            }

            return isOutsideTheBounds(venue);
        }

        function isOutsideTheBounds(point) {
            var bounds = LocationStateService.bounds;
            return point.lat < bounds.sw.lat || bounds.ne.lat < point.lat ||
                   point.lng < bounds.sw.lng || bounds.ne.lng < point.lng;
        }


        /**
         * lazy update bounds. Update only after 2 seconds of lack of other updates
         *
         * @private
         * @param sw
         * @param ne
         */
        var lazyUpdateBounds = (function() {
            var storedSW,
                storedNE,
                timeoutId;

            return function (sw, ne) {
                storedSW = sw;
                storedNE = ne;

                if (timeoutId) {
                    $timeout.cancel(timeoutId);
                }

                timeoutId = $timeout(function() {
                    updateBounds(storedSW, storedNE);
                    timeoutId = null;
                }, 2 * 1000)
            }
        })();

        function updateBounds(sw, ne) {
            var maxWidth = 2,
                maxHeight = 2;

            LocationStateService.bounds = {
                sw: sw,
                ne: ne
            };

            //localVenues = null;

            //TODO: Fix Bounding quadrangles with an area up to approximately 10,000 square kilometers are supported.
            if (ne.lat - sw.lat > maxWidth) {
                var latCenter = 0.5 * (ne.lat + sw.lat);
                sw.lat = latCenter - 0.5 * maxWidth;
                ne.lat = latCenter + 0.5 * maxWidth;
            }

            if (ne.lng - sw.lng > maxHeight) {
                var lngCenter = 0.5 * (ne.lng + sw.lng);
                sw.lng = lngCenter - 0.5 * maxHeight;
                ne.lng = lngCenter + 0.5 * maxHeight;
            }

            fetchVenuesFromFourSquare();
        }


        $scope.events = {
            dblclick: function(e){
                console.log(e);
            },
            click: function(e) {
                console.log(e);
            },
            zoomend: function(e) {
                lazyUpdateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
                trackCenterToGoogleAnalytics();
                hideInvisibleMarkers();
            },
            dragend: function(e) {
                lazyUpdateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
                trackCenterToGoogleAnalytics();
                hideInvisibleMarkers();
            },
            moveend: function(e) {
//                if (needInitialize) {
//                    var sw = e.target.getBounds().getSouthWest(),
//                        ne = e.target.getBounds().getNorthEast();
//                    lazyUpdateBounds(sw, ne);
//                    LocationService.setLocation(0.5 * (sw.lat + ne.lat), 0.5 * (sw.lng + ne.lng), $scope.center.zoom);
//
//                    needInitialize = false;
//                }
            }
        };
    };

    ctrl.$inject = [
        'FOUR_SQUARE_CLIENT',
        'FourSquareVenues',
        'INSTAGRAM_CLIENT_ID',
        'GoogleAnalytics',
        'LocationStateService',
        'Locations',
        '$scope',
        '$timeout'
    ];

    return ctrl;
});