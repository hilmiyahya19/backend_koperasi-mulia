const express = require('express');
const {
    getAllAdmins,
    getAdminById, // 🔹 Tambahkan fungsi baru
    createAdmin,
    updateAdmin,
    deleteAdmin
} = require('../controllers/adminController');
const { loginAdmin } = require('../controllers/adminAuthController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Login Admin
router.post('/login', loginAdmin);

// Hanya superAdmin yang boleh mengelola admin
router
    .route('/')
    .get(authenticateJWT, authorizeRole(['superAdmin']), getAllAdmins)
    .post(authenticateJWT, authorizeRole(['superAdmin']), createAdmin);

router
    .route('/:id')
    .get(authenticateJWT, authorizeRole(['superAdmin']), getAdminById) // 🔹 Tambahkan route ini
    .put(authenticateJWT, authorizeRole(['superAdmin']), updateAdmin)
    .delete(authenticateJWT, authorizeRole(['superAdmin']), deleteAdmin);

module.exports = router;
