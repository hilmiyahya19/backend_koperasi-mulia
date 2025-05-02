const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    image: { type: String } // ← tambahkan ini
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);
