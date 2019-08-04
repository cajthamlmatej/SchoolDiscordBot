const mongoose = require('mongoose');

const directBakalariSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    informations: {
        type: [String],
        required: true
    }
});

const DirectBakalari = mongoose.model("DirectBakalari", directBakalariSchema);

module.exports = DirectBakalari;