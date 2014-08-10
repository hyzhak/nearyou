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
            this.open = function(imageId) {
                return $modal.open({
                    template: template,
                    controller: 'ImageDlgCtrl',
                    resolve: {
                        imageId: function() {
                            return imageId;
                        }
                    },
                    size: 'lg'
                }).result;
            }
        }])
        .controller('ImageDlgCtrl', ['InstagramImages', 'imageId', '$modalInstance', '$scope', function(InstagramImages, imageId, $modalInstance, $scope) {
            $scope.imagePromise = InstagramImages
                .getImage(imageId)
                .then(function(image) {
                    $scope.image = image;
                });

            $scope.cancel = function() {
                $modalInstance.close();
            };
        }]);
});