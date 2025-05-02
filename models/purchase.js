const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
    {
        supplier: { type: String, required: true, trim: true },
        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
                purchasePrice: { type: Number, required: true, min: 0 }, // Tambahkan ini
            }
        ],
        totalPrice: { type: Number, min: 0 }, // Menggunakan total harga langsung
        purchaseDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// 🔥 Middleware: Hitung totalPrice sebelum menyimpan
purchaseSchema.pre('save', function (next) {
    this.totalPrice = this.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
    next();
});

// 🔥 Middleware: Hitung totalPrice sebelum update
purchaseSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.products) {
        update.totalPrice = update.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
    }
    next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);

