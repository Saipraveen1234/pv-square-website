// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    images: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);