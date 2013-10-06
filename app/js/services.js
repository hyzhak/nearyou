'use strict';

/* Services */

angular.module('myApp.services', ['ngResource']).
    //better use your own client-id. Get here: http://instagram.com/developer/clients/manage/
    value('instagramClintId', '39a6f9437c464ef684d543880969764d').

    factory('BestOfImages', function($resource){
        return $resource('https://api.instagram.com/v1/media/popular?client_id=:clientId&callback=JSON_CALLBACK', {}, {
            query: {method:'JSONP'}
        });
    }).
    factory('LocalImages', function($resource){
        return $resource('https://api.instagram.com/v1/media/search?client_id=:clientId&callback=JSON_CALLBACK&lat=:lat&lng=:lng&max_timestamp=:max_timestamp&distance=:distance',
            {distance: 5000},
            {query: {method:'JSONP'}}
        );
    });

/**
 * Service for Google Analytics
 */
angular.module('myApp.services').service('GoogleAnalytics', ['$window', function($window) {
    var api = this;
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })($window,document,'script','//www.google-analytics.com/analytics.js','googleAnalytics');

//        var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
//        _gaq.push(['_require', 'inpage_linkid', pluginUrl]);

    googleAnalytics('create', 'UA-38043860-1', {
        'siteSpeedSampleRate': 100
    });

    googleAnalytics('send', 'pageview');

    $window.onerror = function(msg, url, line) {
        var preventErrorAlert = true;
        googleAnalytics('send', 'event', 'JS Error', msg, navigator.userAgent + ' -> ' + url + " : " + line, line);
        console.log('send event JS Error ' + msg + ' ' + navigator.userAgent + ' -> ' + url + " : " + line);
        return preventErrorAlert;
    };

    api.trackPage = function(action, label, value) {
        googleAnalytics('send', 'event', action, label, value);
    };
}]);