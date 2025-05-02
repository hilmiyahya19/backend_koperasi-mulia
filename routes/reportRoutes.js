const express = require('express');
const { 
    getMemberStats,
    getSalesStats,
    getTopProducts,
    getFinanceStats
} = require('../controllers/reportController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Statistik Anggota
router.get('/members', authenticateJWT, authorizeRole(['admin', 'superAdmin']), getMemberStats);

// Statistik Penjualan
router.get('/sales', authenticateJWT, authorizeRole(['admin', 'superAdmin']), getSalesStats);

// Statistik Produk Terlaris
router.get('/top-products', authenticateJWT, authorizeRole(['admin', 'superAdmin']), getTopProducts);

// Statistik Keuangan
router.get('/finances', authenticateJWT, authorizeRole(['admin', 'superAdmin']), getFinanceStats);

module.exports = router;
