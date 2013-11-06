define([], function() {
    'use strict';

    //TODO:adapt
    angular.module('myApp').controller('BestOfInstagramCtrl', [
        'GoogleAnalytics',
        'BestOfImages',
        'instagramClintId',
        'SearchState',
        '$scope',
        '$window',
        function(GoogleAnalytics,
                 BestOfImages,
                 instagramClintId,
                 SearchState,
                 $scope,
                 $window) {
            GoogleAnalytics.trackPage('bestof');

            SearchState.setState('bestof');
            $scope.instagramResult = BestOfImages.query({clientId: instagramClintId});
            $scope.hasRequested = false;
            $scope.requestMore = function(){
                $scope.hasRequested = true;
                BestOfImages.query({clientId: instagramClintId}, function(result){
                    mergeImageCollections($scope.instagramResult.data, result.data);
                    $scope.hasRequested = false;
                });
            };
            $window.onscroll = catchLastPartOfTheImages($scope, $window);
        }]);
});