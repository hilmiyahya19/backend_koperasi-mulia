const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reportType: { 
            type: String, 
            enum: ['members', 'sales', 'top-products', 'finance'], 
            required: true, 
            trim: true 
        }, 
        data: { type: Object, required: true }, // JSON laporan disimpan di sini
        generatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
