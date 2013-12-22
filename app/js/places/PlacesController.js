define([
    'leaflet-markerclusterer',
    'css!lib/leaflet-dist/leaflet.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.css',
    'css!lib/leaflet.markerclusterer/dist/MarkerCluster.Default.css'
], function(LeafletMarkerCluster) {
    'use strict';

    var ctrl = function(FOUR_SQUARE_CLIENT,
                        FourSquareVenues,
                        FourSquareSearch,
                        INSTAGRAM_CLIENT_ID,
                        GoogleAnalytics,
                        GoogleGeoCoding,
                        ImagesService,
                        LocationStateService,
                        Locations,
                        $rootScope,
                        $scope,
                        $timeout) {

        var usedImages = [],
            deletedMarkers = [];

        LocationStateService.bounds = {};

        console.log('LeafletMarkerCluster' + LeafletMarkerCluster);

        $scope.autoUpdate = true;
        $scope.center = {
            lat: LocationStateService.lat,
            lng: LocationStateService.lng,
            zoom: 14
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
                        visible: true
                        ,layerOptions: {
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

        $scope.selected = null;

        $scope.focusOn = function(place) {
            var marker = $scope.markers[place.id];
            if(!marker || !beforeFocusOnMarker(marker)) {
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
            $scope.paths[currentSelectedMarker.id] = {
                weight: 2,
                color: '#ff612f',
                latlngs: marker,
                radius: LocationStateService.distance,
                type: 'circle'
            };
        }

        $scope.events = {
            zoomend: function(e) {
                updateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
                trackCenterToGoogleAnalytics();
                if ($scope.autoUpdate) {
                    hideInvisibleMarkers();
                }
            },
            dragend: function(e) {
                updateBounds(e.target.getBounds().getSouthWest(), e.target.getBounds().getNorthEast());
                trackCenterToGoogleAnalytics();
                if ($scope.autoUpdate) {
                    hideInvisibleMarkers();
                }
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

        $scope.$on('leafletDirectiveMarkersClick', function(e, id) {
            var marker = $scope.markers[id];
            //$rootScope.$broadcast('selectMarkerOnMap', id);
            $rootScope.$broadcast('scroll-to-place-' + id);
            beforeFocusOnMarker(marker);
            afterFocusOnMarker(marker);
            focusOn(marker);
        });

        $scope.search = function(text) {
            GoogleAnalytics.trackEvent('search start', text);

            GoogleGeoCoding.get({
                address: text
            }).$promise.then(function(data) {
                $scope.autoUpdate = false;

                var zoomOnGeoCoding = zoomToGeoCoding(data.results);

                data.results.forEach(function(item) {
                    addVenueFromGoogleGeoCoding(item);
                });

                var centerLat = ($scope.bounds.southWest.lat + $scope.bounds.northEast.lat)/ 2,
                    centerLng = ($scope.bounds.southWest.lng + $scope.bounds.northEast.lng)/2;

                FourSquareSearch.get({
                    query: text,
                    ll: centerLat + ',' + centerLng,
                    apiVersion: FOUR_SQUARE_CLIENT.currentAPIDate,
                    clientId: FOUR_SQUARE_CLIENT.CLIENT_ID,
                    clientSecret: FOUR_SQUARE_CLIENT.CLIENT_SECRET
                }).$promise.then(function(data) {
                    //updateGeneration();
                    removeAllMarkers();
                    GoogleAnalytics.trackEvent('search end', text, Number(data.response.totalResults));
                    if (data.response.warning && data.response.warning.text) {
                        GoogleAnalytics.trackEvent('search warning', data.response.warning.text, Number(data.response.totalResults));
                    }
                    var result;
                    data.response.groups.forEach(function(group) {
                        group.items.forEach(function(item) {
                            result = addVenueFromFourSquare(item.venue);
                        });
                    });
                    if (!zoomOnGeoCoding) {
                        zoomToMarkers($scope.markers);
                    }
                });
            });
        };

        $scope.$watch('autoUpdate', function(newValue) {
            if (newValue) {
                fetchVenuesFromFourSquare();
            }
        });

        fetchVenuesFromInstagram();
        trackCenterToGoogleAnalytics();

        /**
         * increase life of each marker
         *
         * @private
         */
        function updateGeneration() {
            var ids = Object.keys($scope.markers);
            ids.forEach(function(id) {
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

            ids.forEach(function(id) {
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
         * @returns {{id: *, lat: *, lng: *, message: (*|Function|name|oldmodule.name|name|oldmodule.name|name|person.name|employee.name|application.name|d.name|e.name|d.name|e.name|window.A.name|B.name|C.name|e.nested.e.name|name|name|name|app|test.name|app|test2.name|str.user.name|.meta.name|body.name|string|name|string|c1.name|c1|sub.name|c.name|c|sub.name|c2.name|c2|sub.name|c1.name|c1|sub.name|c.name|c|sub.name|c2.name|c2|sub.name|FirefoxBrowser.name|.shim.e.init.name|.shim.f.init.name|name|string|subwidget.name|plug|c1.name|plug|main.name|plug|c2.name|plug|c1.name|plug|main.name|plug|c2.name|name|c1.name|c1|sub.name|another|minor.name|another|c.name|another|c|dim.name|another|c|sub.name|c2.name|c1.name|c1|sub.name|another|minor.name|another|c.name|another|c|dim.name|another|c|sub.name|c2.name|.requirejs.compile.options.name|.requirejs.template.options.name|.requirejs.onOptimize.options.name|OperaBrowser.name|name|spec.name|a.name|c.name|b.name|prime|a.name|prime|c.name|prime|b.name|name|.test_vars.name|string|$RouteProvider.when.name|name|name|string|tasks.name|tasks.name|window.A.name|B.name|C.name|e.nested.e.name|fn.name|FCAP.name|.shim.e.init.name|.shim.f.init.name|body.name|name|.error.name|str_identities.obj.user.name|name|name|createHAR.log.creator.name|string|name|name|.Scope.variables.name|name|.Scope.variables.name|name|encodingFamilies.convert.name|name|string|createHAR.log.creator.name|buildRule.name|buildRule.name|string|encodings.name|name|encodings.name|.user.name|.existing.fcbaebfecc.name|name|name|string|Browser.serialize.name|name|encodings.name|name|name|*|name|string|name|name|name|string|name|name|curly.name|moe.name|name|name|name|name|name|curly.name|moe.name|name|name|name|subwidget.name|string|string|string|h.name|name|name|root.name|name|name|.done.name|string|string|name|one.name|two.name|*|name|name|name|name|name|.film.name|name|.film.name|name|name|name|String|Null|name|.DOMAttrs.name|name|.DOMAttrs.name|.c.name|.d.name|string|string|string|name|string|string|name|string|name|Function|Function|Function|Function|Function|name|test.name|.DOMAttrs.name|angular.mock.TzDate.name|root.name|name|$RouteProvider.when.name|angular.mock.TzDate.name|angular.mock.TzDate.name|name|.serializeArray.name|name|.Operation.eval.name|angular.mock.TzDate.name|.DOMAttrs.name|window.angular.mock.TzDate.name|name|name|string|string|string|string|string|string|string|string|string|string|string|string|string|string|name|name|newContext.makeModuleMap.name|name|newContext.makeModuleMap.name|name|.serializeArray.name|Function|Function|Function|Function|Function|name|name|.serializeArray.name|name|name|name|name|string|string|string|string|string|$rootScope.layers.baselayers.osm.name|$rootScope.layers.baselayers.cycle.name|$rootScope.layers.baselayers.osmwms.name|$rootScope.layers.baselayers.osm2.name|$rootScope.layers.baselayers.osm3.name|$rootScope.layers.baselayers.osm4.name|$rootScope.layers.baselayers.osm5.name|$rootScope.layers.baselayers.osm6.name|$rootScope.layers.baselayers.cloudmade1.name|$rootScope.layers.overlays.hillshade.name|$rootScope.layers.overlays.fire.name|$rootScope.layers.overlays.cars.name|$rootScope.layers.overlays.trucks.name|.baselayers.osm.name|.overlays.cars.name|.overlays.trucks.name|name|String|String|Null|String|o.Control.Layers._addLayer.name|parseObjectPropertyKey.name|parsePrimaryExpression.name|parseNonComputedProperty.name|parseVariableIdentifier.name|o.Control.Layers._addLayer.name|name|Function|JSHINT.quit.name|name|jQuery.serializeArray.name|jQuery.serializeArray.name|name|jQuery.serializeArray.name|name|jQuery.serializeArray.name|i.Control.Layers._addLayer.name|w.name|name|*|name|*|name|*|name|testFixture.expression.left.name|testFixture.expression.right.key.name|testFixture.expression.right.value.body.argument.name|testFixture.expression.right.value.name|testFixture.expression.right.value.body.expression.left.name|testFixture.expression.right.value.body.expression.right.name|testFixture.Comments.test.name|testFixture.Comments.consequent.expression.callee.name|testFixture.Comments.discriminant.name|testFixture.Comments.expression.callee.name|testFixture.id.name|testFixture.expression.callee.name|testFixture.expression.callee.callee.name|testFixture.expression.callee.object.callee.name|testFixture.expression.callee.property.name|testFixture.expression.callee.object.name|testFixture.expression.name|testFixture.expression.object.name|testFixture.expression.property.name|testFixture.expression.object.object.name|testFixture.expression.object.property.name|testFixture.expression.object.object.object.name|testFixture.expression.object.object.property.name|testFixture.expression.object.callee.name|testFixture.expression.object.callee.object.callee.name|testFixture.expression.object.callee.property.name|testFixture.expression.callee.object.object.object.name|testFixture.expression.callee.object.object.property.name|testFixture.expression.callee.object.property.name|testFixture.expression.argument.name|testFixture.expression.right.name|testFixture.expression.left.left.name|testFixture.expression.left.right.name|testFixture.expression.right.left.name|testFixture.expression.right.right.name|testFixture.expression.test.name|testFixture.expression.test.left.name|testFixture.expression.test.right.name|testFixture.Block.expression.name|testFixture.Block.expression.callee.name|testFixture.x.expression.name|testFixture.test.name|testFixture.consequent.expression.callee.name|testFixture.consequent.id.name|testFixture.alternate.expression.callee.name|testFixture.body.expression.callee.name|testFixture.body.expression.argument.name|testFixture.test.left.name|testFixture.init.left.name|testFixture.init.id.name|testFixture.update.argument.name|testFixture.body.expression.name|testFixture.left.name|testFixture.right.name|testFixture.left.id.name|testFixture.label.name|testFixture.body.body.label.name|testFixture.expression.body.argument.name|testFixture.expression.body.argument.left.name|testFixture.expression.body.argument.right.name|testFixture.object.name|testFixture.body.expression.left.name|testFixture.body.expression.right.name|testFixture.discriminant.name|testFixture.argument.name|testFixture.argument.left.name|testFixture.argument.right.name|testFixture.argument.key.name|testFixture.param.name|testFixture.finalizer.expression.callee.name|testFixture.finalizer.expression.name|testFixture.block.expression.callee.name|testFixture.name|testFixture.expression.id.name|testFixture.body.id.name|testFixture.init.body.expression.callee.name|testFixture.expression.body.expression.name|testFixture.API.result.expression.name|testFixture.expression.callee.body.object.name|testFixture.init.key.name|testFixture.init.value.name|testFixture.expression.key.name|testFixture.expression.left.callee.name|*|name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|jQuery.serializeArray.name|errorObj.name|name|newContext.makeModuleMap.name|name|loadLib.parseObjectPropertyKey.name|loadLib.parsePrimaryExpression.name|loadLib.parseNonComputedProperty.name|loadLib.parseVariableIdentifier.name|Function|*|Function|Function|Function|Function|Function|SourceMapConsumer.originalPositionFor.name|SourceMapConsumer.eachMapping.name|AST_ForIn.$propdoc.name|AST_Lambda.$propdoc.name|AST_VarDef.$propdoc.name|AST_Symbol.$propdoc.name|sym.name|ref.name|config.modules.name|.onCompleteData.name|name|name|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|two.name|one.name|exports.name|string|string|string|string|string|name|string|string|HiredisReplyParser.name|Mark.name|string|ScriptBrowser.name|string|name|TRBL.name|packet.name|SocketNamespace.name|Flag.name|Browser.name|packet.name|string|string|string|string|SocketNamespace.name|string|FileException.name|Task._tasks.name|string|RedisReplyParser.name|.XMLFragment.name|name|name|$2.name|$2.name|Test.name|Test.name|Command.name|name|name|string|string|Test.name|Test.name|TRBL.name|name|name|name|ZipObject.name|NodeWithToken.name|name|Test.name|Dog.name|.Access.name|Class.ctor.name|Assign.value.name|.Param.name|.Splat.name|.For.name|.Access.name|Class.ctor.name|Assign.value.name|.Param.name|.Splat.name|.For.name|x.expr.attrHandle.name|name|packet.name|SocketNamespace.name|Flag.name|string|$$.name|$$.name|Benchmark.name|Suite.name|TRBL.name|sinon.throwsException.exception.name|string|name|jQuery.attrHooks.name|name|name|name|name|name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|errorObject.name|loadLib.NodeWithToken.name|name|newMapping.name|loadLib.SourceNode.name|loadLib.SymbolDef.name|args.value.name), title: (*|Function|name|oldmodule.name|name|oldmodule.name|name|person.name|employee.name|application.name|d.name|e.name|d.name|e.name|window.A.name|B.name|C.name|e.nested.e.name|name|name|name|app|test.name|app|test2.name|str.user.name|.meta.name|body.name|string|name|string|c1.name|c1|sub.name|c.name|c|sub.name|c2.name|c2|sub.name|c1.name|c1|sub.name|c.name|c|sub.name|c2.name|c2|sub.name|FirefoxBrowser.name|.shim.e.init.name|.shim.f.init.name|name|string|subwidget.name|plug|c1.name|plug|main.name|plug|c2.name|plug|c1.name|plug|main.name|plug|c2.name|name|c1.name|c1|sub.name|another|minor.name|another|c.name|another|c|dim.name|another|c|sub.name|c2.name|c1.name|c1|sub.name|another|minor.name|another|c.name|another|c|dim.name|another|c|sub.name|c2.name|.requirejs.compile.options.name|.requirejs.template.options.name|.requirejs.onOptimize.options.name|OperaBrowser.name|name|spec.name|a.name|c.name|b.name|prime|a.name|prime|c.name|prime|b.name|name|.test_vars.name|string|$RouteProvider.when.name|name|name|string|tasks.name|tasks.name|window.A.name|B.name|C.name|e.nested.e.name|fn.name|FCAP.name|.shim.e.init.name|.shim.f.init.name|body.name|name|.error.name|str_identities.obj.user.name|name|name|createHAR.log.creator.name|string|name|name|.Scope.variables.name|name|.Scope.variables.name|name|encodingFamilies.convert.name|name|string|createHAR.log.creator.name|buildRule.name|buildRule.name|string|encodings.name|name|encodings.name|.user.name|.existing.fcbaebfecc.name|name|name|string|Browser.serialize.name|name|encodings.name|name|name|*|name|string|name|name|name|string|name|name|curly.name|moe.name|name|name|name|name|name|curly.name|moe.name|name|name|name|subwidget.name|string|string|string|h.name|name|name|root.name|name|name|.done.name|string|string|name|one.name|two.name|*|name|name|name|name|name|.film.name|name|.film.name|name|name|name|String|Null|name|.DOMAttrs.name|name|.DOMAttrs.name|.c.name|.d.name|string|string|string|name|string|string|name|string|name|Function|Function|Function|Function|Function|name|test.name|.DOMAttrs.name|angular.mock.TzDate.name|root.name|name|$RouteProvider.when.name|angular.mock.TzDate.name|angular.mock.TzDate.name|name|.serializeArray.name|name|.Operation.eval.name|angular.mock.TzDate.name|.DOMAttrs.name|window.angular.mock.TzDate.name|name|name|string|string|string|string|string|string|string|string|string|string|string|string|string|string|name|name|newContext.makeModuleMap.name|name|newContext.makeModuleMap.name|name|.serializeArray.name|Function|Function|Function|Function|Function|name|name|.serializeArray.name|name|name|name|name|string|string|string|string|string|$rootScope.layers.baselayers.osm.name|$rootScope.layers.baselayers.cycle.name|$rootScope.layers.baselayers.osmwms.name|$rootScope.layers.baselayers.osm2.name|$rootScope.layers.baselayers.osm3.name|$rootScope.layers.baselayers.osm4.name|$rootScope.layers.baselayers.osm5.name|$rootScope.layers.baselayers.osm6.name|$rootScope.layers.baselayers.cloudmade1.name|$rootScope.layers.overlays.hillshade.name|$rootScope.layers.overlays.fire.name|$rootScope.layers.overlays.cars.name|$rootScope.layers.overlays.trucks.name|.baselayers.osm.name|.overlays.cars.name|.overlays.trucks.name|name|String|String|Null|String|o.Control.Layers._addLayer.name|parseObjectPropertyKey.name|parsePrimaryExpression.name|parseNonComputedProperty.name|parseVariableIdentifier.name|o.Control.Layers._addLayer.name|name|Function|JSHINT.quit.name|name|jQuery.serializeArray.name|jQuery.serializeArray.name|name|jQuery.serializeArray.name|name|jQuery.serializeArray.name|i.Control.Layers._addLayer.name|w.name|name|*|name|*|name|*|name|testFixture.expression.left.name|testFixture.expression.right.key.name|testFixture.expression.right.value.body.argument.name|testFixture.expression.right.value.name|testFixture.expression.right.value.body.expression.left.name|testFixture.expression.right.value.body.expression.right.name|testFixture.Comments.test.name|testFixture.Comments.consequent.expression.callee.name|testFixture.Comments.discriminant.name|testFixture.Comments.expression.callee.name|testFixture.id.name|testFixture.expression.callee.name|testFixture.expression.callee.callee.name|testFixture.expression.callee.object.callee.name|testFixture.expression.callee.property.name|testFixture.expression.callee.object.name|testFixture.expression.name|testFixture.expression.object.name|testFixture.expression.property.name|testFixture.expression.object.object.name|testFixture.expression.object.property.name|testFixture.expression.object.object.object.name|testFixture.expression.object.object.property.name|testFixture.expression.object.callee.name|testFixture.expression.object.callee.object.callee.name|testFixture.expression.object.callee.property.name|testFixture.expression.callee.object.object.object.name|testFixture.expression.callee.object.object.property.name|testFixture.expression.callee.object.property.name|testFixture.expression.argument.name|testFixture.expression.right.name|testFixture.expression.left.left.name|testFixture.expression.left.right.name|testFixture.expression.right.left.name|testFixture.expression.right.right.name|testFixture.expression.test.name|testFixture.expression.test.left.name|testFixture.expression.test.right.name|testFixture.Block.expression.name|testFixture.Block.expression.callee.name|testFixture.x.expression.name|testFixture.test.name|testFixture.consequent.expression.callee.name|testFixture.consequent.id.name|testFixture.alternate.expression.callee.name|testFixture.body.expression.callee.name|testFixture.body.expression.argument.name|testFixture.test.left.name|testFixture.init.left.name|testFixture.init.id.name|testFixture.update.argument.name|testFixture.body.expression.name|testFixture.left.name|testFixture.right.name|testFixture.left.id.name|testFixture.label.name|testFixture.body.body.label.name|testFixture.expression.body.argument.name|testFixture.expression.body.argument.left.name|testFixture.expression.body.argument.right.name|testFixture.object.name|testFixture.body.expression.left.name|testFixture.body.expression.right.name|testFixture.discriminant.name|testFixture.argument.name|testFixture.argument.left.name|testFixture.argument.right.name|testFixture.argument.key.name|testFixture.param.name|testFixture.finalizer.expression.callee.name|testFixture.finalizer.expression.name|testFixture.block.expression.callee.name|testFixture.name|testFixture.expression.id.name|testFixture.body.id.name|testFixture.init.body.expression.callee.name|testFixture.expression.body.expression.name|testFixture.API.result.expression.name|testFixture.expression.callee.body.object.name|testFixture.init.key.name|testFixture.init.value.name|testFixture.expression.key.name|testFixture.expression.left.callee.name|*|name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|name|jQuery.serializeArray.name|*|window.angular.scenario.ObjectModel.value.name|jQuery.serializeArray.name|errorObj.name|name|newContext.makeModuleMap.name|name|loadLib.parseObjectPropertyKey.name|loadLib.parsePrimaryExpression.name|loadLib.parseNonComputedProperty.name|loadLib.parseVariableIdentifier.name|Function|*|Function|Function|Function|Function|Function|SourceMapConsumer.originalPositionFor.name|SourceMapConsumer.eachMapping.name|AST_ForIn.$propdoc.name|AST_Lambda.$propdoc.name|AST_VarDef.$propdoc.name|AST_Symbol.$propdoc.name|sym.name|ref.name|config.modules.name|.onCompleteData.name|name|name|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|string|two.name|one.name|exports.name|string|string|string|string|string|name|string|string|HiredisReplyParser.name|Mark.name|string|ScriptBrowser.name|string|name|TRBL.name|packet.name|SocketNamespace.name|Flag.name|Browser.name|packet.name|string|string|string|string|SocketNamespace.name|string|FileException.name|Task._tasks.name|string|RedisReplyParser.name|.XMLFragment.name|name|name|$2.name|$2.name|Test.name|Test.name|Command.name|name|name|string|string|Test.name|Test.name|TRBL.name|name|name|name|ZipObject.name|NodeWithToken.name|name|Test.name|Dog.name|.Access.name|Class.ctor.name|Assign.value.name|.Param.name|.Splat.name|.For.name|.Access.name|Class.ctor.name|Assign.value.name|.Param.name|.Splat.name|.For.name|x.expr.attrHandle.name|name|packet.name|SocketNamespace.name|Flag.name|string|$$.name|$$.name|Benchmark.name|Suite.name|TRBL.name|sinon.throwsException.exception.name|string|name|jQuery.attrHooks.name|name|name|name|name|name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|name|window.angular.scenario.Describe.name|window.angular.scenario.Future.name|window.angular.scenario.ObjectModel.Spec.name|window.angular.scenario.ObjectModel.Step.name|errorObject.name|loadLib.NodeWithToken.name|name|newMapping.name|loadLib.SourceNode.name|loadLib.SymbolDef.name|args.value.name)}}
         */
        function addVenueFromFourSquare(venue) {
            if ($scope.markers[venue.id]) {
                return $scope.markers[venue.id];
            }

            var marker = $scope.markers[venue.id] = {
                //icon: icon,
                id: venue.id,
                lat: venue.location.lat,
                lng: venue.location.lng,
                layer: 'images',
                message: venue.name,
                title: venue.name,
                life: 0,
                favorites: false
            };
            setupIconForMarker(marker);
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
                message: item.address_components[0].long_name,
                title: item.address_components[0].long_name,
                life: 0,
                favorites: false
            };
            setupIconForMarker(marker);
            return marker;
        }

        function generateID() {
            return Date.now() + '-' + String(Math.random()).substr(2, 100);
        }

        /**
         * @private
         */
        function trackCenterToGoogleAnalytics() {
            GoogleAnalytics.trackPage('places [' + $scope.center.lat + ', ' + $scope.center.lng + '],' +
                'zoom : ' + $scope.center.zoom);
        }

        var lazy = (function(){
            var timeoutId;

            return function(callback, interval) {
                if (timeoutId) {
                    $timeout.cancel(timeoutId);
                }

                timeoutId = $timeout(function() {
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
            FourSquareVenues.get({
                sw: bounds.sw.lat + ', ' + bounds.sw.lng,
                ne: bounds.ne.lat + ', ' + bounds.ne.lng,
                //categories: catetories.join(','),
                apiVersion: FOUR_SQUARE_CLIENT.currentAPIDate,
                clientId: FOUR_SQUARE_CLIENT.CLIENT_ID,
                clientSecret: FOUR_SQUARE_CLIENT.CLIENT_SECRET
            }).$promise.then(function(data) {
                if (data.response.venues) {
                    updateGeneration();
                    data.response.venues.forEach(function(venue) {
                        addVenueFromFourSquare(venue);
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
         * @private
         * get venues from deleted and add them back to visible
         */
        function fetchVenuesFromDeleted(sw, ne) {
            for(var i = deletedMarkers.length - 1; i >= 0; i--) {
                var marker = deletedMarkers[i];
                if (isMarkerInBounds(marker, sw, ne)) {
                    deletedMarkers.splice(i, 1);
                    $scope.markers[marker.id] = marker;
                }
            }
        }

        function isMarkerInBounds(marker, sw, ne) {
            return sw.lat <= marker.lat && marker.lat <= ne.lat &&
                   sw.lng <= marker.lng && marker.lng <= ne.lng;
        }


        /**
         * setup icon image for marker
         * @param marker
         */
        function setupIconForMarker(marker) {
            var image = getImageByCoords(marker.lat, marker.lng);
            if (image) {
                marker.icon = buildImageIcon(image.url);
                marker.icon._image = image
            }
        }

        /**
         * build icon
         *
         * @param lat
         * @param lng
         * @returns {*}
         */
        function buildImageIcon(imageUrl) {
            return L.divIcon({
                html: '<img src="' + imageUrl +'" width="64" height="64"/>',
                iconSize: [0, 0],
                popupAnchor:  [0, -32],
                iconAnchor: [32, 32]
            });
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

            deletedMarkers.push(marker);

            delete $scope.markers[id];
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

            ids.forEach(function(id) {
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

            fetchVenuesFromDeleted(sw, ne);
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
            return marker && marker.options && marker.options.icon && marker.options.icon._image;
        }

        function iconCreateFunction(cluster) {
            var children = cluster.getAllChildMarkers(),
                image;

            children.some(function(marker) {
                image = getImageOfMarker(marker);
                return !!image && image.url;
            });

            var childCount = cluster.getChildCount();

            var c = ' marker-cluster-';
            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }

            var imageSrc = image?('<img src="' + image.url +'" width="64" height="64"/>'):'';

            var markersWithIcons = [];
            Object.keys($scope.markers).forEach(function(id) {
                var marker = $scope.markers[id];
                if (marker && marker.icon) {
                    markersWithIcons.push(marker);
                }
            });

            return new L.DivIcon({
                html: '<div>' + imageSrc + '<span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(40, 40)
            });
        }
    };

    ctrl.$inject = [
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
        '$timeout'
    ];

    return ctrl;
});