define([], function() {
    'use strict';
    var ctrl = function(GoogleAnalytics, SearchState, $window, $location, $scope) {
        GoogleAnalytics.trackPage('request-location');
        SearchState.setState('local');
        var options = {timeout:60000};
        navigator.geolocation.getCurrentPosition(function(position){
            GoogleAnalytics.trackPage('user-apply-getlocation');
            var lat = position.coords.latitude.toFixed(2);
            var lng = position.coords.longitude.toFixed(2);
//            $window.location.href = $window.location.href + '/' + lat + '/' + lng;
            $scope.$apply(function() {
                $location.path('/at/' + lat + '/' + lng);
            });
        }, function(){
            GoogleAnalytics.trackPage('user-reject-getlocation');
            console.log('TODO : just guess! Maybe NY? Central Park!');
            var lat = 40.776071;
            var lng = -73.966717;
            $window.location.href = $window.location.href + '/' + lat + '/' + lng;
        }, options);
    };
    ctrl.$inject = [
        'GoogleAnalytics',
        'SearchState',
        '$window',
        '$location',
        '$scope'
    ];
    return ctrl;
});