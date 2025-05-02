const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    legal: { type: String, required: true },
    address: { type: String, required: true },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    vision: { type: String, required: true },
    mission: [{ type: String, required: true }] // Array untuk misi koperasi
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
