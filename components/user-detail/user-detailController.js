'use strict';

cs142App.controller('UserDetailController', ['$scope', '$resource', '$routeParams',
  function ($scope, $resource, $routeParams) {
      var user = $resource("/user/:userId");
      user.get({userId: $routeParams.userId}, function(user) {
          $scope.main.title = user.first_name + " " + user.last_name;
          $scope.main.user = user;
          $scope.title = user.first_name + " " + user.last_name;
      });
  }]);
