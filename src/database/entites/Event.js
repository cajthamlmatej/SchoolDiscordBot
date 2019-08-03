const mongoose = require('mongoose');

const history = new mongoose.Schema({ 
    type: {
        type: String,
        required: true,
    },
    value: {
        old: {
            type: String,
            required: true,
        },
        new: {
            type: String,
            required: true,
        }
    },
    author: {
        type: String,
        required: true
    },
    changed: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["event", "task"],
        required: true,
        lowercase: true
    },
    message: {
        type: String,
        required: true,
        unique: true
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
    },
    archived: {  
        type: Boolean,
        required: true,
        default: false
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    history: {
        type: [history]
    }
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;