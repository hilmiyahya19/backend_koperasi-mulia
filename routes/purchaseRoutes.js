const express = require('express');
const {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
} = require('../controllers/purchaseController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Hanya admin dan superAdmin yang boleh mengelola pembelian
router
    .route('/')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin']), getAllPurchases) // Admin & SuperAdmin bisa melihat semua pembelian
    .post(authenticateJWT, authorizeRole(['admin', 'superAdmin']), createPurchase); // Hanya Admin & SuperAdmin yang bisa menambah pembelian

router
    .route('/:id')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin', 'member']), getPurchaseById) // 🔹 Tambahkan route ini
    .put(authenticateJWT, authorizeRole(['admin', 'superAdmin']), updatePurchase) // Hanya Admin & SuperAdmin yang bisa memperbarui pembelian
    .delete(authenticateJWT, authorizeRole(['admin', 'superAdmin']), deletePurchase); // Hanya Admin & SuperAdmin yang bisa menghapus pembelian

module.exports = router;
