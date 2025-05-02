const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String },
    image: { type: String } // ← tambahkan ini
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
