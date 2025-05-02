const express = require('express');
const {
    getAllFinances,
    getFinanceById,
    createFinance,
    updateFinance,
    deleteFinance
} = require('../controllers/financeController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin']), getAllFinances) // Ambil semua data keuangan (Admin & Super Admin)
    .post(authenticateJWT, authorizeRole(['admin', 'superAdmin']), createFinance); // Tambah data keuangan (Hanya Admin & Super Admin)

router
    .route('/:id')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin', 'member']), getFinanceById) // 🔹 Tambahkan route ini
    .put(authenticateJWT, authorizeRole(['admin', 'superAdmin']), updateFinance) // Perbarui data keuangan (Hanya Admin & Super Admin)
    .delete(authenticateJWT, authorizeRole(['admin', 'superAdmin']), deleteFinance); // Hapus data keuangan (Hanya Admin & Super Admin)

module.exports = router;
