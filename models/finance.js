const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['income', 'expense'], required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true, trim: true },
        recordDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Finance', financeSchema);
