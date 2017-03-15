'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$resource', '$routeParams', '$http',
  function($scope, $resource, $routeParams, $http) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
      
    var user = $resource('/user/:userId');
    user.get({userId: $routeParams.userId}, function(user) {
        $scope.main.title = "Photos of " + user.first_name + " " + user.last_name;
    });
    
    $scope.photos = {};
      
    var userPhotos = $resource('/photosOfUser/:userId');
    $scope.photos.userPhotos = userPhotos.query({userId: $routeParams.userId});
      
    $scope.photos.addComment = function(photo) {
        var photoId = photo._id;
        var commentText = photo.commentText;
        console.log("adding comment to photo " + photoId);
        $http.post('/commentsOfPhoto/' + photoId, {comment: commentText}).then(function() {
            // Re-fetch photos so that comments show up
            $scope.photos.userPhotos = userPhotos.query({userId: $routeParams.userId});
        });
    };
      
    // Update user photos when new photo uploaded
    $scope.$on('newPhoto', function() {
        console.log("newPhoto");
        $scope.photos.userPhotos = userPhotos.query({userId: $routeParams.userId});
    });
}]);
