const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.Mixed, // Bisa berupa ObjectId atau String (nama pelanggan biasa)
            required: true,
            trim: true,
            validate: {
                validator: function (value) {
                    return typeof value === 'string' || mongoose.Types.ObjectId.isValid(value);
                },
                message: 'customer harus berupa ID Member yang valid atau nama pelanggan (string)',
            },
        },
        products: [
            {
                productId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'Product', 
                    required: true,
                    validate: {
                        validator: function (value) {
                            return mongoose.Types.ObjectId.isValid(value);
                        },
                        message: 'productId harus berupa ObjectId yang valid',
                    },
                },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
            },
        ],
        totalAmount: { type: Number, min: 0 }, // Total otomatis dihitung
        saleDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// 🔥 Middleware: Hitung totalAmount sebelum menyimpan
saleSchema.pre('save', function (next) {
    this.totalAmount = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    next();
});

// 🔥 Middleware: Hitung totalAmount sebelum update
saleSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.products) {
        update.totalAmount = update.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    }
    next();
});

module.exports = mongoose.model('Sale', saleSchema);
