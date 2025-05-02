const express = require('express');
const {
    getAllMembers,
    getMemberSummary,
    getMemberById, // 🔥 Tambahan untuk detail member berdasarkan id
    createMember,
    updateMember,
    deleteMember,
} = require('../controllers/memberController');
const { login, register } = require('../controllers/memberAuthController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Login Member
router.post('/login', login);
  
// Register Member (User bisa register, tapi dapet status default: pending, bukan approved)
router.post('/register', register);

// Hanya admin yang boleh mengakses, memperbarui, dan menghapus member
router
    .route('/')
    .get(authenticateJWT, authorizeRole(['admin', 'member', 'superAdmin']), getAllMembers) // Admin dan member bisa melihat data member
    .post(authenticateJWT, authorizeRole(['admin', 'superAdmin']), createMember); // Admin hanya bisa membuat member baru

// 🔹 Endpoint untuk mendapatkan ringkasan member (Hanya ID & Nama)
router.get('/summary', authenticateJWT, authorizeRole(['admin', 'superAdmin']), getMemberSummary);

router
    .route('/:id')
    .get(authenticateJWT, authorizeRole(['admin', 'superAdmin', 'member']), getMemberById) // 🔹 Tambahkan route ini
    .put(authenticateJWT, authorizeRole(['admin', 'superAdmin']), updateMember) // Admin hanya bisa mengupdate member
    .delete(authenticateJWT, authorizeRole(['admin', 'superAdmin']), deleteMember); // Admin hanya bisa menghapus member

module.exports = router;
