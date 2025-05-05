// backend/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    contact: {
        email: String,
        phone: String,
        address: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);