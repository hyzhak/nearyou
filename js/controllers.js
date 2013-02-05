function BestOfInstagramCtrl($scope, BestOfImages, instagramClintId, SearchState, $window){
    trackPage('bestof');

    SearchState.setState('bestof');
    $scope.instagramResult = BestOfImages.query({clientId: instagramClintId});
    $scope.hasRequested = false;
    $scope.requestMore = function(){
        $scope.hasRequested = true;
        BestOfImages.query({clientId: instagramClintId}, function(result){
            mergeImageCollections($scope.instagramResult.data, result.data);
            $scope.hasRequested = false;
        });
    }
    $window.onscroll = catchLastPartOfTheImages($scope, $window);
}

function trackPage(action, label, value) {
    _gaq.push(['_trackEvent', 'page', action, label, value]);
    console.log('_trackEvent', 'page', action, label, value);
}

function catchLastPartOfTheImages($scope, $window){
    return function(){
        var nVScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if(nVScroll > 3 * (document.height - $window.innerHeight ) / 4){
            if(!$scope.hasRequested){
                trackPage('scroll-to-edge');
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

function RequestUserLocationCtrl($location, $window, SearchState){
    trackPage('request-location');
    SearchState.setState('local');
    var options = {timeout:60000};
    navigator.geolocation.getCurrentPosition(function(position){
        trackPage('user-apply-getlocation');
        var lat = position.coords.latitude.toFixed(2);
        var lng = position.coords.longitude.toFixed(2);
        $window.location.href = $window.location.href + '/' + lat + '/' + lng;
    }, function(){
        trackPage('user-reject-getlocation');
        console.log('TODO : just guess! Maybe NY?');
        var lat = 40.01;
        var lng = -73.01;
        $window.location.href = $window.location.href + '/' + lat + '/' + lng;
    }, options);
}

function LocalInstagramCtrl($scope, $routeParams, LocalImages, instagramClintId, SearchState, $window){
    SearchState.setState('local');

    var lat = $routeParams.lat;
    var lng = $routeParams.lng;
    trackPage('local, [' + lat + ', ' + lng + ']');
    $scope.instagramResult = LocalImages.query({
        clientId: instagramClintId,
        lat:lat, lng:lng,
        max_timestamp: Math.round(Date.now() / 1000)
    });

    $scope.hasRequested = false;
    $scope.requestMore = function(){
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
    }

    $window.onscroll = catchLastPartOfTheImages($scope, $window);
}