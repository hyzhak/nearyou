/**
 * Service for Google Analytics
 */
define([], function() {
    'use strict';

    var service = function(GOOGLE_ANALYTICS_ID, $window) {
        var api = this;

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })($window,document,'script','//www.google-analytics.com/analytics.js','googleAnalytics');

//        var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
//        _gaq.push(['_require', 'inpage_linkid', pluginUrl]);

        googleAnalytics('create', GOOGLE_ANALYTICS_ID, {
            'siteSpeedSampleRate': 100
        });

        googleAnalytics('send', 'pageview');

        $window.onerror = function(msg, url, line) {
            var preventErrorAlert = true;
            googleAnalytics('send', 'event', 'JS Error', msg, navigator.userAgent + ' -> ' + url + " : " + line, line);
            console.log('send event JS Error ' + msg + ' ' + navigator.userAgent + ' -> ' + url + " : " + line);
            return preventErrorAlert;
        };

        /**
         * track page
         * @param name
         */
        api.trackPage = function(name) {
            googleAnalytics('send', 'pageview', name);
        };

        /**
         * track event
         * @param action
         * @param label
         * @param value
         */
        api.trackEvent = function(action, label, value) {
            googleAnalytics('send', 'event', action, label, value);
        }
    };

    service.$inject = ['GOOGLE_ANALYTICS_ID', '$window'];
    return service;
});