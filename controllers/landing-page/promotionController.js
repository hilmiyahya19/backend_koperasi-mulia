const Promotion = require('../../models/landing-page/promotion');
const multer = require('multer');
const { storage } = require('../../utils/cloudinary');
const upload = multer({ storage });

// GET all promotions
exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find().sort({ createdAt: -1 }); // Urutkan dari terbaru
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data promosi', error });
    }
};

// GET single promotion by ID
exports.getPromotionById = async (req, res) => {
    const { id } = req.params;
    try {
        const promotion = await Promotion.findById(id);
        if (!promotion) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan' });
        }
        res.status(200).json(promotion);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data promosi', error });
    }
};

// CREATE a new promotion
exports.createPromotion = async (req, res) => {
    const { product, discount, priceBefore, priceAfter, image } = req.body;
    const imageUrl = req.file?.path; // URL Cloudinary

    if (!product || discount == null || priceBefore == null || priceAfter == null) {
        return res.status(400).json({ message: 'Produk, diskon, harga sebelum dan harga sesudah wajib diisi' });
    }

    try {
        const existingCount = await Promotion.countDocuments();
        if (existingCount >= 3) {
            return res.status(400).json({ message: 'Tidak bisa menambah promosi. Maksimal 3 data diperbolehkan.' });
        }

        const newPromotion = new Promotion({ 
            product, 
            discount, 
            priceBefore, 
            priceAfter, 
            image: imageUrl, 
        });
        const savedPromotion = await newPromotion.save();
        res.status(201).json(savedPromotion);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah promosi', error });
    }
};

// UPDATE promotion
exports.updatePromotion = async (req, res) => {
    const { id } = req.params;
    const { product, discount, priceBefore, priceAfter, image } = req.body;
    const imageUrl = req.file?.path; // Ambil URL gambar jika ada file baru

    if (!product || discount == null || priceBefore == null || priceAfter == null) {
        return res.status(400).json({ message: 'Produk, diskon, harga sebelum dan harga sesudah wajib diisi' });
    }

    try {
        // Ambil data promosi lama (untuk ambil image sebelumnya jika tidak diganti)
        const existingPromotion = await Promotion.findById(id);
        if (!existingPromotion) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan' });
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            id,
            { 
                product, 
                discount, 
                priceBefore, 
                priceAfter, 
                image: imageUrl || existingPromotion.image, // Pakai gambar baru jika ada, kalau tidak tetap pakai yang lama
            },
            { new: true }
        );

        if (!updatedPromotion) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan' });
        }

        res.status(200).json(updatedPromotion);
    }   catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui promosi', error });
    }
};

// DELETE promotion
exports.deletePromotion = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Promotion.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan' });
        }
        res.status(200).json({ message: 'Promosi berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus promosi', error });
    }
};
