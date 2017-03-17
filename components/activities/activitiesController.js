'use strict';

cs142App.controller('ActivitiesController', ['$scope', '$rootScope', '$location', '$http', '$resource',
      function ($scope, $rootScope, $location, $http, $resource) {
        $scope.activities = {};
        $scope.activities.activitiesList = [];
        console.log("in activities controller");

        var activitiesList = $resource("/activities");

        $scope.activities.fetch = function () {
            activitiesList.query(function (model) {
                $scope.activities.activitiesList = model;
            });
        };

        $scope.activities.fetch(); // Initial activities fetch
}]);
