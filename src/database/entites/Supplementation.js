const mongoose = require('mongoose');

const supplementationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        unique: true
    },
    text: {
        type: String,
        required: true
    },
    archived: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Supplementation = mongoose.model("Supplementation", supplementationSchema);

module.exports = Supplementation;