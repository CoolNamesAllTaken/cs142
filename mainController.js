'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngResource', 'ngMaterial']);

cs142App.config(['$routeProvider', '$mdThemingProvider',
    function ($routeProvider, $mdThemingProvider) {
        $routeProvider.
        when('/users', {
            templateUrl: 'components/user-detail/user-landingTemplate.html',
            controller: 'UserDetailController'
        }).
        when('/users/:userId', {
            templateUrl: 'components/user-detail/user-detailTemplate.html',
            controller: 'UserDetailController'
        }).
        when('/photos/:userId', {
            templateUrl: 'components/user-photos/user-photosTemplate.html',
            controller: 'UserPhotosController'
        }).
        when('/login-register', {
            templateUrl: 'components/login-register/login-registerTemplate.html',
            controller: 'LoginRegisterController'
        }).
        when('/add-photo', {
            templateUrl: 'components/add-photo/add-photoTemplate.html',
            controller: 'AddPhotoController'
        }).
        when('/activities', {
            templateUrl: 'components/activities/activitiesTemplate.html',
            controller: 'ActivitiesController'
        }).
        otherwise({
            redirectTo: '/users'
        });
        $mdThemingProvider.disableTheming();
    }]);

cs142App.controller('MainController', ['$scope', '$rootScope', '$location', '$http', '$resource',
    function ($scope, $rootScope, $location, $http, $resource) {
        $scope.main = {};
        $scope.main.title = 'Users';
        $scope.main.user = undefined;

        $scope.main.vNum = -1;
        $scope.main.vNum = $resource("/test/info");
        $scope.main.vNum.get(function (model) {
            $scope.main.vNum = model.__v;
        });

        $scope.main.logout = function () {
            console.log("logging out");

            $http.post("/admin/logout").then(function (response) {
                $scope.main.loggedInUser = undefined;
                window.location.hash = "#/login-register";
                console.log("window.location = " + window.location);
            }, function (err) {
                console.log("Logout error: " + err.data);
            });
        };

        // Redirect to login page if not logged in
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (!$scope.main.loggedInUser) {
                // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        });
}]);
