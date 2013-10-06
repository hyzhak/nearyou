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

angular.module('myApp').controller('RequestUserLocationCtrl',
    [
        'GoogleAnalytics',
        'SearchState',
        '$window',
function(GoogleAnalytics, SearchState, $window) {
    GoogleAnalytics.trackPage('request-location');
    SearchState.setState('local');
    var options = {timeout:60000};
    navigator.geolocation.getCurrentPosition(function(position){
        GoogleAnalytics.trackPage('user-apply-getlocation');
        var lat = position.coords.latitude.toFixed(2);
        var lng = position.coords.longitude.toFixed(2);
        $window.location.href = $window.location.href + '/' + lat + '/' + lng;
    }, function(){
        GoogleAnalytics.trackPage('user-reject-getlocation');
        console.log('TODO : just guess! Maybe NY? Central Park!');
        var lat = 40.776071;
        var lng = -73.966717;
        $window.location.href = $window.location.href + '/' + lat + '/' + lng;
    }, options);
}]);

angular.module('myApp').controller('LocalInstagramCtrl', [
    'GoogleAnalytics',
    'LocalImages',
    'instagramClintId',
    'SearchState',
    '$routeParams',
    '$scope',
    '$window',
function(GoogleAnalytics, LocalImages, instagramClintId, SearchState, $routeParams, $scope, $window) {
    SearchState.setState('local');

    var lat = $routeParams.lat;
    var lng = $routeParams.lng;
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
}]);