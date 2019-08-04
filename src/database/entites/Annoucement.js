const mongoose = require('mongoose');

const annoucementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    annoucement: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        unique: true
    },
    author: {
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
        default: false,
        required: true
    }
});

const Annoucement = mongoose.model("Annoucement", annoucementSchema);

module.exports = Annoucement;