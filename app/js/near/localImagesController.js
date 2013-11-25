define([], function() {
    'use strict';

    var ctrl = function(GoogleAnalytics, LocalImages, instagramClintId, SearchState, $document, $stateParams, $scope, $window) {
        SearchState.setState('local');

        var lat = $stateParams.lat,
            lng = $stateParams.lng,
            distance = $stateParams.distance;
        GoogleAnalytics.trackPage('local, [' + lat + ', ' + lng + '], distance: ' + distance);

        $scope.distance = distance;

        $scope.instagramResult = LocalImages.query({
            clientId: instagramClintId,
            lat: lat,
            lng: lng,
            distance: distance,
            max_timestamp: Math.round(Date.now() / 1000)
        });

        $scope.hasRequested = false;
        $scope.requestMore = function(){
            var from;
            if ($scope.instagramResult.data) {
                var earlyImage = getEarlyImage($scope.instagramResult.data);
                from = earlyImage.created_time;
            } else {
                from = Math.round(Date.now() / 1000);
            }

            GoogleAnalytics.trackPage('request-more');
            $scope.hasRequested = true;

            LocalImages.query({
                clientId: instagramClintId,
                lat: lat,
                lng: lng,
                distance: $scope.distance,
                max_timestamp: from
            }, function(result){
                $scope.hasRequested = false;
                mergeImageCollections($scope.instagramResult.data, result.data);
            });
        };

        $window.onscroll = catchLastPartOfTheImages();

        function catchLastPartOfTheImages(){
            return function(){
                var nVScroll = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
                if(nVScroll > 3 * ($document[0].documentElement.offsetHeight - $window.innerHeight ) / 4){
                    if(!$scope.hasRequested){
                        $scope.requestMore();
                    }
                }
            }
        }
    };


    function mergeImageCollections(target, source){
        target = target || [];
        for(var index = 0, count = source.length; index < count; index++){
            var image = source[index];
            if(!getImageById(target, image.id)){
                target.push(image);
            }
        }
    }

    function getImageById(collection, id){
        if (!collection) {
            return null;
        }

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
        '$document',
        '$stateParams',
        '$scope',
        '$window'
    ];

    return ctrl;
});