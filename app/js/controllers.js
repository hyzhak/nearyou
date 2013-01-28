function BestOfInstagramCtrl($scope, BestOfImages, instagramClintId){
    $scope.instagramResult = BestOfImages.query({clientId: instagramClintId});
}

function LocalInstagramCtrl($scope){

}