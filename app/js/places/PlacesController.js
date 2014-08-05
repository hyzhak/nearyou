define([
    'angular',
    'lodash',

    'leaflet-markerclusterer',
    'css!lib/leaflet-dist/leaflet.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.Default.css',

    'app/images/images',
    './deletedPlacesService'
], function (angular, _) {
    'use strict';

    var DEFAULT_DISTANCE = 5000;

    angular.module('NY.PlacesCtrl', [
            'Instagram',
            'NY.DeletedPlacesService',
            'NY.ImagesService'
        ])
        .controller('PlacesCtrl', [
            'DeletedPlacesService',

            'FOUR_SQUARE_CLIENT',

            'FourSquareVenues',
            'FourSquareSearch',

            'INSTAGRAM_CLIENT_ID',
            'GoogleAnalytics',
            'GoogleGeoCoding',
            'ImagesService',
            'LocationStateService',
            'Locations',
            '$rootScope',
            '$scope',
            '$stateParams',
            '$timeout',
            function (DeletedPlacesService, FOUR_SQUARE_CLIENT, FourSquareVenues, FourSquareSearch, INSTAGRAM_CLIENT_ID, GoogleAnalytics, GoogleGeoCoding, ImagesService, LocationStateService, Locations, $rootScope, $scope, $stateParams, $timeout) {

                var usedImages = [];

                LocationStateService.bounds = {};

                $scope.autoUpdate = true;
                $scope.center = {
                    lat: $stateParams.lat ? Number($stateParams.lat) : LocationStateService.lat,
                    lng: $stateParams.lng ? Number($stateParams.lng) : LocationStateService.lng,
                    zoom: $stateParams.zoom ? Number($stateParams.zoom) : 14
                };

                angular.extend($scope, {
                    bounds: {
                        southWest: {
                            lat: 0,
                            lng: 0
                        },
                        northEast: {
                            lat: 0,
                            lng: 0
                        }
                    },
                    paths: {
                    },
                    layers: {
                        baselayers: {
                            osm: {
                                name: 'OpenStreetMap',
                                type: 'xyz',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                layerOptions: {
                                    subdomains: ['a', 'b', 'c'],
                                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                    continuousWorld: true
                                }
                            }
                        },
                        overlays: {
                            images: {
                                name: 'images',
                                type: 'markercluster',
                                visible: true,
                                layerOptions: {
                                    singleMarkerMode: true,
                                    iconCreateFunction: iconCreateFunction
                                }
                            }
                        }
                    },
                    defaults: {
                        maxZoom: 17
                    }
                });

                $scope.markers = {};
                $scope.markersByLocation = {};

                $scope.selected = null;

                $scope.focusOn = function (place) {
                    var marker = $scope.markers[place.id];
                    if (!marker || !beforeFocusOnMarker(marker)) {
                        return;
                    }
                    marker.focus = true;
                    previousFocusedMarker = marker;
                    afterFocusOnMarker(marker);
                    focusOn(marker);
                };

                var currentSelectedMarker = null;

                function focusOn(marker) {
                    if (currentSelectedMarker) {
                        delete $scope.paths[currentSelectedMarker.id];
                    }
                    currentSelectedMarker = marker;
                    $scope.selected = marker;

                    /*$scope.paths[currentSelectedMarker.id] = {
                        weight: 2,
                        color: '#ff612f',
                        latlngs: marker,
                        radius: LocationStateService.distance || DEFAULT_DISTANCE,
                        type: 'circle'
                    };*/
                }

                function mapChangeHandler(event, e) {
                    var bounds = e.leafletEvent.target.getBounds();
                    updateBounds(bounds.getSouthWest(), bounds.getNorthEast());
                    trackCenterToGoogleAnalytics();
                }

                $scope.$on('leafletDirectiveMap.zoomend', mapChangeHandler);

                $scope.$on('leafletDirectiveMap.dragend', mapChangeHandler);

                $scope.$on('leafletDirectiveMarkersClick', function (e, id) {
                    var marker = $scope.markers[id];
                    //$rootScope.$broadcast('selectMarkerOnMap', id);
                    $rootScope.$broadcast('scroll-to-place-' + id);
                    beforeFocusOnMarker(marker);
                    afterFocusOnMarker(marker);
                    focusOn(marker);
                });

                $scope.search = function (text) {
                    GoogleAnalytics.trackEvent('search start', text);

                    GoogleGeoCoding.get({
                        address: text
                    }).$promise.then(function (data) {
                            $scope.autoUpdate = false;

                            var zoomOnGeoCoding = zoomToGeoCoding(data.results);

                            data.results.forEach(function (item) {
                                addVenueFromGoogleGeoCoding(item);
                            });

                            var centerLat = ($scope.bounds.southWest.lat + $scope.bounds.northEast.lat) / 2,
                                centerLng = ($scope.bounds.southWest.lng + $scope.bounds.northEast.lng) / 2;

                            FourSquareSearch.get({
                                query: text,
                                ll: centerLat + ',' + centerLng,
                                apiVersion: FOUR_SQUARE_CLIENT.currentAPIDate,
                                clientId: FOUR_SQUARE_CLIENT.CLIENT_ID,
                                clientSecret: FOUR_SQUARE_CLIENT.CLIENT_SECRET
                            }).$promise.then(function (data) {
                                    //updateGeneration();
                                    removeAllMarkers();
                                    GoogleAnalytics.trackEvent('search end', text, Number(data.response.totalResults));
                                    if (data.response.warning && data.response.warning.text) {
                                        GoogleAnalytics.trackEvent('search warning', data.response.warning.text, Number(data.response.totalResults));
                                    }
                                    var result;
                                    data.response.groups.forEach(function (group) {
                                        group.items.forEach(function (item) {
                                            result = addVenueFromFourSquare(item.venue);
                                        });
                                    });
                                    if (!zoomOnGeoCoding) {
                                        zoomToMarkers($scope.markers);
                                    }
                                });
                        });
                };

                $scope.$watch('autoUpdate', function (newValue) {
                    if (newValue) {
                        fetchVenuesFromFourSquare();
                    }
                });

                $scope.normalizePlaceTitle = function (value) {
                    return encodeURIComponent(value);
                };

                trackCenterToGoogleAnalytics();

                /**
                 * increase life of each marker
                 *
                 * @private
                 */
                function updateGeneration() {
                    var ids = Object.keys($scope.markers);
                    ids.forEach(function (id) {
                        $scope.markers[id].life++;
                    });
                }

                /**
                 * remove all markers
                 * @private
                 */
                function removeAllMarkers() {
                    $scope.markers = {};
                }

                /**
                 * zoom map to show all markers
                 * @param markers
                 */
                function zoomToMarkers(markers) {
                    var ids = Object.keys(markers),
                        minLat = Number.MAX_VALUE,
                        maxLat = -Number.MAX_VALUE,
                        minLng = Number.MAX_VALUE,
                        maxLng = -Number.MAX_VALUE,
                        count = 0;

                    ids.forEach(function (id) {
                        var marker = markers[id];
                        minLat = Math.min(minLat, marker.lat);
                        maxLat = Math.max(maxLat, marker.lat);
                        minLng = Math.min(minLng, marker.lng);
                        maxLng = Math.max(maxLng, marker.lng);
                        count++;
                    });

                    if (count > 0) {
                        zoomToBounds(minLat, maxLat, minLng, maxLng);
                    }
                }

                function zoomToGeoCoding(result) {
                    if (result.length <= 0) {
                        return false;
                    }
                    var minLat = Number.MAX_VALUE,
                        maxLat = -Number.MAX_VALUE,
                        minLng = Number.MAX_VALUE,
                        maxLng = -Number.MAX_VALUE;

                    var bounds = result[0].geometry.bounds;
                    minLat = Math.min(minLat, bounds.southwest.lat);
                    maxLat = Math.max(maxLat, bounds.northeast.lat);
                    minLng = Math.min(minLng, bounds.southwest.lng);
                    maxLng = Math.max(maxLng, bounds.northeast.lng);

                    zoomToBounds(minLat, maxLat, minLng, maxLng);

                    return true;
                }

                /**
                 * zoom to bounds
                 *
                 * @param minLat
                 * @param maxLat
                 * @param minLng
                 * @param maxLng
                 */
                function zoomToBounds(minLat, maxLat, minLng, maxLng) {
                    if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
                        //
                    } else {
                        if (minLat === maxLat || minLng === maxLng) {
                            $scope.center.lat = (maxLat + minLat) / 2;
                            $scope.center.lng = (maxLng + minLng) / 2;
                        } else {
                            if (minLat > maxLat) {
                                var tmp = minLat;
                                minLat = maxLat;
                                maxLat = tmp;
                            }
                            if (minLng > maxLng) {
                                var tmp = minLng;
                                minLng = maxLng;
                                maxLng = tmp;
                            }
                            $scope.bounds.southWest.lat = maxLat;
                            $scope.bounds.southWest.lng = maxLng;
                            $scope.bounds.northEast.lat = minLat;
                            $scope.bounds.northEast.lng = minLng;
                        }
                    }
                }

                /**
                 * add marker from 4sq
                 *
                 * @private
                 * @param venue
                 * @returns {{id: *, lat: *, lng: *, message: (*)}}
                 */
                function addVenueFromFourSquare(venue) {
                    var marker = addMarker({
                        //icon: icon,
                        id: venue.id,
                        lat: venue.location.lat,
                        lng: venue.location.lng,
                        layer: 'images',
                        message: venue.name,
                        title: venue.name,
                        location: venue.name,
                        life: 0,
                        favorites: false
                    });

                    setupIconForMarker(marker);
                    return marker;
                }

                function addVenueFromGoogleGeoCoding(item) {
                    return;
                    /*var id = item.address_components.map(function(component) {
                     return component.long_name;
                     }).join(',').replace(/\s/gi, '-');*/
                    var id = generateID();
                    deleteMarker(id);
                    var marker = $scope.markers[id] = {
                        //icon: icon,
                        id: id,
                        lat: item.geometry.location.lat,
                        lng: item.geometry.location.lng,
                        layer: 'images',
                        message: item.address_components[0].long_name,
                        title: item.address_components[0].long_name,
                        life: 0,
                        favorites: false
                    };
                    setupIconForMarker(marker);
                    return marker;
                }

                function generateID() {
                    return Date.now() + '_' + String(Math.random()).substr(2, 100);
                }

                /**
                 * @private
                 */
                function trackCenterToGoogleAnalytics() {
                    GoogleAnalytics.trackPage('places [' + $scope.center.lat + ', ' + $scope.center.lng + '],' +
                        'zoom : ' + $scope.center.zoom);
                }

                var lazy = (function () {
                    var timeoutId;

                    return function (callback, interval) {
                        if (timeoutId) {
                            $timeout.cancel(timeoutId);
                        }

                        timeoutId = $timeout(function () {
                            callback();
                            timeoutId = null;
                        }, interval);
                    }
                })();

                /**
                 * fetch venues from 4sq
                 * @private
                 */
                function fetchVenuesFromFourSquare() {
                    var bounds = LocationStateService.bounds;
                    if (!bounds.sw || !bounds.ne) {
                        return;
                    }

                    FourSquareVenues.get({
                        sw: bounds.sw.lat + ', ' + bounds.sw.lng,
                        ne: bounds.ne.lat + ', ' + bounds.ne.lng,
                        //categories: catetories.join(','),
                        apiVersion: FOUR_SQUARE_CLIENT.currentAPIDate,
                        clientId: FOUR_SQUARE_CLIENT.CLIENT_ID,
                        clientSecret: FOUR_SQUARE_CLIENT.CLIENT_SECRET
                    }).$promise.then(function (data) {
                            if (data.response.venues) {
                                updateGeneration();
                                data.response.venues.forEach(function (venue) {
                                    addVenueFromFourSquare(venue);
                                });
                            }
                        });
                }

                function addMarker(marker) {
                    if ($scope.markersByLocation[marker.location]) {
                        //TODO: update
                        return $scope.markersByLocation[marker.location];
                    }

                    $scope.markers[marker.id] = marker;

                    $scope.markersByLocation[marker.location] = marker;

                    return marker;
                }

                function fetchImageFromCache() {
                    var bounds = LocationStateService.bounds;
                    if (!bounds.sw || !bounds.ne) {
                        return;
                    }

                    var newImages = _(ImagesService.getImageInside(bounds));

                    newImages.forEach(function(newImage) {
                        addMarker({
                            id: generateID(),
                            icon: buildImageIcon(newImage.image),
                            _image: newImage.image,
                            lat: newImage.lat,
                            lng: newImage.lng,
                            layer: 'images',
                            message: newImage.name || '',
                            title: newImage.name || '',
                            location: newImage.location
                        });
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
                    }).$promise.then(function (data) {
                            if (data.data) {
                                data.data.forEach(function (venue) {
                                    if ($scope.markers[venue.id]) {
                                        return;
                                    }
                                    $scope.markers[venue.id] = {
                                        id: venue.id,
                                        lat: venue.latitude,
                                        lng: venue.longitude,
                                        layer: 'images',
                                        message: venue.name,
                                        title: venue.name,
                                        life: 0
                                    };
                                    setupIconForMarker($scope.markers[venue.id]);
                                });
                            }
                        });
                }


                /**
                 * setup icon image for marker
                 * @param marker
                 */
                function setupIconForMarker(marker) {
//                    var image = getImageByCoords(marker.lat, marker.lng);
                    var image = ImagesService.getImageByLocation(marker.location);
                    if (image) {
                        marker.icon = buildImageIcon(image);
                        marker.icon._image = image
                    }
                }

                /**
                 * build icon
                 *
                 * @param url
                 * @returns {*}
                 */
                function buildImageIcon(url) {var icon =  L.divIcon({
                        html: '<img src="' + url + '" width="64" height="64"/>',
                        popupAnchor: [0, -32],
                        iconAnchor: [32, 32]
                    });

                    icon._image = url;

                    return icon;
                }

                /**
                 * delete marker
                 * @param id
                 */
                function deleteMarker(id) {
                    var marker = $scope.markers[id];
                    if (!marker) {
                        return;
                    }

                    var image = getImageOfMarkerData(marker),
                        index = usedImages.indexOf(image);

                    if (index >= 0) {
                        usedImages.splice(index, 1);
                    }

                    DeletedPlacesService.addToDeleted(marker);

                    delete $scope.markers[id];
                    delete $scope.markersByLocation[marker.location];
                }

                /**
                 * get image by it's coords
                 *
                 * @private
                 * @param lat
                 * @param lng
                 * @returns {*}
                 */
                function getImageByCoords(lat, lng) {
                    var image = ImagesService.getImageByCoords(lat, lng);
                    if (image && usedImages.indexOf(image) < 0) {
                        usedImages.push(image);
                        return image;
                    } else {
                        return null;
                    }
                }

                /**
                 * @private
                 */
                function hideInvisibleMarkers() {
                    var markers = $scope.markers,
                        ids = Object.keys(markers);

                    ids.forEach(function (id) {
                        var venue = markers[id];
                        if (isVenueInvisible(venue)) {
                            deleteMarker(id);
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

                function updateBounds(sw, ne) {
                    var maxWidth = 2,
                        maxHeight = 2;

                    LocationStateService.bounds = {
                        sw: sw,
                        ne: ne
                    };

                    //localVenues = null;

                    DeletedPlacesService.fetchVenuesFromDeleted(sw, ne, function (marker) {
//                        $scope.markers[marker.id] = marker;
                        addMarker(marker);
                    });

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

                    if ($scope.autoUpdate) {
                        lazy(fetchVenuesFromFourSquare, 2 * 1000);
                    }

                    fetchImageFromCache();

                    if ($scope.autoUpdate) {
                        hideInvisibleMarkers();
                    }
                }

                var previousFocusedMarker = null;

                function beforeFocusOnMarker(marker) {
                    if (previousFocusedMarker === marker) {
                        return false;
                    }

                    if (!previousFocusedMarker) {
                        return true;
                    }

                    previousFocusedMarker.focus = false;
                    return true;
                }

                function afterFocusOnMarker(marker) {
                    previousFocusedMarker = marker;
                }

                function getImageOfMarkerData(markerData) {
                    return markerData && markerData.icon && markerData.icon._image;
                }

                function getImageOfMarker(marker) {
                    return marker && marker.options && marker.options.icon && marker.options.icon.options && marker.options.icon.options._image;
                }

                function iconCreateFunction(cluster) {
                    var children = cluster.getAllChildMarkers(),
                        image = _(children)
                                    .map(function(marker) {
                                        return marker && marker.options && marker.options.icon && marker.options.icon.options && marker.options.icon.options._image;
                                    })
                                    .filter(function(url) {
                                        return !!url;
                                    })
                                    .first();

                    var childCount = cluster.getChildCount();

                    var c = ' marker-cluster-';
                    if (childCount < 10) {
                        c += 'small';
                    } else if (childCount < 100) {
                        c += 'medium';
                    } else {
                        c += 'large';
                    }

                    var imageSrc = image ? ('<img src="' + image + '" width="64" height="64"/>') : '';

                    return new L.DivIcon({
                        html: '<div>' + imageSrc + (childCount > 1?('<span>' + childCount + '</span>'):'') + '</div>',
                        _image: image,
                        className: 'marker-cluster' + c,
                        iconSize: new L.Point(40, 40)
                    });
                }
            }]);
});