define([
    'angular',
    'leaflet',
    'lodash',

    'leaflet-markerclusterer',
    'css!lib/leaflet-dist/leaflet.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.Default.css',

    'app/images/images',
    'app/image/imageDlg',
    './deletedPlacesService'
], function (angular, L, _) {
    'use strict';

    angular.module('NY.PlacesCtrl', [
            'Instagram',
            'NY.DeletedPlacesService',
            'NY.ImageDlg',
            'NY.ImagesService'
        ])
        .constant({
            MAX_NUM_OF_VISIBLE_MARKERS: 100,
            IF_NUM_OF_VISIBLE_MARKERS_THEN_TRIGGER_OVERPOPULATION: 80,
            OVERPOPULATION_LIMIT: 3
        })
        .controller('PlacesCtrl', [
            'DeletedPlacesService',

            'FOUR_SQUARE_CLIENT',

            'FourSquareVenues',
            'FourSquareSearch',

            'INSTAGRAM_CLIENT_ID',
            'ImageDlgService',
            'GoogleAnalytics',
            'GoogleGeoCoding',
            'IF_NUM_OF_VISIBLE_MARKERS_THEN_TRIGGER_OVERPOPULATION',
            'ImagesService',
            'InstagramImages',
            'LocationStateService',
            'Locations',
            '$location',
            '$log',
            'OVERPOPULATION_LIMIT',
            'MAX_INSTAGRAM_RADIUS',
            'MAX_NUM_OF_VISIBLE_MARKERS',
            '$q',
            '$rootScope',
            '$scope',
            '$state',
            '$stateParams',
            '$timeout',
            function (DeletedPlacesService, FOUR_SQUARE_CLIENT, FourSquareVenues, FourSquareSearch,
                      INSTAGRAM_CLIENT_ID, ImageDlgService, GoogleAnalytics,
                      GoogleGeoCoding, IF_NUM_OF_VISIBLE_MARKERS_THEN_TRIGGER_OVERPOPULATION, ImagesService, InstagramImages,
                      LocationStateService, Locations, $location, $log, OVERPOPULATION_LIMIT, MAX_INSTAGRAM_RADIUS,
                      MAX_NUM_OF_VISIBLE_MARKERS, $q, $rootScope, $scope, $state, $stateParams, $timeout) {

                var usedImages = [];

                L.Icon.Default.imagePath = 'images/leaflet';

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

                $scope.numOfMarkers = 0;
                $scope.markers = {};
                $scope.markersByLocation = {};
                $scope.overpopulatedMarkers = {};

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
                    var leaflet = e.leafletEvent.target,
                        bounds = leaflet.getBounds(),
                        sw = bounds.getSouthWest(),
                        ne = bounds.getNorthEast(),
                        center = leaflet.getCenter();

                    LocationStateService.lat = center.lat;
                    LocationStateService.lng = center.lng;
                    LocationStateService.distance = getGreatCircleDistance(sw.lat, sw.lng, ne.lat, ne.lng) / 2;
                    LocationStateService.zoom = $scope.center.zoom;

                    $state.go('places', LocationStateService, {
                        inherit: true,
                        location: 'replace',
                        notify: false,
                        reload: false
                    });

                    updateBounds(sw, ne);

                    trackCenterToGoogleAnalytics();
                }

                $scope.$on('leafletDirectiveMap.zoomend', mapChangeHandler);

                $scope.$on('leafletDirectiveMap.dragend', mapChangeHandler);

                $scope.$on('leafletDirectiveMarkersClick', function (e, id) {
                    var marker = $scope.markers[id];
                    $state.go('places.instagram', {
                        imageId: marker._image.metadata.instagram
                    }, {
                        notify: false
                    });
                    /**
                    //$rootScope.$broadcast('selectMarkerOnMap', id);
                    $rootScope.$broadcast('scroll-to-place-' + id);
                    beforeFocusOnMarker(marker);
                    afterFocusOnMarker(marker);
                    focusOn(marker);
                    */
                });

                $scope.search = function (text) {
                    GoogleAnalytics.trackEvent('search start', text);

                    GoogleGeoCoding.get({
                        address: text
                    }).$promise.then(function (data) {
                            updateBounds($scope.bounds.southWest, $scope.bounds.northEast);

                            var zoomOnGeoCoding = zoomToGeoCoding(data.results);

//                          HINT: I'm not sure that we need such markers
//
//                            data.results.forEach(function (item) {
//                                addVenueFromGoogleGeoCoding(item);
//                            });

                            var centerLat = ($scope.bounds.southWest.lat + $scope.bounds.northEast.lat) / 2,
                                centerLng = ($scope.bounds.southWest.lng + $scope.bounds.northEast.lng) / 2;

                            /*

                            HINT: as well we don't need 4sq markesr
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
                            */
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
                    $scope.markersByLocation = {};
                    $scope.numOfMarkers = 0;
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
                        icon: buildImageIcon(ImagesService.getImageByLocation(venue.name)),
                        message: venue.name,
                        title: venue.name,
                        location: venue.name,
                        life: 0,
                        favorites: false
                    });

//                    setupIconForMarker(marker);
                    return marker;
                }

                function addVenueFromGoogleGeoCoding(item) {
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
                        message: 'item.address_components[0].long_name',
                        title: item.address_components[0].long_name,
                        life: 0,
                        favorites: false
                    };
                    $timeout(function() {
                        marker.message = null;
                    }, 1000);
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

                var buildLazy = function (initCallback, initInterval) {
                    return (function () {
                        var timeoutId;

                        return function (callback, interval) {
                            interval = interval || initInterval;
                            callback = callback || initCallback;
                            if (timeoutId) {
                                $timeout.cancel(timeoutId);
                            }

                            timeoutId = $timeout(function () {
                                callback();
                                timeoutId = null;
                            }, interval);
                        }
                    })();
                };

                /**
                 * This script [in Javascript] calculates great-circle distances between the two points –
                 * that is, the shortest distance over the earth’s surface – using the ‘Haversine’ formula.
                 * http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
                 *
                 * @param lat1
                 * @param lon1
                 * @param lat2
                 * @param lon2
                 * @returns {number}
                 */
                function getGreatCircleDistance(lat1, lon1, lat2, lon2) {
                    var earthRadius = 6371 * 1000; // Radius of the earth in m
                    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
                    var dLon = deg2rad(lon2 - lon1);

                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                    return earthRadius * c; // Distance in m
                }

                function deg2rad(deg) {
                    return deg * (Math.PI / 180)
                }

                function fetchInstagramImages() {
                    var bounds = $scope.bounds,
                        sw = bounds.southWest,
                        ne = bounds.northEast;

                    if (!sw || !ne) {
                        return;
                    }

                    var distance = getGreatCircleDistance(sw.lat, sw.lng, ne.lat, ne.lng),
                        radius = distance / 2,
                        targes = [
                            {
                                lat: sw.lat,
                                lng: sw.lng
                            },
                            {
                                lat: sw.lat,
                                lng: ne.lng
                            },
                            {
                                lat: ne.lat,
                                lng: sw.lng
                            },
                            {
                                lat: ne.lat,
                                lng: ne.lng
                            }
                        ];

                    if (radius > MAX_INSTAGRAM_RADIUS) {
                        radius = MAX_INSTAGRAM_RADIUS;
                        //request in a center
                        targes.push({
                            lat: 0.5 * (ne.lat + sw.lat),
                            lng: 0.5 * (ne.lng + sw.lng)
                        });
                    }

                    /**
                     * cover bounds by 4 circle with centres in a corners of bounds
                     */

                    $q.all(_(targes)
                        .map(function (point) {
                            return InstagramImages
                                .queryByLocation(
                                    point.lat, point.lng, radius
                                ).then(function () {
                                    fetchImageFromCache();
                                })
                        }));
                }

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

                    if ($scope.markers[marker.id]) {
                        throw new Error('impossible case when $scope.markers[key] is defined but $scope.markersByLocation[key] undefined');
                    }

                    if ($scope.numOfMarkers >= MAX_NUM_OF_VISIBLE_MARKERS) {
                        if (!removeOneOverPopulated()) {
                            return null;
                        }
                    }

                    if (marker.overpopulated) {
                        if ($scope.numOfMarkers >= IF_NUM_OF_VISIBLE_MARKERS_THEN_TRIGGER_OVERPOPULATION) {
                            //don't add overpopulated marker if we already has situation of overpopulation
                            return null;
                        } else {
                            //otherwise add this marker to list of markers which ready to move to overpopulation list
                            $scope.overpopulatedMarkers[marker.id] = marker;
                        }
                    }

                    $scope.numOfMarkers++;
                    $scope.markers[marker.id] = marker;

                    $scope.markersByLocation[marker.location] = marker;

                    return marker;
                }

                function addMarkerToOverpopulationList(marker) {
                    marker.overpopulated = true;
                    $scope.overpopulatedMarkers[marker.id] = marker;
                }

                /**
                 * try to remove one overpopulated marker
                 *
                 * @returns {Boolean}
                 */
                function removeOneOverPopulated() {
                    var marker = _($scope.overpopulatedMarkers)
                        .sample();

                    if (marker) {
                        return deleteMarker(marker.id);
                    } else {
                        return false;
                    }
                }

                function fetchImageFromCache() {
                    var bounds = LocationStateService.bounds;
                    if (!bounds.sw || !bounds.ne) {
                        return;
                    }

                    var newImages = _(ImagesService.getImageInside(bounds));

                    newImages.forEach(function (newImage) {
                        if (DeletedPlacesService.getImageByLocation(newImage.location)) {
                            return;
                        }

                        var id = generateID();

                        var marker = addMarker({
                            id: id,
                            _image: newImage,
                            icon: buildImageIcon(id, newImage),
                            lat: newImage.lat,
                            lng: newImage.lng,
                            layer: 'images',
                            //hack to unbindpopup
                            message: 'hello world!',
                            title: newImage.name || '',
                            location: newImage.location
                        });

                        //I have pushed request to original repo of angular-leaflet-directive if it will be merged
                        //i will remove this hack
                        $timeout(function() {
                            marker.message = null;
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
                 * @param id
                 * @param image
                 * @returns {*}
                 */
                function buildImageIcon(id, image) {
                    var icon,
                        url = image.src;
                    if (!url || typeof url !== 'string') {
                        icon =  new L.Icon.Default();
                        /*return new L.icon({

                        });*/
                    } else {
                        var icon = L.divIcon({
                            html: '<img src="' + url + '" width="64" height="64"/>',
                            popupAnchor: [0, -32],
                            iconAnchor: [32, 32]
                        });

                        icon._image = image;
                    }

                    icon._markerId = id;

                    return icon;
                }

                /**
                 * delete marker
                 * @param id
                 */
                function deleteMarker(id) {
                    var marker = $scope.markers[id];
                    if (!marker) {
                        return false;
                    }

                    var image = getImageOfMarkerData(marker),
                        index = usedImages.indexOf(image);

                    if (index >= 0) {
                        usedImages.splice(index, 1);
                    }

                    DeletedPlacesService.addToDeleted(marker);

                    $scope.numOfMarkers--;
                    delete $scope.markers[id];
                    delete $scope.markersByLocation[marker.location];
                    delete $scope.overpopulatedMarkers[id];
                    return true;
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
                    var bounds = $scope.bounds;
                    return point.lat < bounds.southWest.lat ||
                        bounds.northEast.lat < point.lat ||
                        point.lng < bounds.southWest.lng ||
                        bounds.northEast.lng < point.lng;
                }

                var lazyFetchVenuesFromFourSquare = buildLazy(fetchVenuesFromFourSquare, 2 * 1000),
                    lazyFetchInstagramImages = buildLazy(fetchInstagramImages, 1000);

                function updateBounds(sw, ne) {
                    var maxWidth = 2,
                        maxHeight = 2;

                    LocationStateService.bounds = {
                        sw: sw,
                        ne: ne
                    };

                    //localVenues = null;

                    _(DeletedPlacesService.fetchVenuesFromDeleted(sw, ne))
                        .shuffle()
                        .first(MAX_NUM_OF_VISIBLE_MARKERS - $scope.numOfMarkers)
                        .forEach(addMarker);

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
                        if ($scope.numOfMarkers < MAX_NUM_OF_VISIBLE_MARKERS) {
//                            lazyFetchVenuesFromFourSquare();
                            lazyFetchInstagramImages();
                        } else {
//                            $log.log('Reach MAX_NUM_OF_VISIBLE_MARKERS limit');
                        }
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
                    return markerData && markerData.icon && markerData.icon._image && markerData.icon._image.src;
                }

                function iconCreateFunction(cluster) {
                    var children = cluster.getAllChildMarkers(),
                        marker = _(children)
                            .map(function (icon) {
                                return icon && icon.options && icon.options.icon && icon.options.icon.options && $scope.markers[icon.options.icon.options._markerId];
                            })
                            .filter(function (url) {
                                return !!url;
                            })
                            .first();

                    var childCount = cluster.getChildCount();

                    var c = ' photo-marker-cluster-';
                    if (childCount < 2) {
                        c += 'tiny';
                    } else if (childCount < 10) {
                        c += 'small';
                    } else if (childCount < 50) {
                        c += 'medium';
                    } else {
                        c += 'large';
                    }

                    _(children)
                        .shuffle()
                        .map(function(icon) {
                            return $scope.markers[icon.options.icon.options._markerId];
                        })
                        .filter(function(marker) {
                            return marker && !marker.overpopulated;
                        })
                        .rest(OVERPOPULATION_LIMIT)
                        .forEach(addMarkerToOverpopulationList);

                    if (marker && marker._image && marker._image.src) {
                        return new L.divIcon({
                            html: '<div>' +
                                    '<img src="' + marker._image.src + '" width="64" height="64"/>' +
                                    (childCount>1?('<span class="photos-counter">' + childCount + '</span>'):'') +
                                  '</div>',
                            _markerId: marker.id,
                            _image: marker._image,
                            className: 'photo-marker-cluster' + c,
                            iconSize: new L.Point(40, 40)
                        });
                    } else {
                        return new L.Icon.Default();
                    }
                }
            }]);
});