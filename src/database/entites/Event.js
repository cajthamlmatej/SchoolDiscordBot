const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["event", "task"],
        required: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true
    },
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        uppercase: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;