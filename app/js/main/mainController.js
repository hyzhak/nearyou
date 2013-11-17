define([
], function() {
    var ctrl = function(GoogleAnalytics, $scope, SearchState){

        'use strict';

        $scope.year = 2013;
        $scope.isActivate = function(state){
            if(SearchState.getState() == state){
                return 'active';
            }else{
                return '';
            }
        };

        $scope.lockScroll = false;

        /*
         $scope.$watch('lockScroll', function(newValue, oldValue){
         console.log('newValue', newValue);
         console.log('oldValue', oldValue);
         });
         */

        $scope.isTrue = function(condition, trueExpression, falseExpression){
            return condition?trueExpression:falseExpression;
        };

        $scope.showAbout = function(){
            /*$('#aboutWindow').modal('show');*/
            GoogleAnalytics.trackPage('show-about');
        };

        $scope.hideAbout = function(){
            /*$('#aboutWindow').modal('hide');*/
            GoogleAnalytics.trackPage('hide-about');
        };

        /*$('#aboutWindow').on('show', function (e) {
            $scope.lockScroll = true;
            GoogleAnalytics.trackPage('on-show-about');
            //break
            //$scope.$digest();
        });

        $('#aboutWindow').on('hidden', function (e) {
            GoogleAnalytics.trackPage('on-hidden-about');
            $scope.$apply(function(){
                $scope.lockScroll = false;
            });
        });*/
    };

    ctrl.$inject = [
        'GoogleAnalytics',
        '$scope',
        'SearchState'
    ];

    return ctrl;
});