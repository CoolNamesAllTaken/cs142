'use strict';

cs142App.controller('UserListController', ['$scope', '$resource', 
    function ($scope, $resource) {
        
        $scope.userList = {};
        
        var userList = $resource("/user/list");
        userList.query(function (model) {
            $scope.userList.userList = model;
        });
        
        $scope.userList.userClicked = function(user) {
            // when user in user list clicked, display description in md-content
            window.location.hash = "#users/" + user._id;
        };
    }]);

