"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');

var multer = require('multer');
var processFormBody = multer({
    storage: multer.memoryStorage()
}).single('uploadedphoto');

var fs = require("fs");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

// Utility function that deletes object fields not in keys, returns new object with updated fields
var selectFields = function (selection_object, selected_keys) {
    var object_keys = Object.keys(selection_object);
    for (let curr_key of object_keys) {
        if (selected_keys.indexOf(curr_key) === -1) {
            delete selection_object[curr_key];
        }
    }
    return selection_object;
};

mongoose.connect('mongodb://localhost/cs142project6');

// Middleware added for P7 (express-session, body-parser)
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json());

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {
                name: 'user',
                collection: User
            },
            {
                name: 'photo',
                collection: Photo
            },
            {
                name: 'schemaInfo',
                collection: SchemaInfo
            }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        // User not logged in
        response.status(401).send("Unauthorized");
        return;
    }

    // Pull all users, project first and last name only
    User.find({}, {
        _id: 1,
        first_name: 1,
        last_name: 1
    }, function (err, users) {
        if (err) {
            console.log("Error pulling user list");
            response.status(400).send('Error pulling user list');
        } else {
            response.status(200).send(users);
        }
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        // User not logged in
        response.status(401).send("Unauthorized");
        return;
    }

    var id = request.params.id;
    var user = User.findOne({
            _id: id
        }, {
            _id: 1,
            first_name: 1,
            last_name: 1,
            location: 1,
            description: 1,
            occupation: 1
        },
        function (err, user) {
            if (err) {
                console.log("Error finding user");
                response.status(400).send("Error finding user");
            } else if (user === null) {
                console.log("User not found");
                response.status(404).send("User not found");
            } else {
                response.status(200).send(user);
            }
        });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        // User not logged in
        response.status(401).send("Unauthorized");
        return;
    }

    var user_id = request.params.id;

    // Pull all photos of user_id, project desired params of photos
    var photos = Photo.find({
            user_id: user_id,
            $or: [
                {
                    private: false
                },
                {
                    shared_users: {
                        $in: [request.session.user_id]
                    }
                },
                {
                    user_id: request.session.user_id
                }
            ]
        }, {
            _id: 1,
            user_id: 1,
            comments: 1,
            file_name: 1,
            date_time: 1
        },
        function (err, photos) {
            if (err) {
                console.log("Error finding photos of user");
                response.status(400).send("Error finding photos of user");
            } else if (photos.length === 0) {
                console.log("Photos of user not found");
                response.status(404).send("Photos of user not found");
            } else {
                // Stringify and parse photos to clone
                photos = JSON.parse(JSON.stringify(photos));

                //Build each photo asynchronously
                async.each(photos,
                    function (photo, photo_callback) {
                        // Build comments asynchronously
                        async.each(photo.comments,
                            function (comment, comment_callback) {

                                // Step through comments on photo, find users and project relevant info
                                var comment_user = User.findOne({
                                        _id: comment.user_id
                                    }, {
                                        _id: 1,
                                        first_name: 1,
                                        last_name: 1
                                    },
                                    function (err, comment_user) {
                                        if (err) {
                                            console.log("Error finding comment user");
                                        } else if (comment_user === null) {
                                            console.log("Comment user not found");
                                        } else {
                                            comment.user = comment_user;

                                            // Filter comment to remove unwanted fields
                                            selectFields(comment, ["comment", "date_time", "_id", "user"]);

                                            comment_callback();
                                        }
                                    });
                            },
                            function (err) {
                                if (err) {
                                    console.log("Error building comment");
                                } else {
                                    photo_callback();
                                }
                            });

                    },
                    function (err) {
                        if (err) {
                            console.log("Error building photos");
                        } else {
                            response.status(200).send(photos);
                        }
                    });
            }
        }
    );
});

// Log in POST request handler
app.post('/admin/login', function (request, response) {
    // TODO: re-implement so but find way to clear session on refresh
    //    if (request.session.user_id) {
    //        // User already logged in
    //        console.log("Already logged in ");
    //        response.status(400).send("Already logged in");
    //    } else {
    // Log user in
    var user = User.findOne({
        login_name: request.body.login_name,
        password: request.body.password
    }, function (err, user) {
        if (err) {
            console.log("Error posting login name");
            response.status(400).send("Error posting login name");
        } else if (user === null) {
            console.log("Login name not found");
            response.status(400).send("Login name and password combination not found");
        } else {
            request.session.user_id = user._id;
            request.session.login_name = user.login_name;
            response.status(200).send(user);
        }
    });
    //    }
});

