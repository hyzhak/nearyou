define([
    'angular',
    'text!./lookup.html',
    'text!./template.html',

    'angular-sanitize'
], function (angular, lookupTemplate, template) {
    'use strict';

    var geocoding = angular.module('geocoding', [
        'ngSanitize'
    ]);

    geocoding.constant('GEOCODING_API_URL', 'http://maps.googleapis.com/maps/api/geocode/json');
    geocoding.constant('DEFAULT_LAT', 42.43);
    geocoding.constant('DEFAULT_LONG', 18.7);
    geocoding.constant('DEFAULT_ZOOM', 8);

    geocoding.service('GoogleMapIntegrationService', ['$q', function($q) {
        var isLoaded = false,
            loaderDefer;

        function loadScript(callbackName) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' +
                'callback=' + callbackName;

            document.body.appendChild(script);
        }

        /**
         * load google map js and resolve promise when map is loaded
         *
         * @returns {Promise}
         */
        this.loadGoogleMap = function() {
            if (isLoaded) {
                return $q.when();
            } else {
                if (loaderDefer) {
                    return loaderDefer.promise;
                }

                var name = 'onGoogleMapLoaded' + Math.floor(10000 * Math.random());

                loaderDefer = $q.defer();

                window[name] = function() {
                    loaderDefer.resolve();
                    loaderDefer = null;
                    isLoaded = true;
                    delete window[name];
                };

                loadScript(name);

                return loaderDefer.promise;
            }
        };

        this.buildLatLng = function(point) {
            if (arguments.length == 1) {
                return new google.maps.LatLng(point.lat, point.lng);
            } else {
                return new google.maps.LatLng(arguments[0], arguments[1]);
            }
        };

        this.buildBounds = function(bounds) {
            return new google.maps.LatLngBounds(
                this.buildLatLng(bounds.southwest),
                this.buildLatLng(bounds.northeast)
            );
        };
    }]);

    /**
     * Service for request Geocoding
     *
     * https://developers.google.com/maps/documentation/geocoding/
     */
    geocoding.service('GeocodeService', ['$http', '$q', 'GEOCODING_API_URL', function ($http, $q, GEOCODING_API_URL) {
        return {
            /**
             * Request address in geocoding format by coordinates
             *
             * @param latitude
             * @param longitude
             * @param locale
             * @returns {Promise}
             */
            getAddress: function (latitude, longitude, locale) {
                return $http.get(GEOCODING_API_URL + '?sensor=false&latlng=' + latitude + ',' + longitude + (locale ? ('&language=' + locale) : '')).then(function (value) {
                    var defer = $q.defer();
                    if (value.data.results && value.data.results.length > 0) {
                        defer.resolve(value.data.results[0].formatted_address);
                    } else {
                        defer.reject(value.data.error_message);
                    }
                    return defer.promise;
                });
            },

            /**
             * Request location by address
             *
             * @param address
             * @returns {Promise}
             */
            getCoords: function (address) {
                return $http.get(GEOCODING_API_URL + '?sensor=false&address=' + address).then(function (value) {
                    var defer = $q.defer();
                    if (value.data.results && value.data.results.length > 0) {
                        defer.resolve(value.data.results[0].geometry);
                    } else {
                        defer.reject('error');
                    }
                    return defer.promise;
                });
            },

            /**
             * Request geocoding by coordinates
             *
             * @param latitude
             * @param longitude
             * @param locale
             * @returns {Promise}
             */
            getGeocodeByCoords: function(latitude, longitude, locale) {
                return $http.get(GEOCODING_API_URL, {
                    params: {
                        language: locale,
                        latlng: latitude + ',' + longitude,
                        sensor: false
                    }
                }).then(function (value) {
                    var defer = $q.defer();
                    if (value.data.results && value.data.results.length > 0) {
                        defer.resolve(value.data.results[0]);
                    } else {
                        defer.reject(value.data.error_message);
                    }
                    return defer.promise;
                });
            },

            /**
             * Request possible addresses which match to adddress
             *
             * @param address
             * @param (language) - locale
             */
            getAddresses: function(address, language) {
                return $http.get(GEOCODING_API_URL, {
                        params: {
                            address: address,
                            language: language,
                            sensor: false
                        }
                    }
                ).then(function(response) {
                        return response && response.data && response.data.results;
                    });
            }
        }
    }]);

    /**
     * use https://github.com/angular-ui/ui-select/
     */
    geocoding.controller('GeocodeLookupCtrl', ['$scope', 'GeocodeService', function($scope, GeocodeService) {
        $scope.refreshAddresses = function(address) {
            GeocodeService.getAddresses(address, $scope.locale)
                .then(function(value) {
                    $scope.addresses = value;
                });
        };
    }]);

    geocoding.directive('geocodeLookup', function() {
        return {
            scope: {
                locale: '=',
                selected: '='
            },
            template: lookupTemplate,
            controller: 'GeocodeLookupCtrl'
        }
    });

    geocoding.controller('OneMarkerMapCtrl', ['DEFAULT_LAT', 'DEFAULT_LONG', 'DEFAULT_ZOOM', '$scope', '$timeout', 'GeocodeService', 'GoogleMapIntegrationService', function(DEFAULT_LAT, DEFAULT_LONG, DEFAULT_ZOOM, $scope, $timeout, GeocodeService, GoogleMapIntegrationService) {
        GoogleMapIntegrationService.loadGoogleMap().then(function() {
            $scope.initMap();
        });

        $scope.$watch('geocode', function(newValue, oldValue) {
            if ($scope.isMarkerUpdated || angular.equals(newValue, oldValue)) {
                return;
            }
            $scope.updateMarker();
        });

        $scope.updateMarker = function() {
            if (!$scope.geocode || !$scope.geocode.geometry || !$scope.geocode.geometry.location) {
                return;
            }

            var loc = $scope.geocode.geometry.location;

            $scope.marker.setPosition(GoogleMapIntegrationService.buildLatLng(loc.lat, loc.lng));
//                    scope.map.panTo(scope.marker.getPosition());
            $scope.map.fitBounds(GoogleMapIntegrationService.buildBounds($scope.geocode.geometry.viewport));
        };

        $scope.initMap = function() {
            var defaultLocation = new google.maps.LatLng(
                $scope.latitude ? $scope.latitude : DEFAULT_LAT,
                $scope.longitude ? $scope.longitude : DEFAULT_LONG
            );

            var mapOptions = {
                center: defaultLocation,
                zoom: Number($scope.zoom) || DEFAULT_ZOOM,
                mapTypeId: google.maps.MapTypeId['ROADMAP']
            };

            $scope.map = new google.maps.Map($scope.element[0], mapOptions);

            $scope.marker = new google.maps.Marker({
                position: defaultLocation,
                map: $scope.map,
                draggable: true
            });

            $scope.updateMarker();

            google.maps.event.addListener($scope.marker, 'dragend', function (event) {
                GeocodeService.getGeocodeByCoords(event.latLng.k, event.latLng.B, $scope.locale)
                    .then(function (value) {
                        $scope.isMarkerUpdated = true;
                        $scope.geocode = value;
                        $timeout(function() {
                            $scope.isMarkerUpdated = false;
                        });
                    });
            });
        }
    }]);

    geocoding.directive('oneMarkerMap', function() {
        return {
            scope: {
                geocode: '=',
                locale: '='
            },
            template: '<div ng-style="googleMapStyle"></div>',
            link: function(scope, element, attrs) {
                scope.element = element;
            },
            controller: 'OneMarkerMapCtrl'
        }
    });


    /**
     * Inject Google Map
     *
     * https://developers.google.com/maps/documentation/javascript/reference
     */
    /*geocoding.directive('geocoding', ['$timeout', 'DEFAULT_LAT', 'DEFAULT_LONG', 'GeocodeService', function ($timeout, DEFAULT_LAT, DEFAULT_LONG, GeocodeService) {
        return {
            scope: {
                address: '=',
                latitude: '=',
                longitude: '=',
                zoom: '@',
                mapHeight: '@',
                locale: '@'
            },
            template: template,
            controller: ['$scope', function ($scope) {
                $scope.innerAddress = '';
                var map,
                    marker,
                    bindAddressOnCoords = true,
                    isMarkerUpdated = false;

                $scope.userChangeAddress = function () {
                    bindAddressOnCoords = false;
                    if ($scope.address && $scope.address.length > 0) {
                        lazyCoordsUpdate();
                    }
                };

                $scope.$watch('address', function (value) {
                    //changes from outside
                    if ($scope.innderAddress !== value) {
                        if (angular.isDefined(value) && value.length !== 0) {
                            bindAddressOnCoords = false;
                        }
                        $scope.innerAddress = value;
                    }
                });

                $scope.$watch('innerAddress', function (value) {
                    $scope.address = value;
                });

                $scope.$watch('latitude', function (value) {
                    if (bindAddressOnCoords && angular.isDefined(value)) {
                        lazyAddressUpdate();
                    }

                    tryToUpdateMarker();
                });

                $scope.$watch('longitude', function (value) {
                    if (bindAddressOnCoords && angular.isDefined(value)) {
                        lazyAddressUpdate();
                    }

                    tryToUpdateMarker();
                });

                $scope.mapHeight = $scope.mapHeight || '200px';
                $scope.googleMapStyle = {
                    height: $scope.mapHeight
                };

                function tryToUpdateMarker() {
                    if (!isMarkerUpdated && angular.isDefined($scope.latitude) && angular.isDefined($scope.longitude)) {
                        updateMarker();
                        map.panTo(marker.getPosition());
                    }
                }

                function updateMarker() {
                    isMarkerUpdated = true;
                    marker.setPosition(buildLatLng($scope.latitude, $scope.longitude));
                }

                function buildLazyRequest(handle, delay) {
                    delay = delay || 1000;
                    return (function () {
                        var previousRequest;

                        return function lazyRefresh() {
                            if (previousRequest) {
                                $timeout.cancel(previousRequest);
                            }

                            previousRequest = $timeout(function () {
                                previousRequest = null;
                                handle()
                            }, delay);
                        }
                    })();
                }

                var lazyCoordsUpdate = buildLazyRequest(function () {
                    GeocodeService.getCoords($scope.address).then(function (value) {
                        $scope.latitude = value.location.lat;
                        $scope.longitude = value.location.lng;
                        updateMarker();
                        map.fitBounds(buildBounds(value.viewport));
                    });
                });

                function buildBounds(bounds) {
                    return new google.maps.LatLngBounds(
                        buildLatLng(bounds.southwest),
                        buildLatLng(bounds.northeast)
                    )
                }

                function buildLatLng(point) {
                    if (arguments.length == 1) {
                        return new google.maps.LatLng(point.lat, point.lng);
                    } else {
                        return new google.maps.LatLng(arguments[0], arguments[1]);
                    }
                }

                var lazyAddressUpdate = buildLazyRequest(function () {
                    GeocodeService.getAddress($scope.latitude, $scope.longitude, $scope.locale).then(function (value) {
                        $scope.innerAddress = value;
                    });
                });

                function initMap() {
                    var map_canvas = document.getElementById('map_canvas'),
                        defaultLocation = new google.maps.LatLng(
                            $scope.latitude ? $scope.latitude : DEFAULT_LAT,
                            $scope.longitude ? $scope.longitude : DEFAULT_LONG);

                    var map_options = {
                        center: defaultLocation,
                        zoom: Number($scope.zoom) || 8,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    map = new google.maps.Map(map_canvas, map_options);

                    marker = new google.maps.Marker({
                        position: defaultLocation,
                        map: map,
                        draggable: true
                    });

                    google.maps.event.addListener(marker, 'dragend', function (event) {
                        isMarkerUpdated = true;
                        $scope.$apply(function () {
                            $scope.latitude = event.latLng.k;
                            $scope.longitude = event.latLng.B;
                        });
                    });
                }

                $timeout(initMap, 1000);
            }]
        }
    }]);*/
});