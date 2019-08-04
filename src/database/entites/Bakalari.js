const mongoose = require('mongoose');

const bakalariSchema = new mongoose.Schema({
    guid: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isTask: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

const Bakalari = mongoose.model("Bakalari", bakalariSchema);

module.exports = Bakalari;