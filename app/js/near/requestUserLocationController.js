define([], function() {
    'use strict';
    var ctrl = function(GetCurrentPositionServer, GoogleAnalytics, SearchState, $window, $location, $scope) {
        GoogleAnalytics.trackPage('request-location');
        SearchState.setState('local');

        GetCurrentPositionServer.getUserLocation().then(function(position) {
            GoogleAnalytics.trackPage('getlocation-from-service');
            var lat = position.coords.latitude.toFixed(2);
            var lng = position.coords.longitude.toFixed(2);
            $location.path('/at/' + lat + '/' + lng);
        }, function() {
            navigator.geolocation.getCurrentPosition(function(position){
                GoogleAnalytics.trackPage('user-apply-getlocation');
                var lat = position.coords.latitude.toFixed(2);
                var lng = position.coords.longitude.toFixed(2);
                $scope.$apply(function() {
                    $location.path('/at/' + lat + '/' + lng);
                });
            }, function(){
                GoogleAnalytics.trackPage('user-reject-getlocation');
                console.log('TODO : just guess! Maybe NY? Central Park!');
                var lat = 40.776071;
                var lng = -73.966717;
                $window.location.href = $window.location.href + '/' + lat + '/' + lng;
            }, {
                timeout:60000
            });
        });

    };
    ctrl.$inject = [
        'GetCurrentPositionServer',
        'GoogleAnalytics',
        'SearchState',
        '$window',
        '$location',
        '$scope'
    ];
    return ctrl;
});