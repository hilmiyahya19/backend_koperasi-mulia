const express = require('express');
const {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
} = require('../controllers/saleController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// 📌 Hanya admin & superAdmin yang bisa mengelola penjualan
router
    .route('/')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin']), getAllSales) // Mendapatkan semua penjualan
    .post(authenticateJWT, authorizeRole(['admin', 'superAdmin']), createSale); // Menambahkan penjualan baru

router
    .route('/:id')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin', 'member']), getSaleById) // 🔹 Tambahkan route ini
    .put(authenticateJWT, authorizeRole(['admin', 'superAdmin']), updateSale) // Memperbarui data penjualan
    .delete(authenticateJWT, authorizeRole(['admin', 'superAdmin']), deleteSale); // Menghapus penjualan

module.exports = router;
