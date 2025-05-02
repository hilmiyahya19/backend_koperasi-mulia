const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const memberSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, trim: true },
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true }, // Password akan di-hash sebelum disimpan
        phone: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['pending', 'approved'],
            default: 'pending',
        },
        approvedAt: { type: Date }, // 🔥 Menyimpan kapan member disetujui
        transactionHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: [] }],
    },
    { timestamps: true }
);

// 🔥 Hash password sebelum menyimpan ke database
memberSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Hanya hash jika password diubah
    const salt = await bcrypt.genSalt(10); // Buat "garam" (salt) untuk hashing
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
});

// 🔑 Metode untuk membandingkan password saat login
memberSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Member', memberSchema);
