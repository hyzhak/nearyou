define([], function() {
    'use strict';

    var ctrl = function(INSTAGRAM_CLIENT_ID, GoogleAnalytics, LocationStateService, Locations, $scope) {
        GoogleAnalytics.trackPage('places');

        $scope.center = {
            lat: LocationStateService.lat,
            lng: LocationStateService.lng,
            zoom: 14
        };

        $scope.markers = {};

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

        $scope.events = {
            dblclick: function(e){
                console.log(e);
            },
            click: function(e) {
                console.log(e);
            },
            zoomend: function(e) {
//                lazyUpdateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
//                LocationService.setLocation($scope.center.lat, $scope.center.lng, $scope.center.zoom);
            },
            dragend: function(e) {
//                lazyUpdateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
//                LocationService.setLocation($scope.center.lat, $scope.center.lng, $scope.center.zoom);
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
        'INSTAGRAM_CLIENT_ID',
        'GoogleAnalytics',
        'LocationStateService',
        'Locations',
        '$scope'
    ];

    return ctrl;
});