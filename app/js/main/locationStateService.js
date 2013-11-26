define([], function() {
    'use strict';
    var service = function(){
        var api = this;
        api.lat = angular.undefined;
        api.lng = angular.undefined;
        api.distance = angular.undefined;
        api.place = angular.undefined;
    };
    service.$inject = [];
    return service;
});