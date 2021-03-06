"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

var mongoose = require('mongoose');

/*
 * Photo can have comments and we stored them in the Photo object itself using
 * this Schema:
 */
var commentSchema = new mongoose.Schema({
    comment: String, // The text of the comment.
    date_time: {
        type: Date,
        default: Date.now
    }, // The date and time when the comment was created.
    user_id: mongoose.Schema.Types.ObjectId, // 	The user object of the user who created the comment.
});

// create a schema for Photo
var photoSchema = new mongoose.Schema({
    file_name: String, // 	Name of a file containing the actual photo (in the directory project6/images).
    date_time: {
        type: Date,
        default: Date.now
    }, // 	The date and time when the photo was added to the database
    user_id: mongoose.Schema.Types.ObjectId, // The user object of the user who created the photo.
    comments: [commentSchema], // Comment objects representing the comments made on this photo.
    private: Boolean, // Sharing limited to shared users
    shared_users: [mongoose.Schema.Types.ObjectId], // Array of users who can see the photo
    likes: [mongoose.Schema.Types.ObjectId], // Array of users who like the photo
});

// the schema is useless so far
// we need to create a model using it
var Photo = mongoose.model('Photo', photoSchema);

var Comment = mongoose.model('Comment', commentSchema);

// make this available to our photos in our Node applications
module.exports = Photo;
