/**
 * track API request to the Google Analytics
 */
define(['angular'], function(angular) {
    'use strict';
    return {
        /**
         * track api urls
         * @param urls
         */
        trackUrls: function(urls) {
            angular.module('myApp').config(['$httpProvider', function($httpProvider) {
                $httpProvider.responseInterceptors.push(['GoogleAnalytics', '$q', function(GoogleAnalytics, $q) {
                    return function(promise) {
                        return promise.then(function(response) {
                            var config = mapToTargetUrls(urls, response.config.url);
                            trackSuccessRequest({
                                url : config.targetUrl,
                                known: config.success
                            });
                            return response;
                        }, function(response) {
                            var config = mapToTargetUrls(urls, response.config.url);
                            trackFailedRequest({
                                url : config.targetUrl,
                                known: config.success,
                                status: response.config.status
                            });
                            return $q.reject(response);
                        });
                    };

                    function trackSuccessRequest(env) {
                        GoogleAnalytics.trackEvent('success-api-request', JSON.stringify(env));
                    }

                    function trackFailedRequest(env) {
                        GoogleAnalytics.trackEvent('failed-api-request', JSON.stringify(env));
                    }
                }]);
            }]);
        }
    };

    /**
     * @private
     *
     * @param testUrl
     * @returns {{success: boolean, targetUrl: *, testUrl: *}}
     */
    function mapToTargetUrls(targets, testUrl) {
        var foundUrl;

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

    /**
     * @private
     * @param url
     * @returns {Function}
     */
    function buildUrlVerified(url) {
        return function(testUrl) {
            return new RegExp('(.*)' + url + '(.*)', 'g').test(testUrl);
        }
    }
});