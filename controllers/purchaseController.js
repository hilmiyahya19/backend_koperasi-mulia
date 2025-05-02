const Purchase = require('../models/purchase');
const Product = require('../models/product');

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('products.productId', 'name purchasePrice');
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pembelian', error });
    }
};

// GET purchase by ID
exports.getPurchaseById = async (req, res) => {
    const { id } = req.params;
    try {
        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
        }
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pembelian', error });
    }
};

exports.createPurchase = async (req, res) => {
    const { supplier, products, purchaseDate } = req.body;

    if (!supplier || !products || !Array.isArray(products) || products.length === 0 || !purchaseDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Validasi setiap item dalam produk
    for (const item of products) {
        if (!item.productId || !item.quantity || !item.purchasePrice) {
            return res.status(400).json({ message: "Produk harus memiliki productId, quantity, dan purchasePrice" });
        }
    }

    try {
        const purchase = new Purchase({ supplier, products });
        await purchase.save();
        
        // Update stok produk
        for (let item of products) {
            await Product.findByIdAndUpdate(item.productId, { 
                $inc: { stock: item.quantity },
                $set: { purchasePrice: item.purchasePrice } // update harga beli terakhir
            });
        }
        
        res.status(201).json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah pembelian', error });
    }
};

exports.updatePurchase = async (req, res) => {
    const { id } = req.params;
    const { supplier, products, purchaseDate } = req.body;

    if (!supplier || !products || !Array.isArray(products) || products.length === 0 || !purchaseDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Validasi setiap item dalam produk
    for (const item of products) {
        if (!item.productId || !item.quantity || !item.purchasePrice) {
            return res.status(400).json({ message: "Produk harus memiliki productId, quantity, dan purchasePrice" });
        }
    }

    try {
        const oldPurchase = await Purchase.findById(id);
        if (!oldPurchase) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
        
        // Kembalikan stok lama sebelum update
        for (let item of oldPurchase.products) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        
        const updatedPurchase = await Purchase.findByIdAndUpdate(id, { supplier, products }, { new: true });
        
        // Tambahkan stok dengan data baru
        for (let item of products) {
            await Product.findByIdAndUpdate(item.productId, { 
                $inc: { stock: item.quantity },
                $set: { purchasePrice: item.purchasePrice } // update harga beli terakhir
            });
        }
        
        res.status(200).json(updatedPurchase);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui pembelian', error });
    }
};

exports.deletePurchase = async (req, res) => {
    const { id } = req.params;
    try {
        const purchase = await Purchase.findById(id);
        if (!purchase) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
        
        // Kurangi stok sebelum menghapus
        for (let item of purchase.products) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        
        await Purchase.findByIdAndDelete(id);
        res.status(200).json({ message: 'Pembelian berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pembelian', error });
    }
};