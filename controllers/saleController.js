const mongoose = require('mongoose');
const Sale = require('../models/sale');
const Member = require('../models/member');
const Product = require('../models/product');

// ✅ Get all sales
exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('products.productId', 'name price');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data penjualan', error });
    }
};

// GET sale by ID
exports.getSaleById = async (req, res) => {
    const { id } = req.params;
    try {
        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ message: 'Data Penjualan tidak ditemukan' });
        }
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data penjualan', error });
    }
};

// ✅ Create Sale
exports.createSale = async (req, res) => {
    const { customer, products, saleDate } = req.body;

    if (!customer || !products || !Array.isArray(products) || products.length === 0 || !saleDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }
    
    // Validasi setiap item dalam produk
    for (const item of products) {
        if (!item.productId || !item.quantity || !item.price) {
            return res.status(400).json({ message: "Produk harus memiliki productId, quantity, dan price" });
        }
    }

    try {
        let customerData = customer;
        let isMember = false;

        // Cek apakah customer adalah member
        if (mongoose.Types.ObjectId.isValid(customer)) {
            const member = await Member.findById(customer);
            if (member) {
                isMember = true;
                customerData = member._id;
            }
        }

        // Kurangi stok produk berdasarkan jumlah yang dibeli
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Stok produk ${product.name} tidak mencukupi` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        // Buat transaksi baru
        const sale = new Sale({ customer: customerData, products, saleDate });
        await sale.save();

        // Jika customer adalah member, tambahkan transaksi ke riwayat anggota
        if (isMember) {
            await Member.findByIdAndUpdate(customerData, { $push: { transactionHistory: sale._id } }, { new: true });
        }

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan data penjualan', error: error.message });
    }
};

// ✅ Update Sale
exports.updateSale = async (req, res) => {
    const { id } = req.params;
    const { customer, products, saleDate } = req.body;

    if (!customer || !products || !Array.isArray(products) || products.length === 0 || !saleDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }
    
    // Validasi setiap item dalam produk
    for (const item of products) {
        if (!item.productId || !item.quantity || !item.price) {
            return res.status(400).json({ message: "Produk harus memiliki productId, quantity, dan price" });
        }
    }

    try {
        const existingSale = await Sale.findById(id);
        if (!existingSale) {
            return res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
        }

        let customerData = customer;
        let isMember = false; // tambah ini

        // Jika customer berupa ID, validasi apakah itu member
        if (mongoose.Types.ObjectId.isValid(customer)) {
            const member = await Member.findById(customer);
            if (member) {
                isMember = true; // tambah ini
                customerData = member._id;
            }
        }

        // Kembalikan stok produk lama sebelum diperbarui
        for (const item of existingSale.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity; // Kembalikan stok lama
                await product.save();
            }
        }

        // Kurangi stok berdasarkan produk yang baru
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Stok produk ${product.name} tidak mencukupi` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        // Update data penjualan
        const updatedSale = await Sale.findByIdAndUpdate(
            id,
            { customer: customerData, products, saleDate },
            { new: true, runValidators: true }
        );

        // if (!updatedSale) {
        //     return res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
        // }

        res.status(200).json(updatedSale);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui data penjualan', error: error.message });
    }
};

// ✅ Delete Sale
exports.deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
        }

        // Kembalikan stok produk sebelum transaksi dihapus
        for (const item of sale.products) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        await Sale.findByIdAndDelete(id);

        // 🔥 Hapus referensi transaksi dari semua member
        await Member.updateMany(
            { transactionHistory: id },
            { $pull: { transactionHistory: id } }
        );

        res.status(200).json({ message: 'Data penjualan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus data penjualan', error });
    }
};

