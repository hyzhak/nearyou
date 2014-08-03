define([
    'angular',
    'angular-resource',
    'angular-animate',
    'angular-ui-router',
    'leaflet-directive',
    'app/controllers',
    'app/directives',
    'app/factories',
    'app/google/trackRequestToGoogleAnalytics',
    'app/services',

    'app/routes'
], function(angular,
            resource,
            animate,
            router,
            leafletDirective,
            controllers,
            directives,
            factories,
            trackRequestToGoogleAnalytics,
            services) {
    'use strict';

    // Declare app level module which depends on filters, and services
    var app = angular.module('myApp', [
        'ngResource',
        'ngAnimate',
        'leaflet-directive',
        'ui.router',

        'NY.routes'
    ]);

    app.config([
        '$locationProvider',
        '$httpProvider',
    function($locationProvider,
             $httpProvider) {
        /**
         * track API request to the Google Analytics
         */
        $httpProvider.responseInterceptors.push(['GoogleAnalytics', '$q', function(GoogleAnalytics, $q) {
            return function(promise) {
                return promise.then(function(response) {
                    var config = mapToTargetUrls(response.config.url);
                    trackSuccessRequest(config.targetUrl, config.success);
                    return response;
                }, function(response) {
                    var config = mapToTargetUrls(response.config.url);
                    trackFailedRequest(config.targetUrl, config.success, response.config.status);
                    return $q.reject(response);
                });
            };

            function mapToTargetUrls(testUrl) {
                var targets = ['get-current-position.appspot.com', 'api.instagram.com', 'api.foursquare.com'],
                    foundUrl;

                targets.some(function(targetUrl) {
                    foundUrl = targetUrl;
                    return buildUrlVerified(targetUrl)(testUrl);
                });

                if (foundUrl) {
                    return {
                        success: true,
                        targetUrl: foundUrl,
                        testUrl: testUrl
                    }
                } else {
                    return {
                        success: false,
                        targetUrl: testUrl,
                        testUrl: testUrl
                    }
                }
            }

            function trackSuccessRequest(url, known) {
                GoogleAnalytics.trackEvent('success-api-request', JSON.stringify({url : url, known: known}));
            }

            function trackFailedRequest(url, known, status) {
                GoogleAnalytics.trackEvent('failed-api-request', JSON.stringify({
                    url : url,
                    known: known,
                    status: status
                }));
            }
        }]);


        function buildUrlVerified(url) {
            return function(testUrl) {
                return new RegExp('(.*)' + url + '(.*)', 'g').test(testUrl);
            }
        }
    }]);

    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    app.constant('INSTAGRAM_CLIENT_ID', '39a6f9437c464ef684d543880969764d');
    app.constant('GOOGLE_ANALYTICS_ID', 'UA-38043860-1');
    app.constant('FOUR_SQUARE_CLIENT', {
        currentAPIDate: dateToYMD(new Date()),
        CLIENT_ID: 'XCYPKEY52MVDGHLNRZH2D3BFTIIPG3QCJRC5XFZ1CN5UELGH',
        CLIENT_SECRET: 'UJDAHTDQNW1JHPXWVXD2KZQJHIQTF2XBDSH25ZJTLFUHAY3E'
    });

    app.controller(controllers);
    app.directive(directives);
    app.factory(factories);
    app.service(services);

    app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);

    app.service('SearchState', function(){
        'use strict';
        var state = "";
        return {
            getState : function(){
                return state;
            },
            setState: function(value){
                console.log('set State of SearchState');
                state = value;
            }
        }
    });

    trackRequestToGoogleAnalytics.trackUrls([
        'get-current-position.appspot.com',
        'api.instagram.com',
        'api.foursquare.com']);

    function dateToYMD(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + (m<=9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }
});
