const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    product: { type: String, required: true },
    discount: { type: Number, required: true },
    priceBefore: { type: Number, required: true },
    priceAfter: { type: Number, required: true },
    image: { type: String }, // ← tambahkan ini
}, { timestamps: true });

module.exports = mongoose.model('Promotion', PromotionSchema);
