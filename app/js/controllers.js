function BestOfInstagramCtrl($scope, BestOfImages, instagramClintId){
    $scope.instagramResult = BestOfImages.query({clientId: instagramClintId}, function(e){
        console.log(e);
    });
}

function LocalInstagramCtrl($scope){

}