// Log out POST request handler
app.post('/admin/logout', function (request, response) {
    if (!request.session.user_id) {
        // User not logged in
        response.status(400).send("No user logged in");
    } else {
        // Log out
        request.session.destroy(function (err) {
            if (err) {
                response.status(400).send("Logout failed");
            } else {
                response.status(200).end();
            }
        });
    }
});

// Add comment to photo POST request handler
app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.user_id) {
        // User not logged in
        response.status(401).send("Unauthorized");
    } else {
        var commentText = request.body.comment;
        var photoId = request.params.photo_id;
        var userId = request.session.user_id;

        if (commentText.length === 0) {
            response.status(400).send("Could not create empty comment");
            return;
        }

        // Find photo for comment
        var photo = Photo.findOne({
            _id: photoId
        }, function (err, photo) {
            if (err) {
                console.log("Error finding photo for new comment");
                response.status(400).send("Error finding photo for new comment");
            } else if (photo === null) {
                console.log("Photo for new comment not found");
                response.status(404).send("Photo for new comment not found");
            } else {
                var d = new Date();
                var comment = {
                    date_time: d.toDateString(),
                    comment: commentText,
                    user_id: userId,
                    photo_id: photoId
                };

                //Append comment to photo
                console.log(photo.comments);
                photo.comments.push(comment);
                photo.save();
                response.status(200).end();
            }
        });
    }
});

// Photo upload POST handler
app.post('/photos/new', function (request, response) {

    if (!request.session.user_id) {
        // User not logged in
        response.status(401).send("Unauthorized");
    } else {
        processFormBody(request, response, function (err) {
            if (err || !request.file) {
                response.status(400).send("No photo file to upload");
                return;
            }
            // request.file has the following properties of interest
            //      fieldname      - Should be 'uploadedphoto' since that is what we sent
            //      originalname:  - The name of the file the user uploaded
            //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
            //      buffer:        - A node Buffer containing the contents of the file
            //      size:          - The size of the file in bytes

            // XXX - Do some validation here.
            // We need to create the file in the directory "images" under an unique name. We make
            // the original file name unique by adding a unique prefix with a timestamp.
            var timestamp = new Date().valueOf();
            var filename = 'U' + String(timestamp) + request.file.originalname;

            // Write file into images directory
            fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
                console.log("private: " + request.body.private + " shared_users: " + request.body.shared_users);
                Photo.create({
                    file_name: filename,
                    user_id: request.session.user_id,
                    date_time: Date.now(),
                    comments: [],
                    private: request.body.private,
                    shared_users: JSON.parse(request.body.shared_users)
                }, function (err, photo) {
                    if (err) {
                        console.log("Error creating new photo: " + err.data);
                        response.status(400).send("Error creating new photo");
                        return;
                    } else {
                        //                        request.body.shared_users.forEach(function (user_id) {
                        //                            photo.shared_users.push(user_id);
                        //                        });
                        //                        photo.save();

                        response.status(200).end();
                    }
                });
            });
        });
    }

});

app.post('/user', function (request, response) {
    var loginName = request.body.login_name;
    var password = request.body.password;

    if (password.length === 0) {
        console.log("User creation failed because password can't be blank");
        response.status(400).send("Password can't be blank");
        return;
    } else if (loginName.length === 0) {
        console.log("User creation failed because Login Name can't be blank");
        response.status(400).send("Login Name can't be blank");
        return;
    } else if (request.body.first_name.length === 0 || request.body.last_name === 0) {
        response.status(400).send("First or Last Name can't be blank");
        return;
    }

    User.findOne({
        login_name: loginName
    }, function (err, user) {
        if (user !== null) {
            response.status(400).send("User with Login Name " + loginName + " already exists.");
            return;
        } else {
            User.create({
                login_name: loginName,
                password: password,
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                location: request.body.location,
                description: request.body.description,
                occupation: request.body.occupation
            }, function (err, newUser) {
                if (err) {
                    response.status(400).send("Error creating new user");
                } else {
                    response.status(200).end();
                }
            });
        }
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
