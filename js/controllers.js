function BestOfInstagramCtrl($scope, BestOfImages, instagramClintId, SearchState){
    SearchState.setState('bestOf');
    $scope.instagramResult = BestOfImages.query({clientId: instagramClintId});
    $scope.requestMore = function(){
        BestOfImages.query({clientId: instagramClintId}, function(result){
            mergeImageCollections($scope.instagramResult.data, result.data);
        });
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
    console.log('RequestUserLocationCtrl');
    SearchState.setState('local');
    var options = {timeout:60000};
    navigator.geolocation.getCurrentPosition(function(position){
        var lat = position.coords.latitude.toFixed(2);
        var lng = position.coords.longitude.toFixed(2);
        $window.location.href = $window.location.href + '/' + lat + '/' + lng;
    }, function(){
        console.log('no location');
    }, options);
}

function LocalInstagramCtrl($scope, $routeParams, LocalImages, instagramClintId, SearchState){
    console.log('LocalInstagramCtrl');
    SearchState.setState('local');

    var lat = $routeParams.lat;
    var lng = $routeParams.lng;
    $scope.instagramResult = LocalImages.query({
        clientId: instagramClintId,
        lat:lat, lng:lng,
        max_timestamp: Math.round(Date.now() / 1000)
    });

    $scope.requestMore = function(){
        var earlyImage = getEarlyImage($scope.instagramResult.data);
        LocalImages.query({
            clientId: instagramClintId,
            lat:lat, lng:lng,
            max_timestamp:earlyImage.created_time
        }, function(result){
            mergeImageCollections($scope.instagramResult.data, result.data);
        });
    }
}