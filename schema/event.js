"use strict";

/*
 * Defined the Mongoose Schema and return a Model for an Event
 */

/* jshint node: true */

var mongoose = require('mongoose');

// create a schema for Photo
var eventSchema = new mongoose.Schema({
    event_type: String, // Type of event (photo upload, comment, user registration, user login, user logout)
    description: String,
    file_name: String, // 	Name of a file containing a photo (for photo upload / photo comment events)
    date_time: {
        type: Date,
        default: Date.now
    }, // 	The date and time when the event occurred
    user_id: mongoose.Schema.Types.ObjectId // The user object of the user who created the event
});

// the schema is useless so far
// we need to create a model using it
var Event = mongoose.model('Event', eventSchema);

// make this available to our photos in our Node applications
module.exports = Event;
