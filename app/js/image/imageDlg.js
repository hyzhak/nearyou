define([
    'text!./template.html',
    'angular',
    'angular-bootstrap',

    'app/instagram/images'
], function(template, angular) {
    'use strict';

    angular.module('NY.ImageDlg', [
            'ui.bootstrap',

            'NY.ImagesService'
        ])
        .service('ImageDlgService', ['$modal', function($modal) {
            this.open = function(marker) {
                return $modal.open({
                    template: template,
                    controller: 'ImageDlgCtrl',
                    resolve: {
                        marker: function() {
                            return marker
                        }
                    },
                    size: 'lg'
                }).result;
            }
        }])
        .controller('ImageDlgCtrl', ['InstagramImages', 'marker', '$modalInstance', '$scope', function(InstagramImages, marker, $modalInstance, $scope) {
            $scope.imagePromise = InstagramImages
                .getImage(marker._image.metadata.instagram)
                .then(function(image) {
                    $scope.image = image;
                });

            $scope.close = function() {
                $modalInstance.close();
            };
        }]);
});