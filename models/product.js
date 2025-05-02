const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        price: { type: Number, required: true }, // Harga JUAL
        purchasePrice: { type: Number, default: 0 }, // Harga BELI (opsional)
        stock: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true },
        image: { type: String }, // ← tambahkan ini
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
