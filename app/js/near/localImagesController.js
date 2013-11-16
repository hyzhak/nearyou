define([], function() {
    'use strict';

    var ctrl = function(GoogleAnalytics, LocalImages, instagramClintId, SearchState, $stateParams, $scope, $window) {
        SearchState.setState('local');

        var lat = $stateParams.lat;
        var lng = $stateParams.lng;
        GoogleAnalytics.trackPage('local, [' + lat + ', ' + lng + ']');
        $scope.instagramResult = LocalImages.query({
            clientId: instagramClintId,
            lat:lat, lng:lng,
            max_timestamp: Math.round(Date.now() / 1000)
        });

        $scope.hasRequested = false;
        $scope.requestMore = function(){
            GoogleAnalytics.trackPage('request-more');
            $scope.hasRequested = true;
            var earlyImage = getEarlyImage($scope.instagramResult.data);
            LocalImages.query({
                clientId: instagramClintId,
                lat:lat, lng:lng,
                max_timestamp:earlyImage.created_time
            }, function(result){
                $scope.hasRequested = false;
                mergeImageCollections($scope.instagramResult.data, result.data);
            });
        };

        $window.onscroll = catchLastPartOfTheImages($scope, $window);
    };

    function catchLastPartOfTheImages($scope, $window){
        return function(){
            var nVScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if(nVScroll > 3 * (document.height - $window.innerHeight ) / 4){
                if(!$scope.hasRequested){
                    $scope.requestMore();
                }
            }
        }
    }

    function mergeImageCollections(target, source){
        for(var index = 0, count = source.length; index < count; index++){
            var image = source[index];
            if(!getImageById(target, image.id)){
                target.push(image);
            }
        }
    }

    function getImageById(collection, id){
        for(var index = 0, count = collection.length; index < count; index++){
            var image = collection[index];
            if(image.id == id){
                return image;
            }
        }
        return null;
    }

    function getEarlyImage(collection){
        var earlyImage, imageTimestamp = Number.MAX_VALUE;
        for(var index = 0, count = collection.length; index < count; index++){
            var image = collection[index];
            if(imageTimestamp > image.created_time){
                imageTimestamp = image.created_time;
                earlyImage = image;
            }
        }
        return earlyImage;
    }

    ctrl.$inject = [
        'GoogleAnalytics',
        'LocalImages',
        'instagramClintId',
        'SearchState',
        '$stateParams',
        '$scope',
        '$window'
    ];

    return ctrl;
});