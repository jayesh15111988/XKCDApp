/**
 * Created by jayeshkawli on 1/2/15.
 */
angular.module('xkcdComicApp.controllers', []).
    controller('mainPageController', function($scope) {


        $scope.numberOfTopTagsToRequest = 10;
        $scope.getTagInfoWith = function(){
            console.log("Get tag button clicked" + $scope.numberOfTopTagsToRequest);
        }
    });