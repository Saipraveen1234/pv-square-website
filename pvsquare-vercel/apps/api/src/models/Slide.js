// backend/models/Slide.js
const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    desktopImage: {
        type: String
    },
    mobileImage: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Slide', slideSchema);