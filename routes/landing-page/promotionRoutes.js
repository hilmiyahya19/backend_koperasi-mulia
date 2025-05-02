const express = require('express');
const {
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
} = require('../../controllers/landing-page/promotionController');

const { authenticateJWT, authorizeRole } = require('../../middleware/authMiddleware');
const { uploadImage } = require('../../middleware/uploadMiddleware');

const router = express.Router();

// Public access (untuk landing page user)
router.get('/', getAllPromotions);
router.get('/:id', getPromotionById);

// Admin & superAdmin access only
router.post('/', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'), createPromotion);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'),updatePromotion);
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), deletePromotion);

module.exports = router;
