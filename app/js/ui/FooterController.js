define([], function() {
    'use strict';

    var ctrl = function(LocationStateService, $scope) {
        $scope.location = LocationStateService;
    };

    ctrl.$inject = [
        'LocationStateService',
        '$scope'
    ];

    return ctrl;
});