define(['app/images/cacheGenerator'], function(cacheGenerator) {
    'use strict';

    var ctrl = function(GoogleAnalytics, LocalImages, LocationStateService, ImagesService, INSTAGRAM_CLIENT_ID, SearchState, $document, $stateParams, $scope, $window) {
        SearchState.setState('local');

        var lat = $stateParams.lat,
            lng = $stateParams.lng,
            distance = $stateParams.distance;

        GoogleAnalytics.trackPage('{ location: [' + lat + ', ' + lng + '], distance: ' + distance + "}");

        LocationStateService.lat = Number(lat);
        LocationStateService.lng = Number(lng);
        LocationStateService.distance = Number(distance);
        LocationStateService.place =  decodeURIComponent($stateParams.place).substr(0, 80);

        $scope.lat = lat;
        $scope.lng = lng;
        $scope.distance = distance;
        $scope.place = $stateParams.place;

        $scope.instagramResult = LocalImages.query({
            clientId: INSTAGRAM_CLIENT_ID,
            lat: lat,
            lng: lng,
            distance: distance,
            max_timestamp: Math.round(Date.now() / 1000)
        });

        $scope.$watch('instagramResult.data', function(value) {
            if (!value) {
                return;
            }
            value.forEach(function(image) {
                var cache = cacheGenerator(image.location.latitude, image.location.longitude);
                if (!ImagesService.getImage(cache)) {
                    ImagesService.setImage(cache, buildImage(image.images.thumbnail.url));
                }
            });
        });

        function buildImage(url) {
            return {
                url: url
            }
        }

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
                clientId: INSTAGRAM_CLIENT_ID,
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
        'LocationStateService',
        'ImagesService',
        'INSTAGRAM_CLIENT_ID',
        'SearchState',
        '$document',
        '$stateParams',
        '$scope',
        '$window'
    ];

    return ctrl;
});