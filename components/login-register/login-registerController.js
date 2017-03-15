'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$rootScope', '$location', '$http', '$resource',
      function ($scope, $rootScope, $location, $http, $resource) {
          $scope.loginRegister = {};
          
          // Login Fields
          $scope.loginRegister.loginName = "";
          $scope.loginRegister.password = "";
          
          $scope.loginRegister.failText = "";
          
          // Registration Fields
          $scope.loginRegister.regLoginName = "";
          $scope.loginRegister.regPassword = "";
          $scope.loginRegister.regPasswordConfirm = "";
          $scope.loginRegister.regFirstName = "";
          $scope.loginRegister.regLastName = "";
          $scope.loginRegister.regLocation = "";
          $scope.loginRegister.regDescription = "";
          $scope.loginRegister.regOccupation = "";
          
          $scope.loginRegister.regFailText = "";
          $scope.loginRegister.regSuccessText = "";

          $scope.loginRegister.login = function() {
              $http.post("/admin/login", {login_name: $scope.loginRegister.loginName, password: $scope.loginRegister.password}).then(function(response){
                  // Login success
                  $scope.main.loggedInUser = response.data;
                  window.location.hash = "#users/" + response.data._id;
              }, function(err){
                  if (err) {
                      $scope.loginRegister.failText = err.data;
                      $scope.loginRegister.loginName = "";
                      $scope.loginRegister.password = "";
                  }
              });  
          };
          
          $scope.loginRegister.register = function() {
              $http.post("/user", {
                  login_name: $scope.loginRegister.regLoginName,
                  password: $scope.loginRegister.regPassword,
                  first_name: $scope.loginRegister.regFirstName,
                  last_name: $scope.loginRegister.regLastName,
                  location: $scope.loginRegister.regLocation,
                  description: $scope.loginRegister.regDescription,
                  occupation: $scope.loginRegister.regOccupation
              }).then(function(response) {
                  console.log("Registration succeeded!");
                  $scope.loginRegister.regFailText = "";
                  $scope.loginRegister.regSuccessText = "Registration Successful!";
                  
                  // Clear form
                  $scope.loginRegister.regLoginName = "";
                  $scope.loginRegister.regPassword = "";
                  $scope.loginRegister.regPasswordConfirm = "";
                  $scope.loginRegister.regFirstName = "";
                  $scope.loginRegister.regLastName = "";
                  $scope.loginRegister.regLocation = "";
                  $scope.loginRegister.regDescription = "";
                  $scope.loginRegister.regOccupation = "";
              }, function(err) {
                  if (err) {
                      $scope.loginRegister.regSuccessText = "";
                      console.log("Registration failed because " + err.data);
                      $scope.loginRegister.regFailText = err.data;
                  }
              });
          };
}]);

