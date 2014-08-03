define([
    'text!./aboutTemplate.html',
    'angular',
    'angular-bootstrap'
], function(template, angular) {
    'use strict';

    angular.module('NY.AboutDlg', [
            'ui.bootstrap'
        ])
        .service('AboutDlgService', ['$modal', function($modal) {
            this.open = function() {
                return $modal.open({
                    template: template,
                    controller: 'AboutDlgCtrl'
                }).result;
            }
        }])
        .controller('AboutDlgCtrl', ['$modalInstance', '$scope', function($modalInstance, $scope) {
            $scope.close = function() {
                $modalInstance.close();
            };
        }]);
});