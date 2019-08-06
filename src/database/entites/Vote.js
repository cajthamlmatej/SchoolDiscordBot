const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    options: {
        type: Map,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;