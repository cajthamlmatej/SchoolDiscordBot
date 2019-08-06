const mongoose = require("mongoose");

const muteSchema = new mongoose.Schema({
    expire: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    reason: {
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
    },
    roles: {
        type: [String],
        required: true
    }
});

const Mute = mongoose.model("Mute", muteSchema);

module.exports = Mute;