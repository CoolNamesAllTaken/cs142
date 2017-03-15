'use strict';

cs142App.controller('AddPhotoController', ['$scope', '$rootScope', '$location', '$http', '$resource',
      function ($scope, $rootScope, $location, $http, $resource) {
        $scope.addPhoto = {};

        $scope.addPhoto.private = false;

        var userList = $resource("/user/list");
        userList.query(function (model) {
            $scope.addPhoto.userList = model;
            $scope.addPhoto.userListShareStatus = new Array($scope.addPhoto.userList.length);
        });

        $scope.addPhoto.successText = "";
        $scope.addPhoto.failText = "";

        // Photo upload stuff
        var selectedPhotoFile; // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.addPhoto.inputFileNameChanged = function (element) {
            console.log("input filename changed!");
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.addPhoto.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.addPhoto.uploadPhoto = function () {
            var sharedUsers = [];
            if ($scope.addPhoto.private) {
                // Compile list of shared users if private
                for (let i = 0; i < $scope.addPhoto.userListShareStatus.length; i++) {
                    if ($scope.addPhoto.userListShareStatus[i]) {
                        sharedUsers.push($scope.addPhoto.userList[i]._id);
                    }
                }
            }

            if (!$scope.addPhoto.inputFileNameSelected()) {
                console.error("uploadPhoto called with no selected file");
                $scope.addPhoto.failText = "No file selected!";
                $scope.addPhoto.successText = "";
                return;
            }
            console.log('fileSubmitted', selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);
            domForm.set('private', $scope.addPhoto.private);
            domForm.set('shared_users', JSON.stringify(sharedUsers));

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).success(function (newPhoto) {
                console.log("Successfully uploaded photo.");

                // Clear photo selection, send success message
                $scope.addPhoto.successText = "Successfully uploaded photo";
                $scope.addPhoto.failText = "";

                document.getElementById('photoFile').value = ''; // Clear upload input
                selectedPhotoFile = null;
            }).error(function (err) {
                console.error('ERROR uploading photo', err);
                $scope.addPhoto.failText = "Error uploading photo: " + err.data;
                $scope.addPhoto.successText = "";
            });
        };

    }]);
